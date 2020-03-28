import React from 'react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { wait, render, fireEvent, screen } from '@testing-library/react';

import { IdentityPage } from './IdentityPage';

import { fetchUser, updateUser, User, Sex } from '../api';
import { useAuthentication } from '../authentication';

jest.mock('../api');
jest.mock('../authentication');
const fetchUserMock = fetchUser as jest.MockedFunction<typeof fetchUser>;
const updateUserMock = updateUser as jest.MockedFunction<typeof updateUser>;
const useAuthenticationMock = useAuthentication as jest.MockedFunction<typeof useAuthentication>;

describe('Identity page', () => {
  let history;
  let userApi;
  let debug;

  beforeEach(() => {
    history = createMemoryHistory();
    userApi = new MockUserApi();
    fetchUserMock.mockImplementation(userApi.fetchUser.bind(userApi));
    updateUserMock.mockImplementation(userApi.updateUser.bind(userApi));
    useAuthenticationMock.mockImplementation(() => ({
      token: userApi.mockToken,
      authenticate: jest.fn(),
      signOut: jest.fn(),
    }));

    debug = render(
      <Router history={history}>
        <Route path="/users/:userId">
          <IdentityPage />
        </Route>
      </Router>,
    ).debug;
  });

  describe('when profile exists', () => {
    beforeEach(() => {
      userApi.updateUser(
        {
          id: 'mock-user',
          email: 'mock@example.com',
          creationTime: new Date().toISOString(),
          profile: {
            firstName: 'First Middle',
            lastName: 'Last',
            dateOfBirth: '1950-10-01',
            sex: Sex.FEMALE,
          },
          address: null,
        },
        { token: userApi.mockToken },
      );
      history.push('/users/mock-user');
    });

    it('shows their name, date of birth, and contact information', async () => {
      await wait(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(screen.queryByText(/mock@example.com/i)).toBeTruthy();
      expect(screen.queryByText(/01\/10\/1950/i)).toBeTruthy();
      expect(fetchUserMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('when filling profile', () => {
    beforeEach(() => {
      userApi.updateUser(
        {
          id: 'mock-user',
          email: 'mock@example.com',
          creationTime: new Date().toISOString(),
          profile: null,
          address: null,
        },
        { token: userApi.mockToken },
      );
      history.push('/users/mock-user');
    });

    it('lets you fill your profile with the correct information and then shows it', async () => {
      await wait(() => expect(screen.queryByText(/fill your identity/i)).toBeTruthy());
      expect(fetchUserMock).toHaveBeenCalledTimes(1);
      expect(screen.queryByText(/first middle last/i)).not.toBeTruthy();

      fillProfileForm();
      fireEvent.click(screen.getByText(/submit/i));

      await wait(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(screen.queryByText(/mock@example.com/i)).toBeTruthy();
      expect(screen.queryByText(/01\/10\/1950/i)).toBeTruthy();
    });

    it('does not let you update while it is loading', async () => {
      await wait(() => expect(screen.queryByText(/fill your identity/i)).toBeTruthy());
      fillProfileForm();
      fireEvent.click(screen.getByText(/submit/i));
      fireEvent.click(screen.getByText(/submit/i));
      fireEvent.click(screen.getByText(/submit/i));
      fireEvent.click(screen.getByText(/submit/i));
      fireEvent.click(screen.getByText(/submit/i));
      await wait(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(updateUserMock).toHaveBeenCalledTimes(1);
    });

    it('shows errors for missing first name', async () => {
      await wait(() => expect(screen.queryByText(/fill your identity/i)).toBeTruthy());
      fillProfileForm();
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByText(/submit/i));
      await wait(() => expect(screen.queryByText(/fill your first name/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('shows errors for missing last name', async () => {
      await wait(() => expect(screen.queryByText(/fill your identity/i)).toBeTruthy());
      fillProfileForm();
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByText(/submit/i));
      await wait(() => expect(screen.queryByText(/fill your last name/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('shows errors for missing sex', async () => {
      await wait(() => expect(screen.queryByText(/fill your identity/i)).toBeTruthy());
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: '  First Middle  ' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: '  Last  ' } });
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: '1950-10-01' },
      });
      fireEvent.click(screen.getByText(/submit/i));
      await wait(() => expect(screen.queryByText(/select your legal sex/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('shows errors for missing date of birth', async () => {
      await wait(() => expect(screen.queryByText(/fill your identity/i)).toBeTruthy());
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: '  First Middle  ' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: '  Last  ' } });
      fireEvent.click(screen.getByLabelText(/female/i));
      fireEvent.click(screen.getByText(/submit/i));
      await wait(() => expect(screen.queryByText(/fill your date of birth/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });
  });
});

function fillProfileForm() {
  fireEvent.change(screen.getByLabelText(/first name/i), {
    target: { value: '  First Middle  ' },
  });
  fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: '  Last  ' } });
  fireEvent.click(screen.getByLabelText(/female/i));
  fireEvent.change(screen.getByLabelText(/date of birth/i), {
    target: { value: '1950-10-01' },
  });
}

class MockUserApi {
  private users: Map<string, User> = new Map();
  public readonly mockToken: string = 'mockToken';

  async fetchUser(id: string, { token }: { token: string }) {
    if (token !== this.mockToken) {
      throw new Error('Wrong token');
    }
    return this.users.get(id);
  }

  async updateUser(user: User, { token }: { token: string }) {
    if (token !== this.mockToken) {
      throw new Error('Wrong token');
    }
    this.users.set(user.id, { ...user });
    return this.users.get(user.id);
  }
}
