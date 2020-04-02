import React from 'react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { wait, render, screen, fireEvent } from '@testing-library/react';

import { AddTestPage } from './AddTestPage';

import { fetchUser, fetchTestTypes, User, Sex, TestType, createTest, fetchCountries } from '../api';
import { useAuthentication } from '../authentication';

jest.mock('../api');
jest.mock('../authentication');

const fetchUserMock = fetchUser as jest.MockedFunction<typeof fetchUser>;
const fetchTestTypesMock = fetchTestTypes as jest.MockedFunction<typeof fetchTestTypes>;
const fetchCountriesMock = fetchCountries as jest.MockedFunction<typeof fetchCountries>;
const createTestMock = createTest as jest.MockedFunction<typeof createTest>;
const useAuthenticationMock = useAuthentication as jest.MockedFunction<typeof useAuthentication>;

describe('Test adding page', () => {
  let history: History;

  beforeEach(() => {
    history = createMemoryHistory();
    fetchUserMock.mockImplementation(() => Promise.resolve(aUser()));
    useAuthenticationMock.mockImplementation(() => ({
      token: 'mock-token',
      userId: 'mock-user',
      authenticate: jest.fn(),
      signOut: jest.fn(),
      hasPermission: (key: string) => key === 'mock-permission',
    }));
    fetchTestTypesMock.mockImplementation(() =>
      Promise.resolve([aSimpleTestType(), aTestType(), aNonPermittedTestType()])
    );
    fetchCountriesMock.mockImplementation(() =>
      Promise.resolve([
        { code: 'GB', name: 'United Kingdom' },
        { code: 'EE', name: 'Estonia' },
      ])
    );

    render(
      <Router history={history}>
        <Route path="/users/:userId/add-test">
          <AddTestPage />
        </Route>
      </Router>
    );
  });

  describe('when testing yourself', () => {
    it('lets you add a test result', async () => {
      history.push('/users/mock-user/add-test');
      await wait(() => expect(screen.queryByText(/test type/i)).toBeTruthy());
      expect(createTestMock).not.toHaveBeenCalled();
      fireEvent.change(screen.queryByLabelText(/test type/i), {
        target: { value: aTestType().id },
      });
      fireEvent.click(screen.queryByLabelText(/boolean field/i));
      fireEvent.change(screen.queryByLabelText(/string field/i), {
        target: { value: 'string value' },
      });
      fireEvent.change(screen.queryByLabelText(/number field/i), {
        target: { value: '42' },
      });
      fireEvent.change(screen.queryByLabelText(/additional notes/i), {
        target: { value: 'some free text notes' },
      });
      fireEvent.click(screen.queryByText(/save/i));
      await wait(() => expect(history.location.pathname).toBe('/users/mock-user/tests'));
      expect(createTestMock).toHaveBeenCalledTimes(1);
      expect(createTestMock).toHaveBeenCalledWith(
        'mock-user',
        {
          testTypeId: 'mock-test-type',
          results: {
            details: {
              bool: true,
              string: 'string value',
              number: 42,
            },
            notes: 'some free text notes',
          },
        },
        expect.objectContaining({ token: 'mock-token' })
      );
    });

    it('does not let you select non-permitted test types', async () => {
      history.push('/users/mock-user/add-test');
      await wait(() => expect(screen.queryByText(/test type/i)).toBeTruthy());
      expect(screen.queryByText(/proper mock test/i)).toBeTruthy();
      expect(screen.queryByText(/simple mock test/i)).toBeTruthy();
      expect(screen.queryByText(/non-permitted mock test/i)).toBeFalsy();
      fireEvent.change(screen.queryByLabelText(/test type/i), {
        target: { value: aNonPermittedTestType().id },
      });
      expect(screen.queryByText(/non-permitted mock test/i)).toBeFalsy();
    });

    it('does not show the test type selector if you can only select one type of test', async () => {
      fetchTestTypesMock.mockImplementation(() =>
        Promise.resolve([aTestType(), aNonPermittedTestType()])
      );
      history.push('/users/mock-user/add-test');
      await wait(() => expect(screen.queryByText(/boolean/i)).toBeTruthy());
      expect(screen.queryByText(/test type/i)).not.toBeTruthy();
    });

    it('shows descriptions of properties if they exist', async () => {
      history.push('/users/mock-user/add-test');
      await wait(() => expect(screen.queryByText(/this is a description/i)).toBeTruthy());
    });
  });

  describe('when testing someone else', () => {
    it('shows you a special header to show you are looking at a patient', async () => {
      history.push('/users/mock-user/add-test');
      await wait(() => expect(screen.queryByText(/test type/i)).toBeTruthy());
      expect(screen.queryByText(/patient profile/i)).not.toBeTruthy();
      history.push('/users/mock-patient/add-test');
      await wait(() => expect(screen.queryByText(/patient profile/i)).toBeTruthy());
    });

    it('asks you to confirm their identity and then submits the test', async () => {
      history.push('/users/mock-patient/add-test');
      await wait(() => expect(screen.queryByText(/test type/i)).toBeTruthy());
      fireEvent.change(screen.queryByLabelText(/test type/i), {
        target: { value: aSimpleTestType() },
      });
      fireEvent.click(screen.queryByLabelText(/boolean field/i));
      fireEvent.click(screen.queryByText(/save/i));
      await wait(() => expect(screen.queryByText(/first middle last/i)).toBeTruthy());
      expect(createTestMock).not.toHaveBeenCalled();
      expect(history.location.pathname).toBe('/users/mock-patient/add-test/confirm');
      expect(screen.queryByText(/01\/10\/1950/i)).toBeTruthy();
      expect(screen.queryByText(/56 Shoreditch High st/i)).toBeTruthy();
      expect(screen.queryAllByText(/London/i).length).toBe(2);
      expect(screen.queryByText(/E16JJ/i)).toBeTruthy();
      expect(screen.queryByText(/United Kingdom/i)).toBeTruthy();
      fireEvent.click(screen.queryByText(/confirm patient/i));

      expect(createTestMock).toHaveBeenCalledTimes(1);
      expect(createTestMock).toHaveBeenCalledWith(
        'mock-patient',
        {
          testTypeId: 'simple-mock-test-type',
          results: {
            details: {
              bool: true,
            },
            notes: '',
          },
        },
        expect.objectContaining({ token: 'mock-token' })
      );
    });
  });
});

