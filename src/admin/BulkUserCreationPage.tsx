import React, { FC } from 'react';
import { Box, Label, Heading, Container, Button, Text, Textarea, Alert, Select } from 'theme-ui';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { Role, CreateUserCommand } from '../api';
import useBulkUserCreation from './useBulkUserCreation';
import useRoles from './useRoles';

const AnyBox = Box as any;

const BulkUserCreationPage: FC = () => {
  const {
    create,
    loading: creatingUsers,
    error: errorCreatingUsers,
    createdUsers,
  } = useBulkUserCreation();
  const { roles, loading: loadingRoles, error: errorLoadingRoles } = useRoles();

  const form = useFormik<{ emailsString: string; role: Role['name'] }>({
    initialValues: {
      role: roles[0]?.name || '',
      emailsString: '',
    },
    enableReinitialize: true,
    validationSchema: yup.object().shape({
      role: yup.string().required(),
      emailsString: yup.string().required(),
    }),
    onSubmit: ({ role, emailsString }) => {
      const emails = getEmails(emailsString);
      const command: CreateUserCommand[] = emails.map((email) => ({ email, roles: [role] }));

      if (
        window.confirm(
          `Are you sure you want to create ${command.length} user(s) with role ${role}?`
        )
      ) {
        create(command);
      }
    },
  });

  return (
    <Container variant="page">
      <Heading as="h1" mb={4}>
        Create users
      </Heading>

      <Text mb={4}>
        Creates users with the specified emails and assigns the selected role to them. If a user
        with a given email already exists, the selected role will be assigned to them.
      </Text>

      <AnyBox as="form" sx={{ display: 'grid', gridGap: 4 }} onSubmit={form.handleSubmit} mb={4}>
        <Box>
          <Label htmlFor="role">Role *</Label>
          <Select id="role" {...form.getFieldProps('role')}>
            {roles.map(({ name }) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </Box>

        <Box>
          <Label htmlFor="emails">Emails (separated by comma) *</Label>
          <Textarea
            id="emails"
            {...form.getFieldProps('emailsString')}
            placeholder={'jane@email.com,john@email.com'}
          />
        </Box>

        <Button
          variant="block"
          type="submit"
          disabled={loadingRoles || creatingUsers || !form.isValid}
        >
          Create
        </Button>
      </AnyBox>

      {createdUsers.length > 0 && (
        <Alert variant="success" mb={2}>{createdUsers.length} user(s) successfully created.</Alert>
      )}

      {errorLoadingRoles && <Alert variant="error" mb={2}>{errorLoadingRoles.message}</Alert>}

      {errorCreatingUsers && <Alert variant="error" mb={2}>{errorCreatingUsers.message}</Alert>}
    </Container>
  );
};

function getEmails(string: string): string[] {
  return string.replace(/\s+/g, '').split(',');
}

export default BulkUserCreationPage;
