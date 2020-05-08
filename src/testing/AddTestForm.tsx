import React from 'react';
import { Box, Button } from 'theme-ui';
import { useFormik } from 'formik';
import { Message } from 'retranslate';

import { CreateTestCommand, TestType, FilledSchema } from '../api';

import { getInitialValues, TestFields } from './TestFields';

const AnyBox = Box as any;

type FormValues = FilledSchema & { notes: string };

// TODO: Translate strings coming from the server
export const AddTestForm = ({
  testType,
  onComplete,
}: {
  testType: TestType;
  onComplete: (command: CreateTestCommand) => any;
}) => {
  const form: any = useFormik({
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
        <TestFields form={form} testType={testType} />

        <Button type="submit" variant="block">
          <Message>addTestForm.button</Message>
        </Button>
      </AnyBox>
    </>
  );
};
