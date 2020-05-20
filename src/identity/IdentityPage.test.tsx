import React from 'react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { act, waitFor, fireEvent, screen } from '@testing-library/react';
import MockDate from 'mockdate';
import { AxiosError } from 'axios';

import { IdentityPage } from './IdentityPage';

import {
  fetchUser,
  fetchTests,
  fetchTestTypes,
  updateUser,
  createSharingCodeForUserId,
  User,
  Sex,
  Test,
  TestType,
  Language,
  AuthenticationMethod,
} from '../api';
import { useAuthentication } from '../authentication';
import { useConfig } from '../common';
import { renderWrapped } from '../testHelpers';

jest.mock('qrcode.react', () => ({ value }: { value: string }) => `Mock QRCode: ${value}`);

jest.mock('../api');
jest.mock('../authentication');
jest.mock('../common', () => ({
  ...jest.requireActual('../common'),
  useConfig: jest.fn(),
}));

const fetchUserMock = fetchUser as jest.MockedFunction<typeof fetchUser>;
const updateUserMock = updateUser as jest.MockedFunction<typeof updateUser>;
const fetchTestsMock = fetchTests as jest.MockedFunction<typeof fetchTests>;
const fetchTestTypesMock = fetchTestTypes as jest.MockedFunction<typeof fetchTestTypes>;
const useAuthenticationMock = useAuthentication as jest.MockedFunction<typeof useAuthentication>;
const useConfigMock = useConfig as jest.MockedFunction<typeof useConfig>;
const createSharingCodeForUserIdMock = createSharingCodeForUserId as jest.MockedFunction<
  typeof createSharingCodeForUserId
>;

