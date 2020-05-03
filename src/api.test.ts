import nock from 'nock';
import {
  createMagicLink,
  createIdAuthenticationSession,
  authenticate,
  fetchUser,
  AuthenticationMethod,
  updateUser,
  Sex,
  createUsers,
  fetchCountries,
  createSharingCodeForUserId,
  createAccessPass,
  fetchTest,
  fetchTests,
  fetchTestTypes,
  fetchRoles,
  createTest,
  createUser,
} from './api';

const ANY_HOST = /./;

describe('API client', () => {
  it('creates magic links', async () => {
    const body = { creationTime: new Date().toISOString(), active: true };
    nock(ANY_HOST)
      .post('/api/v1/auth/magic-links', { email: 'anEmail@example.com' })
      .reply(200, body);
    const result = await createMagicLink('anEmail@example.com');
    expect(result).toEqual(body);
  });

  it('creates id auth sessions', async () => {
    const body = { redirectUrl: 'https://example.com/redirect' };
    nock(ANY_HOST).post('/api/v1/auth/sessions').reply(200, body);
    const result = await createIdAuthenticationSession();
    expect(result).toEqual(body);
  });

  it('authenticates with the given method', async () => {
    const body = { token: 'some-token' };
    nock(ANY_HOST)
      .post('/api/v1/auth/login', { method: 'ESTONIAN_ID', authCode: 'some-auth-code' })
      .reply(200, body);
    const result = await authenticate(AuthenticationMethod.ESTONIAN_ID, 'some-auth-code');
    expect(result).toEqual('some-token');
  });

  describe('when authenticated', () => {
    it('fetches users', async () => {
      const body = {
        id: 'some-id',
        creationTime: new Date().toISOString(),
        email: 'anEmail@example.com',
      };
      nock(ANY_HOST)
        .get('/api/v1/users/some-id')
        .matchHeader('Authorization', 'Bearer some-token')
        .reply(200, body);
      const result = await fetchUser('some-id', { token: 'some-token' });
      expect(result).toEqual(body);
    });

    it('updates users', async () => {
      const requestBody = {
        id: 'some-id',
        creationTime: new Date().toISOString(),
        email: 'anEmail@example.com',
        profile: {
          firstName: 'Test',
          lastName: 'Name',
          sex: Sex.FEMALE,
          dateOfBirth: new Date().toISOString(),
        },
      };
      const responseBody = requestBody;
      nock(ANY_HOST)
        .patch('/api/v1/users/some-id', requestBody)
        .matchHeader('Authorization', 'Bearer some-token')
        .reply(200, responseBody);
      const result = await updateUser(requestBody, { token: 'some-token' });
      expect(result).toEqual(responseBody);
    });

    it('creates users', async () => {
      const requestBody = {
        authenticationDetails: {
          method: AuthenticationMethod.ESTONIAN_ID,
          identifier: '123321',
        },
      };

      const responseBody = {
        id: 'some-id',
        authenticationDetails: {
          method: AuthenticationMethod.ESTONIAN_ID,
          identifier: '123321',
        },
      };

      nock(ANY_HOST)
        .post('/api/v1/users', requestBody)
        .matchHeader('Authorization', 'Bearer some-token')
        .reply(201, responseBody);

      const result = await createUser(requestBody, { token: 'some-token' });
      expect(result).toEqual(responseBody);
    });

    it('creates users in bulk', async () => {
      const requestBody = [
        {
          roles: ['ADMIN', 'DOCTOR'],
          authenticationDetails: {
            method: AuthenticationMethod.MAGIC_LINK,
            identifier: 'anEmail@example.com',
          },
        },
        {
          roles: [],
          authenticationDetails: { method: AuthenticationMethod.ESTONIAN_ID, identifier: '123321' },
        },
      ];
      const responseBody = [
        {
          id: 'some-id',
          creationTime: new Date().toISOString(),
          email: 'anEmail@example.com',
        },
        {
          id: 'some-id',
          creationTime: new Date().toISOString(),
          email: null,
        },
      ];
      nock(ANY_HOST)
        .post('/api/v1/admin/users', requestBody)
        .matchHeader('Authorization', 'Bearer some-token')
        .reply(201, responseBody);
      const result = await createUsers(requestBody, { token: 'some-token' });
      expect(result).toEqual(responseBody);
    });

    it('fetches countries', async () => {
      const responseBody = [{ code: 'ET', name: 'Estonia' }];
      nock(ANY_HOST)
        .get('/api/v1/countries')
        .matchHeader('Authorization', 'Bearer some-token')
        .reply(200, responseBody);
      const result = await fetchCountries({ token: 'some-token' });
      expect(result).toEqual(responseBody);
    });

    it('creates sharing codes', async () => {
      const responseBody = { code: 'some-sharing-code', expiryTime: new Date().toISOString() };
      nock(ANY_HOST)
        .post('/api/v1/users/some-id/sharing-code')
        .matchHeader('Authorization', 'Bearer some-token')
        .reply(200, responseBody);
      const result = await createSharingCodeForUserId('some-id', { token: 'some-token' });
      expect(result).toEqual(responseBody);
    });

    it('creates access passes', async () => {
      const responseBody = { userId: 'some-user-id', expiryTime: new Date().toISOString() };
      nock(ANY_HOST)
        .post('/api/v1/users/some-user-id/access-passes', { code: 'pass-code' })
        .matchHeader('Authorization', 'Bearer some-token')
        .reply(200, responseBody);
      const result = await createAccessPass('some-user-id', 'pass-code', { token: 'some-token' });
      expect(result).toEqual(responseBody);
    });

    it('fetches a test', async () => {
      const responseBody = {
        id: 'test-id',
        userId: 'some-user-id',
        testType: 'some-test-type',
        creationTime: new Date().toISOString(),
      };
      nock(ANY_HOST)
        .get('/api/v1/tests/test-id')
        .matchHeader('Authorization', 'Bearer some-token')
        .reply(200, responseBody);
      const result = await fetchTest('test-id', { token: 'some-token' });
      expect(result).toEqual(responseBody);
    });

    it('fetches all tests belonging to a user', async () => {
      const responseBody = [
        {
          id: 'test-id',
          userId: 'some-user-id',
          testType: 'some-test-type',
          creationTime: new Date().toISOString(),
        },
      ];
      nock(ANY_HOST)
        .get('/api/v1/users/some-user-id/tests')
        .matchHeader('Authorization', 'Bearer some-token')
        .reply(200, responseBody);
      const result = await fetchTests('some-user-id', { token: 'some-token' });
      expect(result).toEqual(responseBody);
    });

    it('fetches test types', async () => {
      const responseBody = [
        {
          id: 'test-id',
          name: 'a test type',
          resultsSchema: {},
          neededPermissionToAddResults: 'some-permission',
        },
      ];
      nock(ANY_HOST)
        .get('/api/v1/test-types')
        .matchHeader('Authorization', 'Bearer some-token')
        .reply(200, responseBody);
      const result = await fetchTestTypes({ token: 'some-token' });
      expect(result).toEqual(responseBody);
    });

    it('creates tests', async () => {
      const requestBody = {
        testTypeId: 'some-test-type',
      };
      const responseBody = {
        id: 'test-id',
        userId: 'some-user-id',
        testType: 'some-test-type',
        creationTime: new Date().toISOString(),
      };
      nock(ANY_HOST)
        .post('/api/v1/users/some-user-id/tests', requestBody)
        .matchHeader('Authorization', 'Bearer some-token')
        .reply(200, responseBody);
      const result = await createTest('some-user-id', requestBody, { token: 'some-token' });
      expect(result).toEqual(responseBody);
    });

    it('fetches roles', async () => {
      const responseBody = [{ name: 'doctor', permissions: ['add_test'] }];
      nock(ANY_HOST)
        .get('/api/v1/roles')
        .matchHeader('Authorization', 'Bearer some-token')
        .reply(200, responseBody);
      const result = await fetchRoles({ token: 'some-token' });
      expect(result).toEqual(responseBody);
    });
  });
});
