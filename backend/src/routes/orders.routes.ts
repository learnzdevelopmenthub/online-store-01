import { Router } from 'express';

import { createOrder, getOrders, webhookHandler } from '../controllers/orders.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const ordersRouter = Router();

// Public — Razorpay POSTs here directly; must NOT be behind requireAuth
ordersRouter.post('/webhook', webhookHandler);

// Protected routes
ordersRouter.use(requireAuth);
ordersRouter.post('/', createOrder);
ordersRouter.get('/', getOrders);
