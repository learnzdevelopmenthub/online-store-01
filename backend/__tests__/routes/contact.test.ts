import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '../../src/app.js';

vi.mock('../../src/services/email.service.js', () => ({
  sendContactMessage: vi.fn(async () => undefined),
  sendOrderConfirmation: vi.fn(async () => undefined),
}));

import * as emailService from '../../src/services/email.service.js';

const app = createApp();

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/contact', () => {
  it('sends a contact message for valid input', async () => {
    const res = await request(app).post('/api/contact').send({
      name: 'Buyer One',
      email: 'buyer@test.local',
      subject: 'Download help',
      message: 'Please help with my download limit.',
    });

    expect(res.status).toBe(200);
    expect(emailService.sendContactMessage).toHaveBeenCalledWith(
      'Buyer One',
      'buyer@test.local',
      'Download help',
      'Please help with my download limit.',
    );
  });

  it('returns 400 for invalid input', async () => {
    const res = await request(app).post('/api/contact').send({
      name: '',
      email: 'not-an-email',
      subject: '',
      message: 'short',
    });

    expect(res.status).toBe(400);
    expect(emailService.sendContactMessage).not.toHaveBeenCalled();
  });
});
