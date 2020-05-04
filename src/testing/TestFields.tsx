import React, { FC } from 'react';
import { Box, Text, Label, Input, Checkbox, Textarea } from 'theme-ui';
import { FormikContextType, FormikValues } from 'formik';
import { Message } from 'retranslate';

import { TestType, ObjectSchema, FieldSchema } from '../api';

interface TestFieldsProps {
  form: FormikContextType<FormikValues>;
  testType: TestType;
}

export const TestFields: FC<TestFieldsProps> = ({ form, testType }) => {
  return (
    <>
      {Object.entries(testType.resultsSchema.properties).map(([key, value]) => {
        if (value.type === 'boolean') {
          return (
            <Box key={key}>
              <Label>
                <Checkbox {...form.getFieldProps(key)} />
                <Box>
                  {value.title}
                  {value.description ? (
                    <Text as="small" sx={{ display: 'block' }}>
                      {value.description}
                    </Text>
                  ) : null}
                </Box>
              </Label>
            </Box>
          );
        }

        return (
          <Box key={key}>
            <Label htmlFor={`test-${key}`}>{value.title}</Label>
            <Input
              type={value.type === 'number' ? 'number' : 'text'}
              id={`test-${key}`}
              {...form.getFieldProps(key)}
            />
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
  return Object.fromEntries(initialValueEntries);
}

function initialPropertyValue({ type }: FieldSchema) {
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