function aUser(): User {
  return {
    id: 'mock-patient',
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

function aTestType(): TestType {
  return {
    id: 'mock-test-type',
    name: 'Proper mock test',
    neededPermissionToAddResults: 'mock-permission',
    resultsSchema: {
      type: 'object',
      title: 'Proper mock test',
      properties: {
        bool: {
          title: 'Boolean field',
          type: 'boolean',
        },
        number: {
          title: 'Number field',
          type: 'number',
        },
        string: {
          title: 'String field',
          type: 'string',
        },
      },
    },
  };
}

function aSimpleTestType(): TestType {
  return {
    id: 'simple-mock-test-type',
    name: 'Simple mock test',
    neededPermissionToAddResults: 'mock-permission',
    resultsSchema: {
      type: 'object',
      title: 'Simple mock test',
      properties: {
        bool: {
          title: 'Boolean field',
          type: 'boolean',
          description: 'this is a description',
        },
      },
    },
  };
}

function aNonPermittedTestType(): TestType {
  return {
    id: 'permission-test-type',
    name: 'Non-permitted mock test',
    neededPermissionToAddResults: 'not-permitted',
    resultsSchema: {
      type: 'object',
      title: 'Simple mock test',
      properties: {
        bool: {
          title: 'Boolean field',
          type: 'boolean',
        },
      },
    },
  };
}
