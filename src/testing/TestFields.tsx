import React, { FC } from 'react';
import { Box, Text, Label, Input, Checkbox, Textarea, Radio } from 'theme-ui';
import { FormikContextType, FormikValues } from 'formik';
import { Message } from 'retranslate';
import * as yup from 'yup';

import { TestType, ObjectSchema, FieldSchema } from '../api';

interface TestFieldsProps {
  form: FormikContextType<FormikValues>;
  testType: TestType;
}

export const TestFields: FC<TestFieldsProps> = ({ form, testType }) => {
  const fieldError = (key: keyof TestType['resultsSchema']['properties']) =>
    form.submitCount > 0 && form.errors[key] ? (
      <Text variant="validation">
        <Message>testFields.error.generic</Message>
      </Text>
    ) : null;

  // TODO: Extract generic JSON schema generator
  return (
    <>
      {Object.entries(testType.resultsSchema.properties).map(([key, value]) => {
        const isKeyRequired = testType.resultsSchema.required?.includes(key);

        if (value.const) {
          return null;
        }

        if (value.oneOf) {
          return (
            <Box key={key}>
              {value.title} {isKeyRequired && '*'}
              {value.oneOf.map((option) => (
                <Label key={`${option.const}`}>
                  <Radio
                    checked={form.getFieldProps(key).value === option.const}
                    value={typeof option.const === 'number' ? option.const : `${option.const}`}
                    onChange={({ target }) =>
                      form.setFieldValue(
                        key,
                        typeof option.const === 'boolean' ? target.value === 'true' : target.value
                      )
                    }
                  />
                  {option.title}
                </Label>
              ))}
              {fieldError(key)}
            </Box>
          );
        }

        if (value.type === 'boolean') {
          return (
            <Box key={key}>
              <Label>
                <Checkbox
                  {...form.getFieldProps(key)}
                  checked={form.getFieldProps(key).value || false}
                />
                <Box>
                  {value.title} {isKeyRequired && '*'}
                  {value.description ? (
                    <Text as="small" sx={{ display: 'block' }}>
                      {value.description}
                    </Text>
                  ) : null}
                </Box>
              </Label>
              <Text>{fieldError(key)}</Text>
            </Box>
          );
        }

        return (
          <Box key={key}>
            <Label htmlFor={`test-${key}`}>
              {value.title} {isKeyRequired && '*'}
            </Label>
            <Input
              type={value.type === 'number' ? 'number' : 'text'}
              id={`test-${key}`}
              {...form.getFieldProps(key)}
            />
            {fieldError(key)}
          </Box>
        );
      })}

      <Box>
        <Label htmlFor="test-notes">
          <Message>addTestForm.notes.label</Message>
        </Label>
        <Textarea id="test-notes" {...form.getFieldProps('notes')} sx={{ resize: 'vertical' }} />
      </Box>
    </>
  );
};

export function getInitialValues(schema: ObjectSchema) {
  const initialValueEntries = Object.entries(schema.properties).map(([key, value]) => [
    key,
    initialPropertyValue(value),
  ]);
  return { ...Object.fromEntries(initialValueEntries), notes: '' };
}

export function getValidationSchema(schema: ObjectSchema) {
  const requiredFields = schema.required || [];

  const entries = Object.entries(schema.properties).map(([key, value]) => {
    const schema = validationSchema(value, requiredFields.includes(key));
    return [key, schema];
  });
  return Object.fromEntries(entries);
}

function validationSchema({ type, oneOf }: FieldSchema, required: boolean) {
  let validation;
  if (oneOf) {
    validation = yup.mixed().oneOf(oneOf.map(({ const: value }) => value));
  } else {
    switch (type) {
      case 'boolean':
        validation = yup.boolean();
        break;
      case 'number':
        validation = yup.number();
        break;
      case 'null':
        validation = yup.string().nullable();
        break;
      case 'string': // fallthrough
      default:
        validation = yup.string();
        break;
    }
  }

  if (required) {
    validation = validation.required();
  }

  return validation;
}

function initialPropertyValue({ type, oneOf, const: constValue }: FieldSchema) {
  if (constValue) {
    return constValue;
  }

  if (oneOf) {
    return null;
  }

  switch (type) {
    case 'boolean':
      return false;
    case 'number':
      return 0;
    case 'null':
      return null;
    case 'string': // fallthrough
    default:
      return '';
  }
}
