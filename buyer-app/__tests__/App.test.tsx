import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import App from '../src/App.tsx';

describe('<App />', () => {
  it('renders the catalogue home page without crashing', async () => {
    render(<App />);

    expect(
      await screen.findByRole('heading', { name: /digital pdf bookstore/i }),
    ).toBeInTheDocument();
  });
});
