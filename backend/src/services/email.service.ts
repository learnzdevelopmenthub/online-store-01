import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer/index.js';

import { env } from '../config/env.js';
import type { BookDoc } from '../models/Book.model.js';
import type { IOrder } from '../models/Order.model.js';
import type { IUser } from '../models/User.model.js';
import { AppError } from '../utils/AppError.js';
import { getStoreSettings } from './settings.service.js';

let transporter: Mail | null = null;

function formatPaise(value: number): string {
  return `INR ${Math.round(value / 100).toLocaleString('en-IN')}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function requireSmtpConfig() {
  const missing = [
    ['SMTP_HOST', env.SMTP_HOST],
    ['SMTP_USER', env.SMTP_USER],
    ['SMTP_PASS', env.SMTP_PASS],
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new AppError(500, `SMTP configuration missing: ${missing.join(', ')}`);
  }

  return {
    host: env.SMTP_HOST as string,
    port: env.SMTP_PORT,
    user: env.SMTP_USER as string,
    pass: env.SMTP_PASS as string,
  };
}

function getTransporter(): Mail {
  if (!transporter) {
    const config = requireSmtpConfig();
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: { user: config.user, pass: config.pass },
    });
  }
  return transporter;
}

export async function sendOrderConfirmation(
  buyer: Pick<IUser, 'email' | 'fullName'>,
  order: IOrder & { _id?: unknown },
  books: Array<Pick<BookDoc, 'title'> & { price: number }>,
): Promise<void> {
  const settings = await getStoreSettings();
  const libraryUrl = `${env.BUYER_APP_URL.replace(/\/$/, '')}/library`;
  const orderId = String(order._id ?? order.razorpayOrderId);

  const bookItems = books
    .map(
      (book) =>
        `<li>${escapeHtml(book.title)} - <strong>${escapeHtml(formatPaise(book.price))}</strong></li>`,
    )
    .join('');

  const html = `
    <div>
      <h1>${escapeHtml(settings.storeName)} order confirmation</h1>
      <p>Hello ${escapeHtml(buyer.fullName)},</p>
      <p>${escapeHtml(settings.emailTemplate)}</p>
      <p><strong>Order ID:</strong> ${escapeHtml(orderId)}</p>
      <ul>${bookItems}</ul>
      <p><strong>Total:</strong> ${escapeHtml(formatPaise(order.totalAmount))}</p>
      <p><a href="${escapeHtml(libraryUrl)}">Open My Library</a></p>
    </div>
  `;

  await getTransporter().sendMail({
    from: settings.contactEmail,
    to: buyer.email,
    subject: `Order confirmation ${orderId}`,
    html,
  });
}

export async function sendContactMessage(
  name: string,
  email: string,
  subject: string,
  message: string,
): Promise<void> {
  const settings = await getStoreSettings();
  const to = settings.contactEmail || env.ADMIN_EMAIL;
  const html = `
    <div>
      <h1>New contact message</h1>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
    </div>
  `;

  await getTransporter().sendMail({
    from: to,
    replyTo: email,
    to,
    subject: `Contact: ${subject}`,
    html,
  });
}
