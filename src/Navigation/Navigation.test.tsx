import React, { ReactNode } from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import { createMemoryHistory, MemoryHistory } from 'history';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import decodeToken from 'jwt-decode';

import { renderWrapped } from '../testHelpers';
import { Navigation } from '.';
import { Provider as AuthenticationProvider, AuthenticatedRoute } from '../authentication';
import { PERMISSIONS_REQUIRED_FOR_ADD_TEST_TO_IDENTIFIER_PAGE } from '../paths';

jest.mock('jwt-decode');

describe(Navigation, () => {
  afterEach(() => {
    window.localStorage.removeItem('token');
  });

  it('logs out and deletes token from local storage log out is clicked', async () => {
    window.localStorage.setItem('token', 'some-token');
    (decodeToken as jest.Mock).mockImplementation((token) =>
      token === 'some-token' ? { userId: 'some-user-id', roles: [], permissions: [] } : {}
    );

    const history = createMemoryHistory();
    renderWithRouterAndAuthentication(
      <>
        <Navigation />
        <Switch>
          <Route path="/login">Login</Route>
          <AuthenticatedRoute path="/some-path">Some page</AuthenticatedRoute>
        </Switch>
      </>,
      history
    );

    history.push('/some-path');
    expect(screen.getByText('Some page')).toBeInTheDocument();

    const logoutButton = screen.getByRole('link', { name: 'Log out' });
    userEvent.click(logoutButton);

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(window.localStorage.getItem('token')).toBeNull();
  });

  it('only shows navigation links for the pages user has permissions for', async () => {
    window.localStorage.setItem('token', 'some-token');
    (decodeToken as jest.Mock).mockImplementation((token) =>
      token === 'some-token'
        ? {
            userId: 'some-user-id',
            roles: [],
            permissions: PERMISSIONS_REQUIRED_FOR_ADD_TEST_TO_IDENTIFIER_PAGE,
          }
        : {}
    );

    renderWithRouterAndAuthentication(<Navigation />);

    expect(screen.getByRole('link', { name: 'Add test' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Create users' })).not.toBeInTheDocument();
  });

  function renderWithRouterAndAuthentication(
    element: ReactNode,
    history: MemoryHistory = createMemoryHistory()
  ) {
    renderWrapped(
      <AuthenticationProvider>
        <Router history={history}>{element}</Router>
      </AuthenticationProvider>
    );
  }
});
