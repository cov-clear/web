import React from 'react';
import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock, { Scope } from 'nock';

import { useAuthentication } from '../authentication/context';
import { useConfig } from '../common/useConfig';
import { renderWrapped, aTestType, antibodyTestType } from '../testHelpers';
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

    expect(identifierInput()).toHaveFocus();
  });

  it('only allows submitting the form once the identifier is valid and required test fields are filled, showing validation errors', async () => {
    mockHttp().get('/api/v1/test-types').reply(200, [aTestType()]);
    renderWrapped(<AddTestToIdentifierPage />);

    const positiveOption = await screen.findByRole('radio', { name: 'Positive' });

    userEvent.type(identifierInput(), '79210030814'); // invalid id code
    submit();
    await screen.findByText(/check the identification code/i); // validation error

    userEvent.type(identifierInput(), '39210030814'); // valid id code
    await waitForElementToBeRemoved(screen.queryByText(/check the identification code/i)); // no validation error

    await userEvent.type(notesInput(), 'Some notes');
    expect(submitButton()).toBeDisabled(); // as a radio option has not been selected

    userEvent.click(positiveOption);
    await waitFor(() => expect(submitButton()).not.toBeDisabled());
  });

  it('creates a user and and adds a PCR test for that user', async () => {
    mockHttp().get('/api/v1/test-types').reply(200, [aTestType()]);
    renderWrapped(<AddTestToIdentifierPage />);

    const negativeOption = await screen.findByRole('radio', { name: 'Negative' });
    const positiveOption = screen.getByRole('radio', { name: 'Positive' });

    userEvent.type(identifierInput(), '39210030814');
    await userEvent.type(notesInput(), 'Some notes');
    userEvent.click(negativeOption);
    userEvent.click(positiveOption); // to confirm the latest value is sent

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
    await screen.findByText(/test result for 39210030814 added/i);

    // form is reset
    expect(identifierInput()).toHaveValue('');
    expect(negativeOption).not.toBeChecked();
    expect(positiveOption).not.toBeChecked();
    expect(notesInput()).toHaveValue('');
  });

  it('creates a user and and adds an antibody test for that user', async () => {
    mockHttp().get('/api/v1/test-types').reply(200, [antibodyTestType()]);
    renderWrapped(<AddTestToIdentifierPage />);

    const controlCheckbox = await screen.findByRole('checkbox', { name: /control/i });
    const iggCheckbox = screen.getByRole('checkbox', { name: /igg/i });
    const igmCheckbox = screen.getByRole('checkbox', { name: /igm/i });

    userEvent.type(identifierInput(), '39210030814');
    await userEvent.type(notesInput(), 'Some notes');
    userEvent.click(controlCheckbox);
    // IgG is not clicked
    userEvent.click(igmCheckbox);

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
        testTypeId: antibodyTestType().id,
        results: {
          details: {
            c: true,
            igg: false,
            igm: true,
            msa: antibodyTestType().resultsSchema.properties.msa.const,
          },
          notes: 'Some notes',
        },
      })
      .reply(201, {});

    submit();
    await screen.findByText(/test result for 39210030814 added/i);

    // form is reset
    expect(identifierInput()).toHaveValue('');
    expect(controlCheckbox).not.toBeChecked();
    expect(iggCheckbox).not.toBeChecked();
    expect(igmCheckbox).not.toBeChecked();
    expect(notesInput()).toHaveValue('');
  });

  it('shows error when user cannot be created', async () => {
    mockHttp().get('/api/v1/test-types').reply(200, [aTestType()]);
    renderWrapped(<AddTestToIdentifierPage />);

    userEvent.type(identifierInput(), '39210030814');

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

    const negativeOption = await screen.findByRole('radio', { name: 'Negative' });

    userEvent.type(identifierInput(), '39210030814');
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
    (useConfig as jest.Mock<Config>).mockReturnValue({
      preferredAuthMethod: AuthenticationMethod.ESTONIAN_ID,
      defaultLanguage: Language.ENGLISH,
      addressRequired: false,
      appName: '',
    });
  }

  function mockHttp(): Scope {
    return nock(/./).matchHeader('Authorization', 'Bearer some-token');
  }

  const identifierInput = (): HTMLElement => screen.getByLabelText(/identification code/i);
  const submitButton = (): HTMLElement => screen.getByRole('button');
  const submit = (): void => {
    userEvent.click(submitButton());
  };
  const notesInput = (): HTMLElement => screen.getByRole('textbox', { name: /notes/ });
});