describe('Identity page', () => {
  let history: History;
  let userApi: MockUserApi;
  let signOut: jest.MockedFunction<() => any>;
  let rerender: any;

  beforeEach(() => {
    signOut = jest.fn();
    history = createMemoryHistory();
    userApi = new MockUserApi();
    fetchUserMock.mockImplementation(userApi.fetchUser.bind(userApi));
    updateUserMock.mockImplementation(userApi.updateUser.bind(userApi));
    useConfigMock.mockImplementation(() => ({
      defaultLanguage: Language.ENGLISH,
      preferredAuthMethod: AuthenticationMethod.MAGIC_LINK,
      addressRequired: true,
      appName: '',
    }));
    useAuthenticationMock.mockImplementation(() => ({
      token: userApi.mockToken,
      userId: 'mock-user',
      authenticate: jest.fn(),
      signOut,
      hasPermission: (key: string) =>
        key === 'mock-permission' || key === 'ADD_TAKE_HOME_TEST_RESULT',
    }));
    fetchTestsMock.mockImplementation(() => Promise.resolve([]));
    fetchTestTypesMock.mockImplementation(() => Promise.resolve([aNonPermittedTestType()]));
    createSharingCodeForUserIdMock.mockImplementation(async (userId, { token, cancelToken }) => {
      const user = await userApi.fetchUser(userId, { token });
      cancelToken?.throwIfRequested();
      if (user) {
        return { code: 'mock-sharing-code', expiryTime: secondsFromNow(30).toISOString() };
      }
      throw new Error('Unknown user');
    });

    rerender = renderWrapped(
      <Router history={history}>
        <Route path="/users/:userId">
          <IdentityPage />
        </Route>
      </Router>
    ).rerender;
  });

  afterEach(() => {
    MockDate.reset();
    jest.useRealTimers();
  });

  describe('when user has created a profile and address', () => {
    beforeEach(() => {
      userApi.updateUser(aUser(), { token: userApi.mockToken });
      history.push('/users/mock-user');
    });

    it('shows their name and date of birth', async () => {
      await waitFor(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(screen.queryByText(/1 Oct 1950/i)).toBeTruthy();
      expect(fetchUserMock).toHaveBeenCalledTimes(1);
    });

    it('loads and shows their sharing code in a qr code', async () => {
      await waitFor(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(
        screen.queryByText(/Mock QRCode: http:\/\/localhost\/scan\/mock-sharing-code/i)
      ).toBeInTheDocument();
    });

    it('automatically refreshes the sharing code when it is about to expire', async () => {
      jest.useFakeTimers();
      rerender(
        <Router history={history}>
          <Route path="/users/:userId">
            <IdentityPage />
          </Route>
        </Router>
      );
      await waitFor(() => expect(screen.queryByText(/first middle last/i)).toBeInTheDocument());
      expect(
        screen.queryByText(/Mock QRCode: http:\/\/localhost\/scan\/mock-sharing-code/i)
      ).toBeInTheDocument();
      createSharingCodeForUserIdMock.mockImplementation(async () => {
        return { code: 'mock-sharing-code-2', expiryTime: secondsFromNow(90).toISOString() };
      });
      expect(createSharingCodeForUserIdMock).toHaveBeenCalledTimes(1);
      await act(async () => {
        MockDate.set(secondsFromNow(29));
        jest.advanceTimersToNextTimer();
        await nextTick();
      });
      expect(createSharingCodeForUserIdMock).toHaveBeenCalledTimes(2);
      expect(
        screen.queryByText(/Mock QRCode: http:\/\/localhost\/scan\/mock-sharing-code-2/i)
      ).toBeInTheDocument();
      await act(async () => {
        MockDate.set(secondsFromNow(10));
        jest.advanceTimersToNextTimer();
        await nextTick();
      });
      expect(createSharingCodeForUserIdMock).toHaveBeenCalledTimes(2);
    });

    it('lets you switch to the tests tab', async () => {
      await waitFor(() =>
        expect(
          screen.queryByText(/Mock QRCode: http:\/\/localhost\/scan\/mock-sharing-code/i)
        ).toBeTruthy()
      );
      expect(screen.queryByText(/test results will appear here/i)).toBeFalsy();
      fireEvent.click(getTestResultsLink());
      await waitFor(() =>
        expect(screen.queryByText(/test results will appear here/i)).toBeTruthy()
      );
      expect(
        screen.queryByText(/Mock QRCode: http:\/\/localhost\/scan\/mock-sharing-code/i)
      ).toBeFalsy();
      fireEvent.click(getShareAccessLink());
      await waitFor(() =>
        expect(
          screen.queryByText(/Mock QRCode: http:\/\/localhost\/scan\/mock-sharing-code/i)
        ).toBeTruthy()
      );
      expect(screen.queryByText(/test results will appear here/i)).toBeFalsy();
    });

    it('shows all your tests on the tests tab with their interpretations', async () => {
      await waitFor(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      fetchTestsMock.mockImplementation(() => Promise.resolve([aTest(), anotherTest()]));
      fireEvent.click(getTestResultsLink());
      await waitFor(() => expect(screen.queryByText(/1 Oct 2005/i)).toBeTruthy());
      expect(screen.queryByText(/1 Nov 2005/i)).toBeTruthy();
      expect(screen.queryByText(/interpretation 1/i)).toBeInTheDocument();
      expect(screen.queryByText(/interpretation 2/i)).toBeInTheDocument();
    });

    it('lets you navigate to the test detail view', async () => {
      await waitFor(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      fetchTestsMock.mockImplementation(() => Promise.resolve([aTest(), anotherTest()]));
      fireEvent.click(getTestResultsLink());
      await waitFor(() => expect(screen.queryByText(/1 Oct 2005/i)).toBeTruthy());
      fireEvent.click(screen.queryByText(/1 Oct 2005/i)!);
      expect(history.location.pathname).toBe(`/tests/${aTest().id}`);
    });

    it('prompts you to go to the adding tests flow if you are permitted to run a test', async () => {
      await waitFor(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      fetchTestsMock.mockImplementation(() => Promise.resolve([aTest(), anotherTest()]));
      fireEvent.click(getTestResultsLink());
      await waitFor(() => expect(screen.queryByText(/1 Oct 2005/i)).toBeTruthy());
      expect(screen.queryByText(/add new test/i)).toBeNull();

      fetchTestTypesMock.mockImplementation(() => Promise.resolve([aTestType()]));
      fireEvent.click(getShareAccessLink());
      fireEvent.click(getTestResultsLink());
      await waitFor(() => expect(screen.queryByText(/add new test/i)).toBeTruthy());
      fireEvent.click(screen.getByText(/add new test/i));
      expect(history.location.pathname).toBe('/users/mock-user/add-test');
    });

    it('lets you navigate with browser history', async () => {
      await waitFor(() =>
        expect(
          screen.queryByText(/Mock QRCode: http:\/\/localhost\/scan\/mock-sharing-code/i)
        ).toBeTruthy()
      );
      fireEvent.click(getTestResultsLink());
      await waitFor(() =>
        expect(screen.queryByText(/test results will appear here/i)).toBeTruthy()
      );
      expect(
        screen.queryByText(/Mock QRCode: http:\/\/localhost\/scan\/mock-sharing-code/i)
      ).toBeFalsy();
      history.goBack();
      await waitFor(() =>
        expect(
          screen.queryByText(/Mock QRCode: http:\/\/localhost\/scan\/mock-sharing-code/i)
        ).toBeTruthy()
      );
      expect(screen.queryByText(/test results will appear here/i)).toBeFalsy();
      history.goForward();
      await waitFor(() =>
        expect(screen.queryByText(/test results will appear here/i)).toBeTruthy()
      );
      expect(
        screen.queryByText(/Mock QRCode: http:\/\/localhost\/scan\/mock-sharing-code/i)
      ).toBeFalsy();
    });

    it('lets you go to the scan page', async () => {
      await waitFor(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(history.location.pathname).not.toBe('/scan');
      fireEvent.click(screen.getByText(/scan another user/i));
      expect(history.location.pathname).toBe('/scan');
    });

    it('signs you out if you get a 401', async () => {
      await waitFor(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      fetchTestsMock.mockImplementation(() => {
        const error = new Error() as AxiosError;
        error.response = {
          status: 401,
        } as any;
        error.isAxiosError = true;
        return Promise.reject(error);
      });
      expect(signOut).not.toHaveBeenCalled();
      fireEvent.click(getTestResultsLink());
      await waitFor(() => expect(signOut).toHaveBeenCalled());
    });
  });

  describe('when the user is looking at another person', () => {
    beforeEach(() => {
      useAuthenticationMock.mockImplementation(() => ({
        token: userApi.mockToken,
        userId: 'mock-user-2',
        authenticate: jest.fn(),
        signOut,
        hasPermission: () => false,
      }));
      userApi.updateUser(aUser(), { token: userApi.mockToken });
      const user2 = aUser();
      user2.id = 'mock-user-2';
      userApi.updateUser(user2, { token: userApi.mockToken });
    });

    it('shows their name and date of birth', async () => {
      history.push('/users/mock-user');
      await waitFor(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(screen.queryByText(/1 Oct 1950/i)).toBeTruthy();
      expect(fetchUserMock).toHaveBeenCalledTimes(1);
    });

    it('shows a special header that you are looking at another person', async () => {
      history.push('/users/mock-user-2');
      await waitFor(() =>
        expect(screen.queryByText(/viewing another user's profile/i)).not.toBeInTheDocument()
      );
      history.push('/users/mock-user');
      await screen.findByText(/viewing another user's profile/i);
    });

    it('does not show their QR code', async () => {
      history.push('/users/mock-user');
      await waitFor(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(screen.queryByText(/Mock QRCode: mock-sharing-code/i)).not.toBeTruthy();
    });

    it('starts on the tests tab', async () => {
      history.push('/users/mock-user');
      await waitFor(() =>
        expect(screen.queryByText(/test results will appear here/i)).toBeTruthy()
      );
    });
  });

  describe('when address is not required', () => {
    beforeEach(() => {
      userApi.updateUser(aNewUserWithAProfile(), { token: userApi.mockToken });
      const originalConfValue = useConfigMock();
      useConfigMock.mockImplementation(() => ({ ...originalConfValue, addressRequired: false }));
      history.push('/users/mock-user');
    });

    it('does not require you to fill address', async () => {
      await waitFor(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(screen.queryByText(/enter your details/i)).toBeFalsy();
    });
  });

  describe('when filling address', () => {
    beforeEach(() => {
      userApi.updateUser(aNewUserWithAProfile(), { token: userApi.mockToken });
      history.push('/users/mock-user');
    });

    it('lets you fill your address with the correct information and then goes to your profile screen', async () => {
      await waitFor(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      expect(fetchUserMock).toHaveBeenCalledTimes(1);
      expect(screen.queryByText(/first middle last/i)).not.toBeTruthy();

      fillAddress();
      fireEvent.change(screen.getByLabelText(/address line 2/i), {
        target: { value: ' line 2  ' },
      });
      fireEvent.click(screen.getByText(/register/i));

      await waitFor(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(updateUserMock).toHaveBeenCalledWith(
        {
          ...aUser(),
          address: {
            ...aUser().address,
            address2: 'line 2',
          },
          creationTime: expect.any(String),
        },
        expect.anything()
      );
    });

    it('does not let you update while it is loading', async () => {
      await waitFor(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillAddress();
      fireEvent.click(screen.getByText(/register/i));
      fireEvent.click(screen.getByText(/register/i));
      fireEvent.click(screen.getByText(/register/i));
      fireEvent.click(screen.getByText(/register/i));
      fireEvent.click(screen.getByText(/register/i));
      await waitFor(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(updateUserMock).toHaveBeenCalledTimes(1);
    });

    it('lets you skip address line 2', async () => {
      await waitFor(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillAddress();
      fireEvent.click(screen.getByText(/register/i));

      await waitFor(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(updateUserMock).toHaveBeenCalledWith(
        {
          ...aUser(),
          creationTime: expect.any(String),
        },
        expect.anything()
      );
    });

    it('shows errors for missing line 1', async () => {
      await waitFor(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillAddress();
      fireEvent.change(screen.getByLabelText(/line 1/i), {
        target: { value: '  ' },
      });
      fireEvent.click(screen.getByText(/register/i));
      await waitFor(() => expect(screen.queryByText(/fill line 1/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('shows errors for missing city', async () => {
      await waitFor(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillAddress();
      fireEvent.change(screen.getByLabelText(/city/i), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByText(/register/i));
      await waitFor(() => expect(screen.queryByText(/fill the city/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('allows missing region', async () => {
      await waitFor(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillAddress();
      fireEvent.change(screen.getByLabelText(/state/i), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByText(/register/i));
      await waitFor(() => expect(screen.queryByText(/fill the state/i)).toBeFalsy());
      expect(updateUserMock).toHaveBeenCalled();
    });

    it('shows errors for missing postcode', async () => {
      await waitFor(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillAddress();
      fireEvent.change(screen.getByLabelText(/postcode/i), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByText(/register/i));
      await waitFor(() => expect(screen.queryByText(/fill the postcode/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('does not currently let you change country', async () => {
      await waitFor(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillAddress();
      fireEvent.change(screen.getByLabelText(/country/i), {
        target: { value: 'Estonia' },
      });
      expect((screen.getByLabelText(/country/i) as HTMLInputElement).value).toBe('United Kingdom');
      fireEvent.click(screen.getByText(/register/i));
      await waitFor(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(updateUserMock).toHaveBeenCalledWith(
        {
          ...aUser(),
          creationTime: expect.any(String),
        },
        expect.anything()
      );
    });
  });

  describe('when filling profile', () => {
    beforeEach(() => {
      userApi.updateUser(aNewUser(), { token: userApi.mockToken });
      history.push('/users/mock-user');
    });

    it('lets you fill your profile with the correct information and then goes to the next step', async () => {
      await waitFor(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      expect(fetchUserMock).toHaveBeenCalledTimes(1);
      expect(screen.queryByText(/2\/2/i)).not.toBeTruthy();

      fillProfileForm();
      fireEvent.click(screen.getByText(/next/i));

      await waitFor(() => expect(screen.queryByText(/2\/2/i)).toBeTruthy());
      expect(updateUserMock).toHaveBeenCalledWith(
        {
          ...aNewUserWithAProfile(),
          creationTime: expect.any(String),
        },
        expect.anything()
      );
    });

    it('does not let you update while it is loading', async () => {
      await waitFor(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillProfileForm();
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      fireEvent.click(screen.getByText(/next/i));
      await waitFor(() => expect(screen.queryByText(/2\/2/i)).toBeTruthy());
      expect(updateUserMock).toHaveBeenCalledTimes(1);
    });

    it('shows errors for missing first name', async () => {
      await waitFor(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillProfileForm();
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByText(/next/i));
      await waitFor(() => expect(screen.queryByText(/fill your first name/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('shows errors for missing last name', async () => {
      await waitFor(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fillProfileForm();
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: '' },
      });
      fireEvent.click(screen.getByText(/next/i));
      await waitFor(() => expect(screen.queryByText(/fill your last name/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('shows errors for missing sex', async () => {
      await waitFor(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: '  First Middle  ' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: '  Last  ' } });
      fireEvent.change(screen.getByLabelText(/date of birth/i), {
        target: { value: '1950-10-01' },
      });
      fireEvent.click(screen.getByText(/next/i));
      await waitFor(() => expect(screen.queryByText(/select your legal sex/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });

    it('shows errors for missing date of birth', async () => {
      await waitFor(() => expect(screen.queryByText(/enter your details/i)).toBeTruthy());
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: '  First Middle  ' },
      });
      fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: '  Last  ' } });
      fireEvent.click(screen.getByLabelText(/female/i));
      fireEvent.click(screen.getByText(/next/i));
      await waitFor(() => expect(screen.queryByText(/fill your date of birth/i)).toBeTruthy());
      expect(updateUserMock).not.toHaveBeenCalled();
    });
  });
});

function getTestResultsLink() {
  return screen.getByTestId('test-result-link');
}

function getShareAccessLink() {
  return screen.getByTestId('share-access-link');
}

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

function aTest(): Test {
  return {
    id: 'mock-test',
    userId: 'mock-id',
    testType: aTestType(),
    creationTime: new Date('2005-10-01').toISOString(),
    resultsInterpretations: [
      { name: 'Interpretation 1', theme: 'MUTED' },
      { name: 'Interpretation 2', theme: 'NEGATIVE' },
    ],
  };
}

function anotherTest(): Test {
  return {
    id: 'mock-test-2',
    userId: 'mock-id',
    testType: aTestType(),
    creationTime: new Date('2005-11-01').toISOString(),
  };
}

function aTestType(): TestType {
  return {
    id: 'mock-test-type',
    name: 'Mock test',
    neededPermissionToAddResults: 'mock-permission',
    resultsSchema: {
      type: 'object',
      title: 'Mock test',
      properties: {},
    },
  };
}

function aNonPermittedTestType(): TestType {
  return {
    id: 'mock-permitted-test-type',
    name: 'Mock test',
    neededPermissionToAddResults: 'mock-other-permission',
    resultsSchema: {
      type: 'object',
      title: 'Mock test',
      properties: {},
    },
  };
}

function secondsFromNow(seconds: number): Date {
  const time = new Date();
  time.setSeconds(time.getSeconds() + seconds);
  return time;
}

function nextTick() {
  return new Promise((resolve) => setImmediate(resolve));
}
