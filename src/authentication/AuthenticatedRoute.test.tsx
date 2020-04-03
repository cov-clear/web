import React from 'react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { render, waitFor, screen } from '@testing-library/react';

import { useAuthentication } from './context';
import { AuthenticatedRoute } from './AuthenticatedRoute';

jest.mock('./context.tsx');
const useAuthenticationMock = useAuthentication as jest.MockedFunction<typeof useAuthentication>;

describe('Authenticated route', () => {
  let history: History;

  beforeEach(() => {
    history = createMemoryHistory();
    mockAuthenticated();

    render(
      <Router history={history}>
        <AuthenticatedRoute path="/private" exact>
          <h1>private page</h1>
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

  function mockAuthenticated() {
    useAuthenticationMock.mockImplementation(() => ({
      token: 'fake token',
      authenticate: jest.fn(),
      signOut: jest.fn(),
    }));
  }

  function mockSignedOut() {
    useAuthenticationMock.mockImplementation(() => ({
      token: null,
      authenticate: jest.fn(),
      signOut: jest.fn(),
    }));
  }
});
