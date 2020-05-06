import React from 'react';
import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';

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
    mockToken('some-token');
  });

  it('focuses identifier input', async () => {
    nock(/./)
      .get('/api/v1/test-types')
      .matchHeader('Authorization', 'Bearer some-token')
      .reply(200, [aTestType()]);

    renderWrapped(<AddTestToIdentifierPage />);

    const identifierInput = screen.getByLabelText(/identification code/i);
    expect(identifierInput).toHaveFocus();
  });

  it('creates a user for the authentication method from config and the filled identifier and adds a test', async () => {
    nock(/./)
      .get('/api/v1/test-types')
      .matchHeader('Authorization', 'Bearer some-token')
      .reply(200, [aTestType()]);

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

    const authenticationDetails = { method: 'ESTONIAN_ID', identifier: '39210030814' };
    nock(/./)
      .post('/api/v1/users', { authenticationDetails })
      .matchHeader('Authorization', 'Bearer some-token')
      .reply(201, { id: 'some-user-id', authenticationDetails });

    nock(/./)
      .post('/api/v1/users/some-user-id/tests', {
        testTypeId: aTestType().id,
        results: { details: { positive: true }, notes: 'Some notes' },
      })
      .matchHeader('Authorization', 'Bearer some-token')
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
    nock(/./)
      .get('/api/v1/test-types')
      .matchHeader('Authorization', 'Bearer some-token')
      .reply(200, [aTestType()]);

    renderWrapped(<AddTestToIdentifierPage />);

    const identifierInput = screen.getByLabelText(/identification code/i);
    const submit = () => userEvent.click(screen.getByRole('button'));

    nock(/./)
      .post('/api/v1/users', {
        authenticationDetails: { method: 'ESTONIAN_ID', identifier: '39210030814' },
      })
      .matchHeader('Authorization', 'Bearer some-token')
      .reply(403, { message: 'Some error' });

    userEvent.type(identifierInput, '39210030814');
    submit();
    await screen.findByText(/failed to create user/i);
  });

  function mockToken(token: string): void {
    (useAuthentication as jest.Mock).mockReturnValue({
      token,
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
});
