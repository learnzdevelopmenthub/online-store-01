import { createHmac } from 'node:crypto';

import Razorpay from 'razorpay';

import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

let client: Razorpay | null = null;

function requireConfig() {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new AppError(500, 'Razorpay configuration missing: RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET');
  }
  return { keyId: env.RAZORPAY_KEY_ID, keySecret: env.RAZORPAY_KEY_SECRET };
}

function getClient(): Razorpay {
  if (!client) {
    const config = requireConfig();
    client = new Razorpay({ key_id: config.keyId, key_secret: config.keySecret });
  }
  return client;
}

export async function createRazorpayOrder(amountInPaise: number): Promise<{
  id: string;
  amount: number;
  currency: string;
}> {
  const rzp = getClient();
  const order = await rzp.orders.create({ amount: amountInPaise, currency: 'INR' });
  return { id: order.id, amount: Number(order.amount), currency: order.currency };
}

export function verifyWebhookSignature(rawBody: Buffer | string, signature: string): boolean {
  const secret = env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new AppError(500, 'Razorpay webhook secret missing');
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  return expected === signature;
}

export async function createRefund(
  paymentId: string,
  amountInPaise: number,
): Promise<unknown> {
  return getClient().payments.refund(paymentId, { amount: amountInPaise });
}
