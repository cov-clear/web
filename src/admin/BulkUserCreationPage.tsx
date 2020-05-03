import React, { FC } from 'react';
import { Message, useTranslations } from 'retranslate';
import { Box, Label, Heading, Container, Button, Text, Textarea, Alert, Select } from 'theme-ui';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { Role, CreateUserWithRolesCommand, AuthenticationMethod } from '../api';
import useBulkUserCreation from './useBulkUserCreation';
import useRoles from './useRoles';

const AnyBox = Box as any;

const BulkUserCreationPage: FC = () => {
  const { translate } = useTranslations();
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
      // TODO: support ESTONIAN_ID authentication method
      const command: CreateUserWithRolesCommand[] = emails.map((email) => ({
        authenticationDetails: {
          method: AuthenticationMethod.MAGIC_LINK,
          identifier: email,
        },
        roles: [role],
      }));

      if (
        window.confirm(translate('bulkUserCreationPage.confirm', { number: command.length, role }))
      ) {
        create(command);
      }
    },
  });

  return (
    <Container variant="page">
      <Heading as="h1" mb={4}>
        <Message>bulkUserCreationPage.heading</Message>
      </Heading>

      <Text mb={4}>
        <Message>bulkUserCreationPage.description</Message>
      </Text>

      <AnyBox as="form" sx={{ display: 'grid', gridGap: 4 }} onSubmit={form.handleSubmit} mb={4}>
        <Box>
          <Label htmlFor="role">
            <Message>bulkUserCreationPage.role.label</Message> *
          </Label>
          <Select id="role" {...form.getFieldProps('role')}>
            {roles.map(({ name }) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </Box>

        <Box>
          <Label htmlFor="emails">
            <Message>bulkUserCreationPage.emails.label</Message> *
          </Label>
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
          <Message>bulkUserCreationPage.button</Message>
        </Button>
      </AnyBox>

      {createdUsers.length > 0 && (
        <Alert variant="success" mb={2}>
          <Message params={{ number: createdUsers.length }}>bulkUserCreationPage.success</Message>
        </Alert>
      )}

      {errorLoadingRoles && (
        <Alert variant="error" mb={2}>
          {errorLoadingRoles.message}
        </Alert>
      )}

      {errorCreatingUsers && (
        <Alert variant="error" mb={2}>
          {errorCreatingUsers.message}
        </Alert>
      )}
    </Container>
  );
};

function getEmails(string: string): string[] {
  return string.replace(/\s+/g, '').split(',');
}

export default BulkUserCreationPage;
