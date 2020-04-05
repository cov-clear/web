import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';

import { BulkUserCreationPage } from '.';
import { useAuthentication } from '../authentication/context';
import { User } from '../api';

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock('axios', () => ({ create: () => ({ get: mockGet, post: mockPost }) }));
jest.mock('../authentication/context');

describe('Bulk user creation page', () => {
  beforeEach(mockAuthentication);
  afterEach(jest.resetAllMocks);

  it('creates users with emails from comma-separated input and selected role and shows a success or error message', async () => {
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

    const { getByLabelText, getByText } = render(<BulkUserCreationPage />);

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
      expect(mockPost).toHaveBeenCalledWith('/api/v1/users', [
        { email: 'jane.doe@example.com', roles: ['DOCTOR'] },
        { email: 'john.doe@gmail.com', roles: ['DOCTOR'] },
        { email: 'jake.doe@yahoo.com', roles: ['DOCTOR'] },
      ]);
    });
    expect(getByText(/successfully created/i)).toBeInTheDocument();

    mockPost.mockClear();
    mockPost.mockRejectedValueOnce(new Error('Something went wrong.'));
    fireEvent.change(input, { target: { value: 'invalid-email,another!invalid' } });
    fireEvent.change(roleSelect, { target: { value: 'USER' } });
    fireEvent.click(button);
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/api/v1/users', [
        { email: 'invalid-email', roles: ['USER'] },
        { email: 'another!invalid', roles: ['USER'] },
      ]);
    });
    expect(getByText('Something went wrong.')).toBeInTheDocument();
  });

  it('shows error message when loading roles fails', async () => {
    mockGet.mockImplementationOnce((url) =>
      Promise.reject(
        new Error(url === '/api/v1/roles' ? 'Failed to load roles.' : 'Some other error.')
      )
    );

    const { getByText } = render(<BulkUserCreationPage />);

    await waitFor(() => {
      expect(getByText('Failed to load roles.')).toBeInTheDocument();
    });
  });

  function mockAuthentication() {
    (useAuthentication as jest.Mock).mockReturnValue({ token: 'some-token' });
  }

  function aUser(email: User['email']): User {
    return {
      email,
      id: email,
      creationTime: new Date('2020-02-20').toISOString(),
    };
  }

  function mockWindowConfirm() {
    window.confirm = jest.fn(() => true);
  }
});
