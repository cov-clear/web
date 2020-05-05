import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';

import { LoginPage } from './LoginPage';
import { createIdAuthenticationSession, AuthenticationMethod, Language } from '../api';
import { useConfig } from '../common';
import { renderWrapped } from '../testHelpers';

jest.mock('../api');
jest.mock('../common');
const createIdAuthenticationSessionMock = createIdAuthenticationSession as jest.MockedFunction<
  typeof createIdAuthenticationSession
>;
const useConfigMock = useConfig as jest.MockedFunction<typeof useConfig>;

describe('Estonian ID login page', () => {
  let history;
  beforeEach(async () => {
    history = createMemoryHistory();
    // jsdom does not implement navigation, except for hash change, so we have to mock and edit window.location with this workaround
    delete window.location;
    window.location = ({ assign: jest.fn() } as any) as Location;
    useConfigMock.mockImplementation(() => ({
      authenticationMethod: AuthenticationMethod.ESTONIAN_ID,
      defaultLanguage: Language.ENGLISH,
      addressRequired: false,
    }));
    renderWrapped(
      <Router history={history}>
        <Route path="/login">
          <LoginPage />
        </Route>
      </Router>
    );
    createIdAuthenticationSessionMock.mockResolvedValue({
      redirectUrl: 'https://example.com/redirect',
    });
    history.push('/login');
    await screen.findAllByText(/sign in/i);
  });

  it('shows if authentication failed', async () => {
    expect(screen.queryByText(/authentication failed/i)).toBeFalsy();
    history.push('/login?invalid=true');
    await waitFor(() => expect(screen.queryByText(/authentication failed/i)).toBeTruthy());
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
