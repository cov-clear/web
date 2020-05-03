import React, { FC } from 'react';
import { Message, useTranslations } from 'retranslate';
import { Box, Label, Heading, Container, Button, Alert, Input, Text } from 'theme-ui';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { CreateUserCommand, AuthenticationMethod } from '../api';
import { useConfig } from '../common';
import { useUserCreation } from './useUserCreation';

const AnyBox = Box as any;

// from https://ipsec.pl/data-protection/2012/european-personal-data-regexp-patterns.html
const ESTONIAN_ID_CODE_REGEX = /^[1-6][0-9]{2}[1,2][0-9][0-9]{2}[0-9]{4}$/;

interface FormFields {
  identifier: string;
}

export const AddTestToIdentifierPage: FC = () => {
  const { authenticationMethod } = useConfig();
  const { translate } = useTranslations();
  const {
    create,
    creating: creatingUsers,
    error: errorCreatingUser,
    createdUser,
  } = useUserCreation();

  const placeholderKeyForMethod: Record<AuthenticationMethod, string> = {
    MAGIC_LINK: 'addTestToIdentifierPage.form.identifier.placeholder.magicLink',
    ESTONIAN_ID: 'addTestToIdentifierPage.form.identifier.placeholder.estonianId',
  };

  const labelKeyForMethod: Record<AuthenticationMethod, string> = {
    MAGIC_LINK: 'addTestToIdentifierPage.form.identifier.label.magicLink',
    ESTONIAN_ID: 'addTestToIdentifierPage.form.identifier.label.estonianId',
  };

  const identifierSchemaForMethod: Record<AuthenticationMethod, yup.Schema<string>> = {
    MAGIC_LINK: yup
      .string()
      .email(translate('addTestToIdentifierPage.form.identifier.invalid.magicLink'))
      .required(translate('addTestToIdentifierPage.form.identifier.required.magicLink')),
    ESTONIAN_ID: yup
      .string()
      .matches(
        ESTONIAN_ID_CODE_REGEX,
        translate('addTestToIdentifierPage.form.identifier.invalid.estonianId')
      )
      .required(translate('addTestToIdentifierPage.form.identifier.required.estonianId')),
  };

  const form = useFormik<FormFields>({
    initialValues: {
      identifier: '',
    },
    validationSchema: yup.object().shape({
      identifier: identifierSchemaForMethod[authenticationMethod],
    }),
    onSubmit: ({ identifier }) => {
      const command: CreateUserCommand = {
        authenticationDetails: { method: authenticationMethod, identifier },
      };

      create(command);
    },
  });

  const fieldError = (key: keyof FormFields) =>
    form.touched[key] && form.errors[key] ? <Text>{form.errors[key]}</Text> : null;

  return (
    <Container variant="page">
      <Heading as="h1" mb={4}>
        <Message>addTestToIdentifierPage.heading</Message>
      </Heading>

      <AnyBox as="form" sx={{ display: 'grid', gridGap: 4 }} onSubmit={form.handleSubmit} mb={4}>
        <Box>
          <Label htmlFor="identifier">
            <Message>{labelKeyForMethod[authenticationMethod]}</Message> *
          </Label>
          <Input
            id="identifier"
            {...form.getFieldProps('identifier')}
            placeholder={translate(placeholderKeyForMethod[authenticationMethod])}
            autoFocus
          />
          {fieldError('identifier')}
        </Box>

        <Button variant="block" type="submit" disabled={creatingUsers || !form.isValid}>
          <Message>addTestToIdentifierPage.button</Message>
        </Button>
      </AnyBox>

      {createdUser && 'TODO: createdTest' && (
        <Alert variant="success" mb={2}>
          <Message params={{ identifier: createdUser.authenticationDetails.identifier }}>
            addTestToIdentifierPage.success
          </Message>
        </Alert>
      )}

      {errorCreatingUser && (
        <Alert variant="error" mb={2}>
          {errorCreatingUser.message}
        </Alert>
      )}
    </Container>
  );
};
