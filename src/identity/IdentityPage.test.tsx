import React from 'react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { wait, render, fireEvent, screen } from '@testing-library/react';

import { IdentityPage } from './IdentityPage';

import { fetchUser, updateUser, createSharingCodeForUserId, User, Sex } from '../api';
import { useAuthentication } from '../authentication';

jest.mock('qrcode.react', () => ({ value }: { value: string }) => `Mock QRCode: ${value}`);

jest.mock('../api');
jest.mock('../authentication');

const fetchUserMock = fetchUser as jest.MockedFunction<typeof fetchUser>;
const updateUserMock = updateUser as jest.MockedFunction<typeof updateUser>;
const useAuthenticationMock = useAuthentication as jest.MockedFunction<typeof useAuthentication>;
const createSharingCodeForUserIdMock = createSharingCodeForUserId as jest.MockedFunction<
  typeof createSharingCodeForUserId
>;

describe('Identity page', () => {
  let history: History;
  let userApi: MockUserApi;

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
    createSharingCodeForUserIdMock.mockImplementation(async (userId, { token }) => {
      const user = await userApi.fetchUser(userId, { token });
      if (user) {
        return { code: 'mock-sharing-code', expiryTime: new Date().toISOString() };
      }
      throw new Error('Unknown user');
    });

    render(
      <Router history={history}>
        <Route path="/users/:userId">
          <IdentityPage />
        </Route>
      </Router>,
    );
  });

  describe('when user has created a profile and address', () => {
    beforeEach(() => {
      userApi.updateUser(aUser(), { token: userApi.mockToken });
      history.push('/users/mock-user');
    });

    it('shows their name and date of birth', async () => {
      await wait(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(screen.queryByText(/01\/10\/1950/i)).toBeTruthy();
      expect(fetchUserMock).toHaveBeenCalledTimes(1);
    });

    it('loads and shows their sharing code in a qr code', async () => {
      await wait(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(screen.queryByText(/Mock QRCode: mock-sharing-code/i)).toBeTruthy();
    });

    it('lets you switch to the tests tab', async () => {
      await wait(() => expect(screen.queryByText(/Mock QRCode: mock-sharing-code/i)).toBeTruthy());
      expect(screen.queryByText(/tests will be shown here/i)).toBeFalsy();
      fireEvent.click(screen.getByText(/tests/i));
      await wait(() => expect(screen.queryByText(/tests will be shown here/i)).toBeTruthy());
      expect(screen.queryByText(/Mock QRCode: mock-sharing-code/i)).toBeFalsy();
      fireEvent.click(screen.getByText(/profile/i));
      await wait(() => expect(screen.queryByText(/Mock QRCode: mock-sharing-code/i)).toBeTruthy());
      expect(screen.queryByText(/tests will be shown here/i)).toBeFalsy();
    });

    it('lets you navigate with browser history', async () => {
      await wait(() => expect(screen.queryByText(/Mock QRCode: mock-sharing-code/i)).toBeTruthy());
      fireEvent.click(screen.getByText(/tests/i));
      await wait(() => expect(screen.queryByText(/tests will be shown here/i)).toBeTruthy());
      expect(screen.queryByText(/Mock QRCode: mock-sharing-code/i)).toBeFalsy();
      history.goBack();
      await wait(() => expect(screen.queryByText(/Mock QRCode: mock-sharing-code/i)).toBeTruthy());
      expect(screen.queryByText(/tests will be shown here/i)).toBeFalsy();
      history.goForward();
      await wait(() => expect(screen.queryByText(/tests will be shown here/i)).toBeTruthy());
      expect(screen.queryByText(/Mock QRCode: mock-sharing-code/i)).toBeFalsy();
    });

    it('lets you go to the scan page', async () => {
      await wait(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(history.location.pathname).not.toBe('/scan');
      fireEvent.click(screen.getByText(/scan/i));
      expect(history.location.pathname).toBe('/scan');
    });
  });

  describe('when filling address', () => {
    beforeEach(() => {
      userApi.updateUser(aNewUserWithAProfile(), { token: userApi.mockToken });
      history.push('/users/mock-user');
    });

    it('lets you fill your address with the correct information and then goes to your profile screen', async () => {
      await wait(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      expect(fetchUserMock).toHaveBeenCalledTimes(1);
      expect(screen.queryByText(/first middle last/i)).not.toBeTruthy();

      fillAddress();
      fireEvent.change(screen.getByLabelText(/address line 2/i), {
        target: { value: ' line 2  ' },
      });
      fireEvent.click(screen.getByText(/register/i));

      await wait(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(updateUserMock).toHaveBeenCalledWith(
        {
          ...aUser(),
          address: {
            ...aUser().address,
            address2: 'line 2',
          },
          creationTime: expect.any(String),
        },
        expect.anything(),
      );
    });

    it('does not let you update while it is loading', async () => {
      await wait(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillAddress();
      fireEvent.click(screen.getByText(/register/i));
      fireEvent.click(screen.getByText(/register/i));
      fireEvent.click(screen.getByText(/register/i));
      fireEvent.click(screen.getByText(/register/i));
      fireEvent.click(screen.getByText(/register/i));
      await wait(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(updateUserMock).toHaveBeenCalledTimes(1);
    });

    it('lets you skip address line 2', async () => {
      await wait(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillAddress();
      fireEvent.click(screen.getByText(/register/i));

      await wait(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(updateUserMock).toHaveBeenCalledWith(
        {
          ...aUser(),
          creationTime: expect.any(String),
        },
        expect.anything(),
      );
    });

    it('shows errors for missing line 1', async () => {
      await wait(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillAddress();
      fireEvent.change(screen.getByLabelText(/line 1/i), {
        target: { value: '  ' },
      });
      fireEvent.click(screen.getByText(/register/i));
      await wait(() => expect(screen.queryByText(/fill line 1/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('shows errors for missing city', async () => {
      await wait(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillAddress();
      fireEvent.change(screen.getByLabelText(/city/i), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByText(/register/i));
      await wait(() => expect(screen.queryByText(/fill the city/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('allows missing region', async () => {
      await wait(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillAddress();
      fireEvent.change(screen.getByLabelText(/state/i), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByText(/register/i));
      await wait(() => expect(screen.queryByText(/fill the state/i)).toBeFalsy());
      expect(updateUserMock).toHaveBeenCalled();
    });

    it('shows errors for missing postcode', async () => {
      await wait(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillAddress();
      fireEvent.change(screen.getByLabelText(/postcode/i), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByText(/register/i));
      await wait(() => expect(screen.queryByText(/fill the postcode/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('does not currently let you change country', async () => {
      await wait(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillAddress();
      fireEvent.change(screen.getByLabelText(/country/i), {
        target: { value: 'Estonia' },
      });
      expect((screen.getByLabelText(/country/i) as HTMLInputElement).value).toBe('United Kingdom');
      fireEvent.click(screen.getByText(/register/i));
      await wait(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(updateUserMock).toHaveBeenCalledWith(
        {
          ...aUser(),
          creationTime: expect.any(String),
        },
        expect.anything(),
      );
    });
  });

  describe('when filling profile', () => {
    beforeEach(() => {
      userApi.updateUser(aNewUser(), { token: userApi.mockToken });
      history.push('/users/mock-user');
    });

    it('lets you fill your profile with the correct information and then goes to the next step', async () => {
      await wait(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      expect(fetchUserMock).toHaveBeenCalledTimes(1);
      expect(screen.queryByText(/2\/2/i)).not.toBeTruthy();

      fillProfileForm();
      fireEvent.click(screen.getByText(/next/i));

      await wait(() => expect(screen.queryByText(/2\/2/i)).toBeTruthy());
      expect(updateUserMock).toHaveBeenCalledWith(
        {
          ...aNewUserWithAProfile(),
          creationTime: expect.any(String),
        },
        expect.anything(),
      );
    });

    it('does not let you update while it is loading', async () => {
      await wait(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillProfileForm();
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      await wait(() => expect(screen.queryByText(/2\/2/i)).toBeTruthy());
      expect(updateUserMock).toHaveBeenCalledTimes(1);
    });

    it('shows errors for missing first name', async () => {
      await wait(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillProfileForm();
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByText(/next/i));
      await wait(() => expect(screen.queryByText(/fill your first name/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('shows errors for missing last name', async () => {
      await wait(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillProfileForm();
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByText(/next/i));
      await wait(() => expect(screen.queryByText(/fill your last name/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('shows errors for missing sex', async () => {
      await wait(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: '  First Middle  ' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: '  Last  ' } });
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: '1950-10-01' },
      });
      fireEvent.click(screen.getByText(/next/i));
      await wait(() => expect(screen.queryByText(/select your legal sex/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('shows errors for missing date of birth', async () => {
      await wait(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: '  First Middle  ' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: '  Last  ' } });
      fireEvent.click(screen.getByLabelText(/female/i));
      fireEvent.click(screen.getByText(/next/i));
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

function fillAddress() {
  fireEvent.change(screen.getByLabelText(/address line 1/i), {
    target: { value: '  56 Shoreditch High st  ' },
  });
  fireEvent.change(screen.getByLabelText(/city/i), { target: { value: '  London  ' } });
  fireEvent.change(screen.getByLabelText(/state/i), { target: { value: '  London  ' } });
  fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: ' E16JJ  ' } });
  fireEvent.click(screen.getByLabelText(/postcode/i));
}

class MockUserApi {
  private users: Map<string, User> = new Map();
  public readonly mockToken: string = 'mockToken';

  async fetchUser(id: string, { token }: { token: string }): Promise<User> {
    if (token !== this.mockToken) {
      throw new Error('Wrong token');
    }
    return this.users.get(id)!;
  }

  async updateUser(user: User, { token }: { token: string }): Promise<User> {
    if (token !== this.mockToken) {
      throw new Error('Wrong token');
    }
    this.users.set(user.id, { ...user });
    return this.users.get(user.id)!;
  }
}

function aUser(): User {
  return {
    id: 'mock-user',
    email: 'mock@example.com',
    creationTime: new Date().toISOString(),
    profile: {
      firstName: 'First Middle',
      lastName: 'Last',
      dateOfBirth: '1950-10-01',
      sex: Sex.FEMALE,
    },
    address: {
      address1: '56 Shoreditch High st',
      region: 'London',
      city: 'London',
      postcode: 'E16JJ',
      countryCode: 'GB',
    },
  };
}

function aNewUser(): User {
  return {
    id: 'mock-user',
    email: 'mock@example.com',
    creationTime: new Date().toISOString(),
  };
}

function aNewUserWithAProfile(): User {
  return {
    id: 'mock-user',
    email: 'mock@example.com',
    creationTime: new Date().toISOString(),
    profile: {
      firstName: 'First Middle',
      lastName: 'Last',
      dateOfBirth: '1950-10-01',
      sex: Sex.FEMALE,
    },
  };
}
