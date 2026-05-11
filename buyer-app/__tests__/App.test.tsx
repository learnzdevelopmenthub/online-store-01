import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import App from '../src/App.tsx';

describe('<App />', () => {
  it('renders the Buyer App heading without crashing', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /buyer app/i })).toBeInTheDocument();
  });
});
