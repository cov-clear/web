import React from 'react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { render, wait } from '@testing-library/react';

import { LinkPage } from './LinkPage';

import { authenticate } from '../api';
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

  const linkId = 'i-am-a-link';

  beforeEach(() => {
    history = createMemoryHistory();
    saveToken = jest.fn();
    useAuthenticationMock.mockImplementation(() => ({
      authenticate: saveToken,
      token: null,
      signOut: jest.fn(),
    }));

    render(
      <Router history={history}>
        <Route path="/link/:linkId">
          <LinkPage />
        </Route>
      </Router>
    );
  });

  describe('when a valid token is supplied', () => {
    beforeEach(() => {
      authenticateMock.mockImplementation(() => Promise.resolve(mockToken));
      history.push(`/link/${linkId}`);
    });

    it('exchanges the link for the token and saves the token', async () => {
      await wait(() => expect(saveToken).toHaveBeenCalledWith(mockToken));
      expect(saveToken).toHaveBeenCalledTimes(1);
      expect(authenticate).toHaveBeenCalledWith(linkId, expect.anything());
      expect(authenticate).toHaveBeenCalledTimes(1);
    });

    it('replaces the route with the user page, removing it from history', async () => {
      await wait(() =>
        expect(history.location.pathname).toBe('/users/f99c9790-f137-404f-9bf1-243d6e3e6f3e')
      );
      history.goBack();
      expect(history.location.pathname).toBe('/');
    });
  });

  describe('when an invalid token is supplied', () => {
    beforeEach(() => {
      authenticateMock.mockImplementation(() => Promise.reject());
      history.push(`/link/${linkId}`);
    });

    it('should redirect to the login page', async () => {
      await wait(() => {
        expect(history.location.pathname).toBe('/login');
        expect(history.location.search).toBe('?invalid=true');
      });
    });
  });
});
