import React, { FC } from 'react';
import { Box, Label, Heading, Container, Button, Text, Textarea, Alert, Select } from 'theme-ui';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { Role, CreateUserCommand } from '../api';
import useBulkUserCreation from './hooks/useBulkUserCreation';

const AnyBox = Box as any;

const ROLES: Role[] = ['TRUSTED_PATIENT', 'CLINICIAN'];

const BulkUserCreationPage: FC = () => {
  const { create, loading, error, createdUsers } = useBulkUserCreation();

  const form = useFormik<{ emailsString: string; role: Role }>({
    initialValues: {
      emailsString: '',
      role: 'TRUSTED_PATIENT',
    },
    validationSchema: yup.object().shape({
      emailsString: yup.string().required(),
      role: yup.string().required(),
    }),
    onSubmit: ({ emailsString, role }) => {
      const emails = getEmails(emailsString);
      const command: CreateUserCommand[] = emails.map((email) => ({ email, roles: [role] }));
      create(command);
    },
  });

  return (
    <Container variant="page">
      <Heading as="h1" mb={4}>
        Create users
      </Heading>

      <Text mb={4}>Users with the emails will be created with the selected role.</Text>

      <AnyBox as="form" sx={{ display: 'grid', gridGap: 4 }} onSubmit={form.handleSubmit} mb={4}>
        <Box>
          <Label htmlFor="role">Role *</Label>
          <Select id="role" {...form.getFieldProps('role')}>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
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

        <Button variant="block" type="submit" disabled={loading || !form.isValid}>
          Create
        </Button>
      </AnyBox>

      {createdUsers.length > 0 && (
        <Alert variant="success">{createdUsers.length} user(s) successfully created.</Alert>
      )}

      {error && <Alert variant="error">{error.message}</Alert>}
    </Container>
  );
};

function getEmails(string: string): string[] {
  return string.replace(/\s+/g, '').split(',');
}

export default BulkUserCreationPage;
