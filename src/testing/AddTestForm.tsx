import React from 'react';
import { Box, Text, Label, Input, Checkbox, Button } from 'theme-ui';
import { useFormik } from 'formik';

import { CreateTestCommand, TestType, FilledSchema, ObjectSchema, FieldSchema } from '../api';

const AnyBox = Box as any;

export const AddTestForm = ({
  testType,
  onComplete,
}: {
  testType: TestType;
  onComplete: (command: CreateTestCommand) => any;
}) => {
  // TODO: validation
  // TODO: supporting more arbitrary schemas
  const form = useFormik({
    initialValues: getInitialValues(testType.resultsSchema),
    onSubmit(details: FilledSchema) {
      onComplete({ testTypeId: testType.id, results: { details } });
    },
  });

  return (
    <>
      <Text>Result</Text>
      <AnyBox as="form" sx={{ display: 'grid', gridGap: 4 }} onSubmit={form.handleSubmit}>
        {Object.entries(testType.resultsSchema.properties).map(([key, value]) => {
          if (value.type === 'boolean') {
            return (
              <Box key={key}>
                <Label>
                  <Checkbox {...form.getFieldProps(key)} />
                  {value.title}
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
        <Button type="submit" variant="block">
          Save
        </Button>
      </AnyBox>
    </>
  );
};

function getInitialValues(schema: ObjectSchema) {
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
