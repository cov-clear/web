import React, { FC } from 'react';
import { Message, useTranslations } from 'retranslate';
import { Box, Label, Heading, Container, Button, Alert, Input } from 'theme-ui';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { CreateUserCommand, AuthenticationMethod } from '../api';
import { useConfig } from '../common';
import { useUserCreation } from './useUserCreation';

const AnyBox = Box as any;

export const AddTestToIdentifierPage: FC = () => {
  const { authenticationMethod } = useConfig();
  const { translate } = useTranslations();
  const {
    create,
    creating: creatingUsers,
    error: errorCreatingUser,
    createdUser,
  } = useUserCreation();

  const form = useFormik<{ identifier: string }>({
    initialValues: {
      identifier: '',
    },
    validationSchema: yup.object().shape({
      identifier: yup.string().required(), // TODO: Add client-side validation
    }),
    onSubmit: ({ identifier }) => {
      const command: CreateUserCommand = {
        authenticationDetails: { method: authenticationMethod, identifier },
      };

      create(command);
    },
  });

  const placeholderKeyForMethod: Record<AuthenticationMethod, string> = {
    MAGIC_LINK: 'addTestToIdentifierPage.form.identifier.placeholder.magic_link',
    ESTONIAN_ID: 'addTestToIdentifierPage.form.identifier.placeholder.estonian_id',
  };

  const labelKeyForMethod: Record<AuthenticationMethod, string> = {
    MAGIC_LINK: 'addTestToIdentifierPage.form.identifier.label.magic_link',
    ESTONIAN_ID: 'addTestToIdentifierPage.form.identifier.label.estonian_id',
  };

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
          />
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
