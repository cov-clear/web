import React from 'react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { render, waitFor } from '@testing-library/react';

import { AuthenticationCallbackPage } from './AuthenticationCallbackPage';

import { authenticate, AuthenticationMethod } from '../api';
import { useAuthentication } from './context';

jest.mock('../api');
jest.mock('./context.tsx');
const authenticateMock = authenticate as jest.MockedFunction<typeof authenticate>;
const useAuthenticationMock = useAuthentication as jest.MockedFunction<typeof useAuthentication>;

const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmOTljOTc5MC1mMTM3LTQwNGYtOWJmMS0yNDNkNmUzZTZmM2UiLCJyb2xlcyI6W10sImV4cGlyYXRpb24iOiIyMDIwLTA0LTExVDA5OjQzOjQ4LjU3OFoiLCJpYXQiOjE1ODUzODg2Mjh9.aR6OQclIZXYu6DklXt2aLBlZA0NvhXOxOjJvKXvG4M8';

// has user id of f99c9790-f137-404f-9bf1-243d6e3e6f3e

describe('Link page', () => {
  let history: History;
  let saveToken: (token: string) => any;

  const authCode = 'i-am-an-auth-code';

  beforeEach(() => {
    history = createMemoryHistory();
    saveToken = jest.fn();
    useAuthenticationMock.mockImplementation(() => ({
      authenticate: saveToken,
      token: null,
      signOut: jest.fn(),
      hasPermission: () => false,
    }));

    render(
      <Router history={history}>
        <Route path="/authentication-callback" exact>
          <AuthenticationCallbackPage />
        </Route>
      </Router>
    );
  });

  describe('when a valid token is supplied', () => {
    beforeEach(() => {
      authenticateMock.mockImplementation(() => Promise.resolve(mockToken));
    });

    it('exchanges the auth code for the token and saves the token when using magic link', async () => {
      history.push(`/authentication-callback?method=MAGIC_LINK&authCode=${authCode}`);
      await waitFor(() => expect(saveToken).toHaveBeenCalledWith(mockToken));
      expect(saveToken).toHaveBeenCalledTimes(1);
      expect(authenticate).toHaveBeenCalledWith(
        AuthenticationMethod.MAGIC_LINK,
        authCode,
        expect.anything()
      );
      expect(authenticate).toHaveBeenCalledTimes(1);
    });

    it('exchanges the session token for the token and saves the token when using estonian id auth', async () => {
      const sessionToken = 'i-am-a-session-token';
      history.push(`/authentication-callback?method=ESTONIAN_ID&session_token=${sessionToken}`);
      await waitFor(() => expect(saveToken).toHaveBeenCalledWith(mockToken));
      expect(saveToken).toHaveBeenCalledTimes(1);
      expect(authenticate).toHaveBeenCalledWith(
        AuthenticationMethod.ESTONIAN_ID,
        sessionToken,
        expect.anything()
      );
      expect(authenticate).toHaveBeenCalledTimes(1);
    });

    it('replaces the route with the user page, removing it from history', async () => {
      history.push(`/authentication-callback?method=MAGIC_LINK&authCode=${authCode}`);
      await waitFor(() => expect(history.location.pathname).toBe('/profile'));
      history.goBack();
      expect(history.location.pathname).toBe('/');
    });

    it('should redirect to the login page if parameters are missing', async () => {
      history.push(`/authentication-callback?method=MAGIC_LINK&session_token=${authCode}`);
      await waitFor(() => {
        expect(history.location.pathname).toBe('/login');
        expect(history.location.search).toBe('?invalid=true');
      });
    });
  });

  describe('when an invalid token is supplied', () => {
    beforeEach(() => {
      authenticateMock.mockImplementation(() => Promise.reject());
      history.push(`/authentication-callback?method=MAGIC_LINK&authCode=${authCode}`);
    });

    it('should redirect to the login page', async () => {
      await waitFor(() => {
        expect(history.location.pathname).toBe('/login');
        expect(history.location.search).toBe('?invalid=true');
      });
    });
  });
});
