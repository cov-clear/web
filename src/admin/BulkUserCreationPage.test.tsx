import React from 'react';
import http from 'axios';
import { render, waitFor, fireEvent } from '@testing-library/react';

import { BulkUserCreationPage } from '.';
import { useAuthentication } from '../authentication/context';
import { User } from '../api';

jest.mock('axios');
jest.mock('../authentication/context');

describe('Bulk user creation page', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates users with emails from comma-separated input and selected role and shows a success or error message', async () => {
    mockAuthentication();

    const post = getMockPost();
    const { getByLabelText, getByText } = render(<BulkUserCreationPage />);

    const input = getByLabelText(/emails/i);
    const button = getByText('Create');
    const roleSelect = getByLabelText(/role/i);

    post.mockResolvedValueOnce({
      data: [
        anUser('jane.doe@example.com'),
        anUser('john.doe@gmail.com'),
        anUser('johnny.doe@yahoo.com'),
      ],
    });

    fireEvent.click(button);
    expect(post).not.toHaveBeenCalled();
    fireEvent.change(input, {
      target: { value: '  jane.doe@ example.com ,john.doe@gmail.com  , jake.doe@yahoo.com ' },
    });
    fireEvent.change(roleSelect, { target: { value: 'CLINICIAN' } });
    expect(post).not.toHaveBeenCalled();
    fireEvent.click(button);
    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/api/v1/users', [
        { email: 'jane.doe@example.com', roles: ['CLINICIAN'] },
        { email: 'john.doe@gmail.com', roles: ['CLINICIAN'] },
        { email: 'jake.doe@yahoo.com', roles: ['CLINICIAN'] },
      ]);
    });
    expect(getByText(/successfully created/i)).toBeInTheDocument();

    post.mockClear();
    post.mockRejectedValueOnce(new Error('Something went wrong.'));
    fireEvent.change(input, { target: { value: 'invalid-email,another!invalid' } });
    fireEvent.click(button);
    await waitFor(() => {
      expect(post).toHaveBeenCalledWith('/api/v1/users', [
        { email: 'invalid-email', roles: ['CLINICIAN'] },
        { email: 'another!invalid', roles: ['CLINICIAN'] },
      ]);
    });
    expect(getByText('Something went wrong.')).toBeInTheDocument();
  });

  function mockAuthentication() {
    (useAuthentication as jest.Mock).mockReturnValue({ token: 'some-token' });
  }

  function anUser(email: User['email']): User {
    return {
      email,
      id: email,
      creationTime: new Date('2020-02-20').toISOString(),
    };
  }

  function getMockPost() {
    const post = jest.fn();
    (http.create as jest.Mock).mockReturnValue({ post });
    return post;
  }
});
