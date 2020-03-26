import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';

import { LoginPage } from './LoginPage';

import { createMagicLink } from '../api';

jest.mock('../api');
const createMagicLinkMock = createMagicLink as jest.MockedFunction<typeof createMagicLink>;

describe('Login page', () => {
  beforeEach(() => {
    render(<LoginPage />);
    createMagicLinkMock.mockImplementation(() =>
      Promise.resolve({
        creationTime: new Date().toISOString(),
        active: true,
      }),
    );
  });

  it('creates a magic link to your email', async () => {
    expect(createMagicLink).not.toHaveBeenCalled();
    expect(screen.queryByText(/check your inbox/)).toBeNull();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'person@example.com' } });
    fireEvent.click(screen.getByText(/submit/i));
    expect(await screen.findByText(/check your inbox/)).not.toBeNull();
    expect(createMagicLink).toHaveBeenCalledWith('person@example.com');
  });

  it('does not let you input an invalid email', async () => {
    expect(screen.queryByText(/check your email/i)).toBeNull();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'person-example.com' } });
    fireEvent.click(screen.getByText(/submit/i));
    expect(await screen.findByText(/check your email/i)).not.toBeNull();
    expect(createMagicLink).not.toHaveBeenCalled();
  });

  it('does not let you sign in with a missing email', async () => {
    expect(screen.queryByText(/fill your email/i)).toBeNull();
    fireEvent.click(screen.getByText(/submit/i));
    expect(await screen.findByText(/fill your email/i)).not.toBeNull();
    expect(createMagicLink).not.toHaveBeenCalled();
  });

  it('does not let you sign in multiple times while loading', async () => {
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'person@example.com' } });
    fireEvent.click(screen.getByText(/submit/i));
    fireEvent.click(screen.getByText(/submit/i));
    fireEvent.click(screen.getByText(/submit/i));
    fireEvent.click(screen.getByText(/submit/i));
    expect(await screen.findByText(/check your inbox/)).not.toBeNull();
    expect(createMagicLink).toHaveBeenCalledWith('person@example.com');
    expect(createMagicLink).toHaveBeenCalledTimes(1);
  });
});
