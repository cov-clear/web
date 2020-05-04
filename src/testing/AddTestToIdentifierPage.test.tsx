import React from 'react';
import { waitForElementToBeRemoved, fireEvent } from '@testing-library/react';
import nock from 'nock';

import { useAuthentication } from '../authentication/context';
import { useConfig } from '../common/useConfig';
import { renderWrapped } from '../testHelpers';
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
    const { getByLabelText } = renderWrapped(<AddTestToIdentifierPage />);

    const identifierInput = getByLabelText(/identification code/i);

    expect(identifierInput).toHaveFocus();
  });

  it('creates a user for the authentication method from config and the filled identifier', async () => {
    const authenticationDetails = { method: 'ESTONIAN_ID', identifier: '39210030814' };
    const scope = nock(/./)
      .post('/api/v1/users', { authenticationDetails })
      .matchHeader('Authorization', 'Bearer some-token')
      .reply(201, { id: 'some-id', authenticationDetails });

    const { getByText, getByLabelText, queryByText, findByText } = renderWrapped(
      <AddTestToIdentifierPage />
    );

    const identifierInput = getByLabelText(/identification code/i) as HTMLInputElement;
    const submit = () => fireEvent.click(getByText(/add test result/i));

    fillInput(identifierInput, '79210030814'); // invalid id code
    submit();
    await findByText(/check the identification code/i); // validation error

    fillInput(identifierInput, '39210030814'); // valid id code
    await waitForElementToBeRemoved(queryByText(/check the identification code/i)); // no validation error

    submit();
    await findByText(/39210030814 added/i);
    expect(identifierInput.value).toBe('');

    scope.done();
  });

  it('shows error when user cannot be created', async () => {
    const authenticationDetails = { method: 'ESTONIAN_ID', identifier: '39210030814' };
    const scope = nock(/./)
      .post('/api/v1/users', { authenticationDetails })
      .matchHeader('Authorization', 'Bearer some-token')
      .reply(403, { message: 'Some error' });

    const { getByText, getByLabelText, findByText } = renderWrapped(<AddTestToIdentifierPage />);

    const identifierInput = getByLabelText(/identification code/i);
    const submit = () => fireEvent.click(getByText(/add test result/i));

    fillInput(identifierInput, '39210030814');
    submit();
    await findByText(/failed to create user/i);

    scope.done();
  });

  function mockToken(token: string): void {
    (useAuthentication as jest.Mock).mockReturnValue({ token });
  }

  function mockConfigForEstonianIdMethodAndEnglish(): void {
    // TODO: Mock config response on API level when we start calling a config endpoint
    (useConfig as jest.Mock<Config>).mockReturnValue({
      authenticationMethod: AuthenticationMethod.ESTONIAN_ID,
      defaultLanguage: Language.ENGLISH,
    });
  }

  function fillInput(input: HTMLElement, value: string): void {
    fireEvent.change(input, { target: { value } });
  }
});
