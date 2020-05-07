import React from 'react';
import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock, { Scope } from 'nock';

import { useAuthentication } from '../authentication/context';
import { useConfig } from '../common/useConfig';
import { renderWrapped, aTestType } from '../testHelpers';
import { AddTestToIdentifierPage } from '.';
import { Config, Language, AuthenticationMethod } from '../api';

jest.mock('../authentication/context');
jest.mock('../common/useConfig');

describe(AddTestToIdentifierPage, () => {
  beforeEach(() => {
    mockConfigForEstonianIdMethodAndEnglish();
    mockAuthentication();
  });

  it('focuses identifier input', async () => {
    mockHttp().get('/api/v1/test-types').reply(200, [aTestType()]);

    renderWrapped(<AddTestToIdentifierPage />);

    const identifierInput = screen.getByLabelText(/identification code/i);
    expect(identifierInput).toHaveFocus();
  });

  it('creates a user for the authentication method from config and the filled identifier and adds a test for that user', async () => {
    mockHttp().get('/api/v1/test-types').reply(200, [aTestType()]);

    renderWrapped(<AddTestToIdentifierPage />);

    const identifierInput = screen.getByLabelText(/identification code/i);
    const button = screen.getByRole('button');
    const submit = () => userEvent.click(button);

    const negativeOption = await screen.findByRole('radio', { name: 'Negative' });
    const positiveOption = screen.getByRole('radio', { name: 'Positive' });
    const notesInput = screen.getByRole('textbox', { name: /notes/ });

    userEvent.type(identifierInput, '79210030814'); // invalid id code
    submit();
    await screen.findByText(/check the identification code/i); // validation error

    userEvent.type(identifierInput, '39210030814'); // valid id code
    await waitForElementToBeRemoved(screen.queryByText(/check the identification code/i)); // no validation error

    await userEvent.type(notesInput, 'Some notes');
    expect(button).toBeDisabled(); // as a radio option has not been selected

    userEvent.click(negativeOption);
    userEvent.click(positiveOption);
    await waitFor(() => expect(button).not.toBeDisabled());

    mockHttp()
      .post('/api/v1/users', {
        authenticationDetails: { method: 'ESTONIAN_ID', identifier: '39210030814' },
      })
      .reply(201, {
        id: 'some-user-id',
        authenticationDetails: { method: 'ESTONIAN_ID', identifier: '39210030814' },
      });

    mockHttp()
      .post('/api/v1/users/some-user-id/tests', {
        testTypeId: aTestType().id,
        results: { details: { positive: true }, notes: 'Some notes' },
      })
      .reply(201, {});

    submit();
    await screen.findByText(/39210030814 added/i);
    // form is reset
    expect(identifierInput).toHaveValue('');
    expect(negativeOption).not.toBeChecked();
    expect(positiveOption).not.toBeChecked();
    expect(notesInput).toHaveValue('');
  });

  it('shows error when user cannot be created', async () => {
    mockHttp().get('/api/v1/test-types').reply(200, [aTestType()]);

    renderWrapped(<AddTestToIdentifierPage />);

    const identifierInput = screen.getByLabelText(/identification code/i);
    const submit = () => userEvent.click(screen.getByRole('button'));

    userEvent.type(identifierInput, '39210030814');

    mockHttp()
      .post('/api/v1/users', {
        authenticationDetails: { method: 'ESTONIAN_ID', identifier: '39210030814' },
      })
      .reply(403, { message: 'Some error' });

    submit();
    await screen.findByText(/failed to create user/i);
  });

  it('shows error when test cannot be created', async () => {
    mockHttp().get('/api/v1/test-types').reply(200, [aTestType()]);

    renderWrapped(<AddTestToIdentifierPage />);

    const identifierInput = screen.getByLabelText(/identification code/i);
    const submit = () => userEvent.click(screen.getByRole('button'));

    const negativeOption = await screen.findByRole('radio', { name: 'Negative' });

    userEvent.type(identifierInput, '39210030814');
    userEvent.click(negativeOption);

    mockHttp()
      .post('/api/v1/users', {
        authenticationDetails: { method: 'ESTONIAN_ID', identifier: '39210030814' },
      })
      .reply(201, {
        id: 'some-user-id',
        authenticationDetails: { method: 'ESTONIAN_ID', identifier: '39210030814' },
      });

    mockHttp()
      .post('/api/v1/users/some-user-id/tests', {
        testTypeId: aTestType().id,
        results: { details: { positive: false }, notes: '' },
      })
      .reply(403, { message: 'Some error' });

    submit();
    await screen.findByText(/failed to add test/i);
  });

  function mockAuthentication(): void {
    (useAuthentication as jest.Mock).mockReturnValue({
      token: 'some-token',
      hasPermission: (permission: string) => permission === 'CREATE_TESTS_WITHOUT_ACCESS_PASS',
    });
  }

  function mockConfigForEstonianIdMethodAndEnglish(): void {
    // TODO: Mock config response on API level when we start calling a config endpoint
    (useConfig as jest.Mock<Config>).mockReturnValue({
      authenticationMethod: AuthenticationMethod.ESTONIAN_ID,
      defaultLanguage: Language.ENGLISH,
      addressRequired: false,
    });
  }

  function mockHttp(): Scope {
    return nock(/./).matchHeader('Authorization', 'Bearer some-token');
  }
});
