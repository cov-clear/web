import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock, { Scope } from 'nock';

import { BulkUserCreationPage } from '.';
import { useAuthentication } from '../authentication/context';
import { User, AuthenticationMethod, Config, Language } from '../api';
import { renderWrapped } from '../testHelpers';
import { useConfig } from '../common/useConfig';

jest.mock('../authentication/context');
jest.mock('../common/useConfig');

const { MAGIC_LINK, ESTONIAN_ID } = AuthenticationMethod;

describe('Bulk user creation page', () => {
  beforeEach(() => {
    mockAuthentication();
    mockWindowConfirm();
  });

  afterEach(jest.resetAllMocks);

  it('creates users with emails from comma-separated input and selected role and shows a success or error message', async () => {
    mockConfig(MAGIC_LINK);

    mockHttp()
      .get('/api/v1/roles')
      .reply(200, [
        { name: 'USER', permissions: [] },
        { name: 'DOCTOR', permissions: [] },
      ]);

    renderWrapped(<BulkUserCreationPage />);

    const textarea = screen.getByRole('textbox');
    const roleSelect = screen.getByRole('combobox');
    const submit = () => userEvent.click(screen.getByRole('button'));

    await screen.findByText('USER');

    submit();
    // nothing is posted, as no emails are put in
    await screen.findByText(/please fill the email/i);

    userEvent.type(textarea, '  jane.doe@ example.com  \n,john.doe@gmail.com  ');
    userEvent.selectOptions(roleSelect, 'DOCTOR');

    mockHttp()
      .post('/api/v1/admin/users', [
        {
          authenticationDetails: { method: MAGIC_LINK, identifier: 'jane.doe@example.com' },
          roles: ['DOCTOR'],
        },
        {
          authenticationDetails: { method: MAGIC_LINK, identifier: 'john.doe@gmail.com' },
          roles: ['DOCTOR'],
        },
      ])
      .reply(200, [
        aUser({ method: MAGIC_LINK, identifier: 'jane.doe@example.com' }),
        aUser({ method: MAGIC_LINK, identifier: 'john.doe@example.com' }),
      ]);

    submit();
    await screen.findByText(/successfully created/i);

    userEvent.type(textarea, 'invalid-email,another!invalid');
    userEvent.selectOptions(roleSelect, 'USER');

    mockHttp()
      .post('/api/v1/admin/users', [
        {
          authenticationDetails: { method: MAGIC_LINK, identifier: 'invalid-email' },
          roles: ['USER'],
        },
        {
          authenticationDetails: { method: MAGIC_LINK, identifier: 'another!invalid' },
          roles: ['USER'],
        },
      ])
      .reply(422, { message: 'Some error' });

    submit();
    await screen.findByText(/failed with status code 422/);
  });

  it('creates users with valid Estonian id codes', async () => {
    mockConfig(ESTONIAN_ID);

    mockHttp()
      .get('/api/v1/roles')
      .reply(200, [
        { name: 'USER', permissions: [] },
        { name: 'TEST_ADMINISTRATOR', permissions: [] },
      ]);

    renderWrapped(<BulkUserCreationPage />);

    const identifiersBox = screen.getByRole('textbox');
    const roleSelect = screen.getByRole('combobox');
    const submit = () => userEvent.click(screen.getByRole('button'));

    await screen.findByText('USER');

    submit();
    // nothing is posted, as no emails are put in
    await screen.findByText(/please check the identification code/i);

    userEvent.type(identifiersBox, '  49207271232  \n,39210030814  ');
    userEvent.selectOptions(roleSelect, 'TEST_ADMINISTRATOR');

    mockHttp()
      .post('/api/v1/admin/users', [
        {
          authenticationDetails: { method: ESTONIAN_ID, identifier: '49207271232' },
          roles: ['TEST_ADMINISTRATOR'],
        },
        {
          authenticationDetails: { method: ESTONIAN_ID, identifier: '39210030814' },
          roles: ['TEST_ADMINISTRATOR'],
        },
      ])
      .reply(200, [
        aUser({ method: ESTONIAN_ID, identifier: '49207271232' }),
        aUser({ method: ESTONIAN_ID, identifier: '39210030814' }),
      ]);

    submit();
    await screen.findByText(/successfully created/i);
  });

  it('shows error message when loading roles fails', async () => {
    mockConfig(MAGIC_LINK);
    mockHttp().get('/api/v1/roles').reply(403, { message: 'Some error' });

    renderWrapped(<BulkUserCreationPage />);

    await screen.findByText(/failed with status code 403/);
  });

  function mockAuthentication() {
    (useAuthentication as jest.Mock).mockReturnValue({ token: 'some-token' });
  }

  function mockConfig(method: AuthenticationMethod): void {
    (useConfig as jest.Mock<Config>).mockReturnValue({
      preferredAuthMethod: method,
      defaultLanguage: Language.ENGLISH,
      addressRequired: false,
      appName: '',
    });
  }

  function aUser(authenticationDetails: User['authenticationDetails']): User {
    return {
      id: `user-id-for-${authenticationDetails.identifier}`,
      authenticationDetails,
      creationTime: new Date('2020-02-20').toISOString(),
    };
  }

  function mockWindowConfirm() {
    window.confirm = jest.fn(() => true);
  }

  function mockHttp(): Scope {
    return nock(/./).matchHeader('Authorization', 'Bearer some-token');
  }
});
