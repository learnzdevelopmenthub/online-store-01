import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Book } from '../../src/models/Book.model.js';
import { Order } from '../../src/models/Order.model.js';
import { StoreSettings } from '../../src/models/StoreSettings.model.js';
import { User } from '../../src/models/User.model.js';

const sendMail = vi.hoisted(() => vi.fn(async () => ({ messageId: 'mail_123' })));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail })),
  },
}));

import { sendContactMessage, sendOrderConfirmation } from '../../src/services/email.service.js';

beforeEach(() => {
  sendMail.mockClear();
});

describe('email.service', () => {
  it('sends order confirmation with order id, books, total, and configured template', async () => {
    await StoreSettings.create({
      storeName: 'GetzMyBook',
      contactEmail: 'support@test.local',
      emailTemplate: 'Your books are ready now.',
    });
    const buyer = await User.create({
      fullName: 'Buyer One',
      email: 'buyer@test.local',
      role: 'buyer',
    });
    const book = await Book.create({
      title: 'Email Book',
      author: 'Author',
      description: 'A book',
      category: 'Technology',
      price: 12300,
      coverImageKey: 'covers/email.webp',
      pdfKey: 'pdfs/email.pdf',
      isPublished: true,
    });
    const order = await Order.create({
      buyer: buyer._id,
      books: [{ book: book._id, price: 12300 }],
      totalAmount: 12300,
      razorpayOrderId: 'rzp_email',
      status: 'paid',
    });

    await sendOrderConfirmation(buyer, order.toObject(), [{ title: book.title, price: 12300 }]);

    expect(sendMail).toHaveBeenCalledTimes(1);
    const payload = sendMail.mock.calls[0]?.[0] as { to: string; subject: string; html: string };
    expect(payload.to).toBe('buyer@test.local');
    expect(payload.subject).toContain(order._id.toString());
    expect(payload.html).toContain('Your books are ready now.');
    expect(payload.html).toContain('Email Book');
    expect(payload.html).toContain('/library');
  });

  it('sends contact messages to the configured support email', async () => {
    await StoreSettings.create({
      storeName: 'GetzMyBook',
      contactEmail: 'support@test.local',
      emailTemplate: 'Ready.',
    });

    await sendContactMessage('Buyer One', 'buyer@test.local', 'Download help', 'Please help me.');

    const payload = sendMail.mock.calls[0]?.[0] as { to: string; replyTo: string; subject: string };
    expect(payload.to).toBe('support@test.local');
    expect(payload.replyTo).toBe('buyer@test.local');
    expect(payload.subject).toBe('Contact: Download help');
  });
});
