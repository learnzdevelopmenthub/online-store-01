export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'buyer' | 'admin';
        email: string;
      };
    }
  }
}
