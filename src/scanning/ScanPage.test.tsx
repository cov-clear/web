import React from 'react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { wait, render, fireEvent, screen } from '@testing-library/react';
import QRReader from 'react-qr-reader';

import { ScanPage } from './ScanPage';

import { createAccessPass, AccessPass } from '../api';
import { useAuthentication } from '../authentication';
import { act } from 'react-dom/test-utils';

jest.mock('../api');
jest.mock('../authentication');
jest.mock('react-qr-reader', () => jest.fn());
jest.useFakeTimers();

const useAuthenticationMock = useAuthentication as jest.MockedFunction<typeof useAuthentication>;
const createAccessPassMock = createAccessPass as jest.MockedFunction<typeof createAccessPass>;

const mockToken = 'mock-token';
const mockUser = 'mock-user';
const mockSharingCode = 'dca03948-51d0-4501-aabb-39bd08a0e60e';

describe('Identity page', () => {
  let history: History;
  let mockScan: (data: string | null) => any;

  beforeEach(() => {
    history = createMemoryHistory();
    createAccessPassMock.mockImplementation(async () => ({
      userId: 'mock-patient-id',
      expiryTime: new Date().toISOString(),
    }));
    useAuthenticationMock.mockImplementation(() => ({
      token: mockToken,
      userId: mockUser,
      authenticate: jest.fn(),
      signOut: jest.fn(),
    }));
    (QRReader as any).mockImplementation(({ onScan }: { onScan: (data: string | null) => any }) => {
      mockScan = (data: string | null) => act(() => onScan(data));
      return <div id="mock-qr-code" />;
    });

    render(
      <Router history={history}>
        <ScanPage />
      </Router>,
    );
  });

  it('scans a sharing code, creates and uses a sharing pass for it', async () => {
    expect(history.location.pathname).not.toBe('/users/mock-user');
    await mockScan(mockSharingCode);
    expect(history.location.pathname).toBe('/users/mock-patient-id');
    expect(createAccessPassMock).toHaveBeenCalledTimes(1);
    expect(createAccessPassMock).toHaveBeenCalledWith(mockUser, mockSharingCode, {
      token: mockToken,
    });
  });

  it('does not try to create access passes for invalid sharing codes', async () => {
    await mockScan('wrong-data');
    await mockScan(null);
    expect(createAccessPassMock).not.toHaveBeenCalled();
  });

  it('shows errors for incorrect codes', async () => {
    expect(screen.queryByText(/incorrect/i)).not.toBeTruthy();
    await mockScan('wrong-data');
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

