import React from 'react';
import { Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import { screen } from '@testing-library/react';
import QRReader from 'react-qr-reader';
import { createMemoryHistory, History } from 'history';

import { ScanPage } from './ScanPage';

import { useAuthentication } from '../authentication';
import { renderWrapped } from '../testHelpers';
import nock from 'nock';

jest.mock('../authentication');
jest.mock('react-qr-reader', () => jest.fn());
jest.useFakeTimers();

const useAuthenticationMock = useAuthentication as jest.MockedFunction<typeof useAuthentication>;

const mockToken = 'mock-token';
const mockUser = 'mock-user';
const mockSharingCode = 'dca03948-51d0-4501-aabb-39bd08a0e60e';

describe('Identity page', () => {
  let history: History;
  let mockScan: (data: string | null) => any;

  beforeEach(() => {
    history = createMemoryHistory();
    useAuthenticationMock.mockImplementation(() => ({
      token: mockToken,
      userId: mockUser,
      authenticate: jest.fn(),
      signOut: jest.fn(),
      hasPermission: () => true,
    }));
    (QRReader as any).mockImplementation(({ onScan }: { onScan: (data: string | null) => any }) => {
      mockScan = (data: string | null) => act(() => onScan(data));
      return <div id="mock-qr-code" />;
    });

    renderWrapped(
      <Router history={history}>
        <ScanPage />
      </Router>
    );
  });

  it('scans a sharing code, creates and uses a sharing pass for it', async () => {
    nock(/./)
      .post('/api/v1/users/mock-user/access-passes', { code: mockSharingCode })
      .matchHeader('Authorization', `Bearer ${mockToken}`)
      .reply(200, { userId: 'mock-patient-id', expiryTime: new Date().toISOString() });
    expect(history.location.pathname).not.toBe('/users/mock-user');
    await mockScan(mockSharingCode);
    expect(history.location.pathname).toBe('/users/mock-patient-id');
  });

  it('does not try to create access passes for invalid sharing codes', async () => {
    const scope = nock(/./).post('/api/v1/users/mock-user/access-passes').reply(500);
    await mockScan('wrong-data');
    await mockScan(null);
    expect(scope.isDone()).toBe(false);
  });

  it('shows errors for incorrect codes', async () => {
    expect(screen.queryByText(/incorrect/i)).not.toBeTruthy();
    await mockScan('wrong-data');
    expect(screen.queryByText(/incorrect/i)).toBeTruthy();
  });

  it('shows errors when backend fails to create an access pass', async () => {
    nock(/./)
      .post('/api/v1/users/mock-user/access-passes', { code: mockSharingCode })
      .matchHeader('Authorization', `Bearer ${mockToken}`)
      .reply(400);
    expect(screen.queryByText(/incorrect/i)).not.toBeTruthy();
    await mockScan(mockSharingCode);
    expect(screen.queryByText(/incorrect/i)).toBeTruthy();
  });

  it('clears errors after a time', async () => {
    await mockScan('wrong-data');
    expect(screen.queryByText(/incorrect/i)).toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(screen.queryByText(/incorrect/i)).not.toBeTruthy();
  });
});
