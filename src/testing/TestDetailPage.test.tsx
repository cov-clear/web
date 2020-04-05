import React from 'react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { render, screen, waitFor } from '@testing-library/react';

import { TestDetailPage } from './TestDetailPage';

import { fetchTest, Test, TestType } from '../api';
import { useAuthentication } from '../authentication';

jest.mock('../api');
jest.mock('../authentication');

const fetchTestMock = fetchTest as jest.MockedFunction<typeof fetchTest>;
const useAuthenticationMock = useAuthentication as jest.MockedFunction<typeof useAuthentication>;

describe('Test detail page', () => {
  let history: History;

  beforeEach(() => {
    history = createMemoryHistory();
    useAuthenticationMock.mockImplementation(() => ({
      token: 'mock-token',
      userId: 'mock-user',
      authenticate: jest.fn(),
      signOut: jest.fn(),
      hasPermission: (key: string) => key === 'mock-permission',
    }));
    fetchTestMock.mockImplementation(() => Promise.resolve(aTest()));

    render(
      <Router history={history}>
        <Route path="/tests/:testId">
          <TestDetailPage />
        </Route>
      </Router>
    );
  });

  it('shows when the test was taken', async () => {
    history.push('/tests/mock-test');
    await waitFor(() => expect(screen.queryByText(/test result/i)).toBeTruthy());
    expect(screen.queryByText(/1 oct 2005/i)).toBeTruthy();
    expect(fetchTestMock).toHaveBeenCalledWith(
      'mock-test',
      expect.objectContaining({ token: 'mock-token' })
    );
  });

  it('shows the test type taken', async () => {
    history.push('/tests/mock-test');
    await waitFor(() => expect(screen.queryByText(/test result/i)).toBeTruthy());
    expect(screen.queryByText(/Mock test/i)).toBeTruthy();
  });

  it('shows the interpretations of the test', async () => {
    history.push('/tests/mock-test');
    await waitFor(() => expect(screen.queryByText(/test result/i)).toBeInTheDocument());
    expect(screen.queryByText(/interpretation 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/interpretation 2/i)).toBeInTheDocument();
  });

  it('shows the notes of the test', async () => {
    history.push('/tests/mock-test');
    await waitFor(() => expect(screen.queryByText(/test result/i)).toBeTruthy());
    expect(screen.queryByText(/some notes/i)).toBeTruthy();
  });

  it('shows the results of the test', async () => {
    history.push('/tests/mock-test');
    await waitFor(() => expect(screen.queryByText(/test result/i)).toBeTruthy());
    expect(screen.queryByText(/a positive value/i)).toBeTruthy();
    expect(screen.queryByText(/yes/i)).toBeTruthy();
    expect(screen.queryByText(/a string value/i)).toBeTruthy();
    expect(screen.queryByText(/text/i)).toBeTruthy();
    expect(screen.queryByText(/a number value/i)).toBeTruthy();
    expect(screen.queryByText(/42/i)).toBeTruthy();
  });
});

function aTest(): Test {
  return {
    id: 'mock-test',
    userId: 'mock-id',
    testType: aTestType(),
    creationTime: new Date('2005-10-01').toISOString(),
    results: {
      notes: 'some notes',
      testerUserId: 'mock-tester',
      creationTime: new Date('2010-10-01').toISOString(),
      details: {
        pos: true,
        str: 'text',
        num: 42,
      },
    },
    resultsInterpretations: [
      { name: 'Interpretation 1', theme: 'MUTED' },
      { name: 'Interpretation 2', theme: 'NEGATIVE' },
    ],
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
      properties: {
        pos: {
          title: 'a positive value',
          type: 'boolean',
        },
        str: {
          title: 'a string value',
          type: 'string',
        },
        num: {
          title: 'a number value',
          type: 'number',
        },
      },
    },
  };
}
