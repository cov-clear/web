import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react';

import { BulkUserCreationPage } from '.';
import { useAuthentication } from '../authentication/context';
import { User, AuthenticationMethod, Config, Language } from '../api';
import { renderWrapped } from '../testHelpers';
import { useConfig } from '../common/useConfig';

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock('axios', () => ({
  ...jest.requireActual('axios'),
  create: () => ({ get: mockGet, post: mockPost }),
}));
jest.mock('../authentication/context');
jest.mock('../common/useConfig');

describe('Bulk user creation page', () => {
  beforeEach(() => {
    mockAuthentication();
    mockConfig();
  });

  afterEach(jest.resetAllMocks);

  it('creates users with identifiers from comma-separated input and selected role and shows a success or error message', async () => {
    mockWindowConfirm();

    mockGet.mockImplementationOnce((url) =>
      Promise.resolve({
        data:
          url === '/api/v1/roles'
            ? [
                { name: 'USER', permissions: [] },
                { name: 'DOCTOR', permissions: [] },
              ]
            : {},
      })
    );

    const { getByLabelText, getByText } = renderWrapped(<BulkUserCreationPage />);

    const input = getByLabelText(/emails/i);
    const button = getByText('Create');
    const roleSelect = getByLabelText(/role/i);

    await waitFor(() => {
      expect(getByText('USER')).toBeInTheDocument();
      expect(getByText('DOCTOR')).toBeInTheDocument();
    });

    mockPost.mockResolvedValueOnce({
      data: [
        aUser('jane.doe@example.com'),
        aUser('john.doe@gmail.com'),
        aUser('johnny.doe@yahoo.com'),
      ],
    });
    fireEvent.click(button);
    expect(mockPost).not.toHaveBeenCalled();
    fireEvent.change(input, {
      target: { value: '  jane.doe@ example.com ,john.doe@gmail.com  , jake.doe@yahoo.com ' },
    });
    fireEvent.change(roleSelect, { target: { value: 'DOCTOR' } });
    expect(mockPost).not.toHaveBeenCalled();
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/admin/users', [
        {
          authenticationDetails: {
            method: AuthenticationMethod.MAGIC_LINK,
            identifier: 'jane.doe@example.com',
          },
          roles: ['DOCTOR'],
        },
        {
          authenticationDetails: {
            method: AuthenticationMethod.MAGIC_LINK,
            identifier: 'john.doe@gmail.com',
          },
          roles: ['DOCTOR'],
        },
        {
          authenticationDetails: {
            method: AuthenticationMethod.MAGIC_LINK,
            identifier: 'jake.doe@yahoo.com',
          },
          roles: ['DOCTOR'],
        },
      ]);
    });
    expect(getByText(/successfully created/i)).toBeInTheDocument();

    mockPost.mockClear();
    mockPost.mockRejectedValueOnce(new Error('Some creation error.'));
    fireEvent.change(input, { target: { value: 'invalid-email,another!invalid' } });
    fireEvent.change(roleSelect, { target: { value: 'USER' } });
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/admin/users', [
        {
          authenticationDetails: {
            method: AuthenticationMethod.MAGIC_LINK,
            identifier: 'invalid-email',
          },
          roles: ['USER'],
        },
        {
          authenticationDetails: {
            method: AuthenticationMethod.MAGIC_LINK,
            identifier: 'another!invalid',
          },
          roles: ['USER'],
        },
      ]);
    });
    expect(getByText(/some creation error/i)).toBeInTheDocument();
  });

  it('shows error message when loading roles fails', async () => {
    mockGet.mockImplementationOnce((url) =>
      Promise.reject(new Error(url === '/api/v1/roles' ? 'Some role error.' : 'Some other error.'))
    );

    const { getByText } = renderWrapped(<BulkUserCreationPage />);

    await waitFor(() => {
      expect(getByText(/some role error/i)).toBeInTheDocument();
    });
  });

  function mockAuthentication() {
    (useAuthentication as jest.Mock).mockReturnValue({ token: 'some-token' });
  }

  function mockConfig(): void {
    (useConfig as jest.Mock<Config>).mockReturnValue({
      preferredAuthMethod: AuthenticationMethod.MAGIC_LINK,
      defaultLanguage: Language.ENGLISH,
      addressRequired: false,
      appName: '',
    });
  }

  function aUser(identifier: User['authenticationDetails']['identifier']): User {
    return {
      id: `user-id-for-${identifier}`,
      authenticationDetails: {
        method: AuthenticationMethod.MAGIC_LINK,
        identifier,
      },
      creationTime: new Date('2020-02-20').toISOString(),
    };
  }

  function mockWindowConfirm() {
    window.confirm = jest.fn(() => true);
  }
});
