import React from 'react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { waitFor, screen } from '@testing-library/react';

import { renderWrapped } from '../testHelpers';
import { useAuthentication } from './context';
import { AuthenticatedRoute } from './AuthenticatedRoute';

jest.mock('./context.tsx');
const useAuthenticationMock = useAuthentication as jest.MockedFunction<typeof useAuthentication>;

describe('Authenticated route', () => {
  let history: History;

  beforeEach(() => {
    history = createMemoryHistory();
    mockAuthenticated();

    renderWrapped(
      <Router history={history}>
        <AuthenticatedRoute path="/private" exact>
          <h1>private page</h1>
        </AuthenticatedRoute>

        <AuthenticatedRoute path="/protected" requiredPermission="MOCK_PERMISSION" exact>
          <h1>protected page</h1>
        </AuthenticatedRoute>

        <Route path="/login" exact>
          <h1>login page</h1>
        </Route>
      </Router>
    );
  });

  it('lets you use the route when you are authenticated', async () => {
    mockAuthenticated();
    history.push('/private');
    await waitFor(() => expect(screen.queryByText(/private/)).not.toBeNull());
    expect(screen.queryByText(/login/)).toBeNull();
    expect(history.location.pathname).toBe('/private');
  });

  it('redirects you to login if you are not authenticated', async () => {
    mockSignedOut();
    history.push('/private');
    await waitFor(() => expect(screen.queryByText(/login/)).not.toBeNull());
    expect(screen.queryByText(/private/)).toBeNull();
    expect(history.location.pathname).toBe('/login');
    history.goBack();
    expect(history.location.pathname).toBe('/');
  });

  it('displays not found page when user does not have the required permission', async () => {
    mockAuthenticated([]);
    history.push('/protected');
    await waitFor(() => expect(screen.getByText(/doesn't exist/)).toBeInTheDocument());
    expect(screen.queryByText(/protected/)).toBeNull();
  });

  it('displays protected content when user does has the required permission', async () => {
    mockAuthenticated(['MOCK_PERMISSION']);
    history.push('/protected');
    await waitFor(() => expect(screen.getByText(/protected/)).toBeInTheDocument());
    expect(screen.queryByText(/doesn't exist/)).toBeNull();
  });

  function mockAuthenticated(permissions: string[] = []) {
    useAuthenticationMock.mockImplementation(() => ({
      token: 'fake token',
      authenticate: jest.fn(),
      signOut: jest.fn(),
      hasPermission: (permission: string) => permissions.includes(permission),
    }));
  }

  function mockSignedOut() {
    useAuthenticationMock.mockImplementation(() => ({
      token: null,
      authenticate: jest.fn(),
      signOut: jest.fn(),
      hasPermission: () => false,
    }));
  }
});
