import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { EstonianIdLoginPage } from './EstonianIdLoginPage';

import { createIdAuthenticationSession } from '../api';
import { renderWrapped } from '../testHelpers';

jest.mock('../api');
const createIdAuthenticationSessionMock = createIdAuthenticationSession as jest.MockedFunction<
  typeof createIdAuthenticationSession
>;

describe('Estonian ID login page', () => {
  beforeEach(() => {
    // jsdom does not implement navigation, except for hash change, so we have to mock and edit window.location with this workaround
    delete window.location;
    window.location = ({ assign: jest.fn() } as any) as Location;
    renderWrapped(<EstonianIdLoginPage />);
    createIdAuthenticationSessionMock.mockImplementation(() =>
      Promise.resolve({
        redirectUrl: 'https://example.com/redirect',
      })
    );
  });

  it('creates an authentication session and redirects you to the redirect url', async () => {
    expect(createIdAuthenticationSessionMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText(/sign in via/i));
    expect(createIdAuthenticationSessionMock).toHaveBeenCalled();
    await waitFor(() =>
      expect(window.location.assign).toHaveBeenCalledWith('https://example.com/redirect')
    );
  });

  it('does not let you sign in multiple times while loading', async () => {
    fireEvent.click(screen.getByText(/sign in via/i));
    fireEvent.click(screen.getByText(/sign in via/i));
    fireEvent.click(screen.getByText(/sign in via/i));
    fireEvent.click(screen.getByText(/sign in via/i));
    await waitFor(() =>
      expect(window.location.assign).toHaveBeenCalledWith('https://example.com/redirect')
    );
    expect(createIdAuthenticationSession).toHaveBeenCalledTimes(1);
    expect(window.location.assign).toHaveBeenCalledTimes(1);
  });
});
