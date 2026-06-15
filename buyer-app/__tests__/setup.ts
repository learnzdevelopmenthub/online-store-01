import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from '../src/mocks/server.ts';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// With Vitest `globals: false`, RTL does not auto-register cleanup — do it manually.
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
