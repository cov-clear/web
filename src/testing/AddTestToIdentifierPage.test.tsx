import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react';
import nock from 'nock';

import { useAuthentication } from '../authentication/context';
import { renderWrapped } from '../testHelpers';
import { AddTestToIdentifierPage } from '.';

jest.mock('../authentication/context');

describe(AddTestToIdentifierPage, () => {
  beforeEach(() => {
    mockToken('some-token');
    // TODO: Mock config response when we start calling a config endpoint
  });

  it('focuses identifier input automatically', async () => {
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

    const { getByText, getByLabelText, queryByText } = renderWrapped(<AddTestToIdentifierPage />);

    const button = getByText(/add test result/i);
    const identifierInput = getByLabelText(/identification code/i);

    fireEvent.click(button);
    expect(queryByText(/added/i)).not.toBeInTheDocument();

    fillInput(identifierInput, '79210030814'); // invalid id code
    fireEvent.click(button);
    expect(queryByText(/added/i)).not.toBeInTheDocument();
    await waitFor(() => expect(queryByText(/check the identification code/i)).toBeInTheDocument());

    fillInput(identifierInput, '39210030814'); // valid id code
    await waitFor(() =>
      expect(queryByText(/check the identification code/i)).not.toBeInTheDocument()
    );
    fireEvent.click(button);

    await waitFor(() => expect(queryByText(/39210030814 added/i)).toBeInTheDocument());
    expect((getByLabelText(/identification code/i) as HTMLInputElement).value).toBe('');

    scope.done();
  });

  it('shows error when user cannot be created', async () => {
    const authenticationDetails = { method: 'ESTONIAN_ID', identifier: '39210030814' };
    const scope = nock(/./)
      .post('/api/v1/users', { authenticationDetails })
      .matchHeader('Authorization', 'Bearer some-token')
      .reply(403, { message: 'Some error' });

    const { getByText, getByLabelText, queryByText } = renderWrapped(<AddTestToIdentifierPage />);

    const button = getByText(/add test result/i);
    const identifierInput = getByLabelText(/identification code/i);

    fireEvent.change(identifierInput, { target: { value: '39210030814' } });
    fireEvent.click(button);

    await waitFor(() => expect(queryByText(/failed to create user/i)).toBeInTheDocument());

    scope.done();
  });

  function mockToken(token: string): void {
    (useAuthentication as jest.Mock).mockReturnValue({ token });
  }

  function fillInput(input: HTMLElement, value: string): void {
    fireEvent.change(input, { target: { value } });
  }
});
