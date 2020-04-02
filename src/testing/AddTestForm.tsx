import React from 'react';
import { Box, Text, Label, Input, Checkbox, Button, Textarea } from 'theme-ui';
import { useFormik } from 'formik';

import { CreateTestCommand, TestType, FilledSchema, ObjectSchema, FieldSchema } from '../api';

const AnyBox = Box as any;

type FormValues = FilledSchema & { notes: string };

export const AddTestForm = ({
  testType,
  onComplete,
}: {
  testType: TestType;
  onComplete: (command: CreateTestCommand) => any;
}) => {
  const form = useFormik({
    initialValues: {
      ...getInitialValues(testType.resultsSchema),
      notes: '',
    },
    onSubmit({ notes, ...details }: FormValues) {
      onComplete({ testTypeId: testType.id, results: { details, notes } });
    },
  });

  return (
    <>
      <AnyBox as="form" sx={{ display: 'grid', gridGap: 4 }} onSubmit={form.handleSubmit}>
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
          <Label htmlFor="test-notes">Additional notes</Label>
          <Textarea id="test-notes" {...form.getFieldProps('notes')} sx={{ resize: 'vertical' }} />
        </Box>

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
