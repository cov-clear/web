import React, { FC } from 'react';
import { Message, useTranslations } from 'retranslate';
import { Box, Label, Heading, Button, Text, Textarea, Alert, Select } from 'theme-ui';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { Role, CreateUserWithRolesCommand, AuthenticationMethod } from '../api';
import useBulkUserCreation from './useBulkUserCreation';
import useRoles from './useRoles';
import { useConfig } from '../common';
import { validateIdCodes } from '../common/idCodeValidation';

const AnyBox = Box as any;

type FormFields = { identifiersString: string; role: Role['name'] };

const BulkUserCreationPage: FC = () => {
  const { preferredAuthMethod } = useConfig()!;
  const { translate } = useTranslations();
  const {
    create,
    loading: creatingUsers,
    error: errorCreatingUsers,
    createdUsers,
  } = useBulkUserCreation();
  const { roles, loading: loadingRoles, error: errorLoadingRoles } = useRoles();

  const labelKeyForMethod: Record<AuthenticationMethod, string> = {
    MAGIC_LINK: 'bulkUserCreationPage.identifiers.label.magicLink',
    ESTONIAN_ID: 'bulkUserCreationPage.identifiers.label.estonianId',
  };

  const placeholderKeyForMethod: Record<AuthenticationMethod, string> = {
    MAGIC_LINK: 'bulkUserCreationPage.identifiers.placeholder.magicLink',
    ESTONIAN_ID: 'bulkUserCreationPage.identifiers.placeholder.estonianId',
  };

  const identifiersSchemaForMethod: Record<AuthenticationMethod, yup.Schema<string>> = {
    MAGIC_LINK: yup
      .string()
      .required(translate('bulkUserCreationPage.identifiers.required.magicLink')),
    ESTONIAN_ID: yup
      .string()
      .test(
        'are-valid-estonian-ids',
        translate('bulkUserCreationPage.identifiers.invalid.estonianId'),
        (identifiersString) =>
          identifiersString && validateIdCodes(getIdentifiers(identifiersString))
      ),
  };

  const form = useFormik<FormFields>({
    initialValues: {
      role: roles[0]?.name || '',
      identifiersString: '',
    },
    enableReinitialize: true,
    validationSchema: yup.object().shape({
      role: yup.string().required(),
      identifiersString: identifiersSchemaForMethod[preferredAuthMethod],
    }),
    onSubmit: ({ role, identifiersString }) => {
      const identifiers = getIdentifiers(identifiersString);
      const command: CreateUserWithRolesCommand[] = identifiers.map((identifier) => ({
        authenticationDetails: {
          method: preferredAuthMethod,
          identifier,
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

  const fieldError = (key: keyof FormFields) =>
    (form.submitCount > 0 || form.touched[key]) && form.errors[key] ? (
      <Text variant="validation">{form.errors[key]}</Text>
    ) : null;

  return (
    <>
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
          <Label htmlFor="identifiers">
            <Message>{labelKeyForMethod[preferredAuthMethod]}</Message> *
          </Label>
          <Textarea
            id="identifiers"
            {...form.getFieldProps('identifiersString')}
            placeholder={translate(placeholderKeyForMethod[preferredAuthMethod])}
          />
          {fieldError('identifiersString')}
        </Box>

        <Button variant="block" type="submit" disabled={loadingRoles || creatingUsers}>
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
    </>
  );
};

function getIdentifiers(string: string): string[] {
  return string.replace(/\s+/g, '').split(',');
}

export default BulkUserCreationPage;
