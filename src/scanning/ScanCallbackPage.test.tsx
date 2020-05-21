import React from 'react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';
import { render, waitFor } from '@testing-library/react';
import nock from 'nock';

import { ScanCallbackPage } from '.';

jest.mock('../authentication', () => ({
  useAuthentication: () => ({
    userId: 'mock-user-id',
    token: 'some-token',
  }),
}));

const mockSharingCode = 'dca03948-51d0-4501-aabb-39bd08a0e60e';

describe('Scan callback page', () => {
  let history: History;
  beforeEach(() => {
    history = createMemoryHistory();
    render(
      <Router history={history}>
        <Route path="/scan-callback" exact>
          <ScanCallbackPage />
        </Route>
      </Router>
    );
  });

  it('creates and uses an access pass', async () => {
    nock(/./)
      .post('/api/v1/users/mock-user-id/access-passes', { code: mockSharingCode })
      .matchHeader('Authorization', 'Bearer some-token')
      .reply(201, { userId: 'mock-patient-id', expiryTime: new Date().toISOString() });

    history.push(`/scan-callback?sharingCode=${mockSharingCode}`);

    await waitFor(() => expect(history.location.pathname).toBe('/users/mock-patient-id'));
  });

  it('redirects to scan page when sharing code is invalid', async () => {
    history.push(`/scan-callback?sharingCode=wrong-code`);

    await waitFor(() => expect(history.location.pathname).toBe('/scan'));
  });

  it('redirects to scan page when creating access pass fails', async () => {
    nock(/./)
      .post('/api/v1/users/mock-user-id/access-passes', { code: mockSharingCode })
      .matchHeader('Authorization', 'Bearer some-token')
      .reply(400);

    history.push(`/scan-callback?sharingCode=${mockSharingCode}`);

    await waitFor(() => expect(history.location.pathname).toBe('/scan'));
  });
});
