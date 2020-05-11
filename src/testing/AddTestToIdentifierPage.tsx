import React, { FC, useEffect, useState } from 'react';
import { Message, useTranslations } from 'retranslate';
import { Box, Label, Heading, Button, Alert, Input, Text, Select } from 'theme-ui';
import { useFormik } from 'formik';
import * as yup from 'yup';

import { AuthenticationMethod } from '../api';
import { useConfig } from '../common';
import { useUserWithTestCreation } from './useUserWithTestCreation';
import { validateIdCode } from '../common/idCodeValidation';
import { useTestTypes } from '../resources';
import { getInitialValues, getValidationSchema, TestFields } from './TestFields';

const AnyBox = Box as any;

interface FormFields {
  identifier: string;
}

export const AddTestToIdentifierPage: FC = () => {
  const { preferredAuthMethod } = useConfig()!;
  const { translate } = useTranslations();
  const { permittedTestTypes } = useTestTypes();
  const { create, creating, error, userAfterSuccess } = useUserWithTestCreation();
  const [selectedTestTypeId, setSelectedTestTypeId] = useState('');

  useEffect(() => {
    if (!selectedTestTypeId && permittedTestTypes.length > 0) {
      setSelectedTestTypeId(permittedTestTypes[0].id);
    }
  }, [permittedTestTypes, selectedTestTypeId]);
  const selectedTestType = permittedTestTypes.find((type) => type.id === selectedTestTypeId);

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
      identifier: '',
      ...(selectedTestType ? getInitialValues(selectedTestType.resultsSchema) : {}),
    },
    enableReinitialize: true,
    validationSchema: yup.object().shape({
      identifier: identifierSchemaForMethod[preferredAuthMethod],
      ...(selectedTestType ? getValidationSchema(selectedTestType.resultsSchema) : {}),
    }),
    onSubmit: async ({ identifier, notes, ...details }, { resetForm }) => {
      const createUserCommand = {
        authenticationDetails: { method: preferredAuthMethod, identifier },
      };
      const createTestCommand = {
        testTypeId: selectedTestTypeId,
        results: {
          details,
          notes,
        },
      };

      await create(createUserCommand, createTestCommand);

      resetForm();
    },
  });

  const fieldError = (key: keyof FormFields) =>
    form.touched[key] && form.errors[key] ? <Text>{form.errors[key]}</Text> : null;

  return (
    <>
      <Heading as="h1" mb={4}>
        <Message>addTestToIdentifierPage.heading</Message>
      </Heading>

      <AnyBox as="form" sx={{ display: 'grid', gridGap: 4 }} onSubmit={form.handleSubmit} mb={4}>
        <Box>
          <Label htmlFor="identifier">
            <Message>{labelKeyForMethod[preferredAuthMethod]}</Message> *
          </Label>
          <Input
            id="identifier"
            {...form.getFieldProps('identifier')}
            placeholder={translate(placeholderKeyForMethod[preferredAuthMethod])}
            autoFocus
          />
          {fieldError('identifier')}
        </Box>

        <Box>
          <Label htmlFor="test-type">
            <Message>addTestPage.testType.label</Message> *
          </Label>

          <Select
            id="test-type"
            value={selectedTestTypeId}
            onChange={(event) => setSelectedTestTypeId(event.target.value)}
            required
          >
            {permittedTestTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Select>
        </Box>

        {selectedTestType && <TestFields form={form} testType={selectedTestType} />}

        <Button variant="block" type="submit" disabled={!form.isValid || creating}>
          <Message>addTestToIdentifierPage.button</Message>
        </Button>
      </AnyBox>

      {userAfterSuccess && (
        <Alert variant="success" mb={2}>
          <Message params={{ identifier: userAfterSuccess.authenticationDetails.identifier }}>
            addTestToIdentifierPage.success
          </Message>
        </Alert>
      )}

      {error && (
        <Alert variant="error" mb={2}>
          {error.message}
        </Alert>
      )}
    </>
  );
};
