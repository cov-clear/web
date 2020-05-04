import React, { FC, useEffect, useState } from 'react';
import { Message, useTranslations } from 'retranslate';
import { Box, Label, Heading, Container, Button, Alert, Input, Text, Select } from 'theme-ui';
import { useFormik } from 'formik';
import * as yup from 'yup';

import {
  CreateUserCommand,
  AuthenticationMethod,
  AuthenticationDetails,
  Test,
  createTest,
  createUser as getOrCreateUser,
} from '../api';
import { useConfig } from '../common';
import { useUserCreation } from './useUserCreation';
import { validateIdCode } from './validateIdCode';
import { useTestTypes } from '../resources';
import { useAuthentication } from '../identity';
import { getInitialValues, TestFields } from './TestFields';

const AnyBox = Box as any;

interface FormFields {
  identifier: string;
}

export const AddTestToIdentifierPage: FC = () => {
  const { authenticationMethod } = useConfig();
  const { translate } = useTranslations();
  const { permittedTestTypes } = useTestTypes();
  const { token } = useAuthentication();
  const [selectedTestTypeId, setSelectedTestTypeId] = useState('');

  useEffect(() => {
    if (!selectedTestTypeId && permittedTestTypes.length) {
      setSelectedTestTypeId(permittedTestTypes[0].id);
    }
  }, [permittedTestTypes, selectedTestTypeId]);

  const selectedTestType = permittedTestTypes.find((type) => type.id === selectedTestTypeId);

  async function addTestForAuthDetails(test: Test, authenticationDetails: AuthenticationDetails) {
    const user = await getOrCreateUser({ authenticationDetails }, { token: token! });
    await createTest(user.id, test, { token: token! });
  }

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
      .test(
        'is-valid-estonian-id',
        translate('addTestToIdentifierPage.form.identifier.invalid.estonianId'),
        validateIdCode
      )
      .required(translate('addTestToIdentifierPage.form.identifier.required.estonianId')),
  };

  const form = useFormik({
    initialValues: {
      ...(selectedTestType ? getInitialValues(selectedTestType.resultsSchema) : {}),
      identifier: '',
    },
    enableReinitialize: true,
    validationSchema: yup.object().shape({
      identifier: identifierSchemaForMethod[authenticationMethod],
    }),
    onSubmit: async ({ identifier }, { resetForm }) => {
      const command: CreateUserCommand = {
        authenticationDetails: { method: authenticationMethod, identifier },
      };

      await create(command);
      resetForm();
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

        {permittedTestTypes.length > 1 ? (
          <>
            <Label htmlFor="test-type">
              <Message>addTestPage.testType.label</Message>
            </Label>
            <Select
              id="test-type"
              value={selectedTestTypeId}
              onChange={(event) => setSelectedTestTypeId(event.target.value)}
              required
              mb={4}
            >
              {permittedTestTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </Select>
          </>
        ) : null}

        {selectedTestType && <TestFields form={form} testType={selectedTestType} />}

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
