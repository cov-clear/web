import React, { useState, useEffect } from 'react';
import {
  Message,
  Button,
  Text,
  Heading,
  Select,
  Spinner,
  Label,
  Box,
  Input,
  Checkbox,
} from 'theme-ui';
import { useFormik } from 'formik';
import { format } from 'date-fns';

import {
  CreateTestCommand,
  TestType,
  FieldSchema,
  ObjectSchema,
  FilledSchema,
  createTest,
} from '../api';
import { useTestTypes, useUser } from '../resources';
import { useAuthentication } from '../authentication';
import { useHistory } from 'react-router-dom';

export const AddTestFlow = ({ userId }: { userId: string }) => {
  const [selectedTestTypeId, setSelectedTestTypeId] = useState<string>();
  const [testResult, setTestResult] = useState<CreateTestCommand | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const history = useHistory();
  const { token } = useAuthentication();
  const { permittedTestTypes } = useTestTypes();
  const selectedTestType = permittedTestTypes.find((type) => type.id === selectedTestTypeId);

  useEffect(() => {
    if (!selectedTestTypeId && permittedTestTypes.length) {
      setSelectedTestTypeId(permittedTestTypes[0].id);
    }
  }, [permittedTestTypes, selectedTestTypeId]);

  async function handleSubmit() {
    setSubmitting(true);
    await createTest(userId, testResult!, { token: token! });
    history.push(`/users/${userId}/tests`);
  }

  if (testResult) {
    // TODO: do this via react-router instead, so they can navigate back to the form.
    return <ConfirmIdentity userId={userId} loading={submitting} onConfirm={handleSubmit} />;
  }

  return (
    <>
      <Heading as="h1" mb={5}>
        Enter new test result
      </Heading>
      <Label htmlFor="test-type">Test type</Label>
      <Select
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
      {selectedTestType ? (
        <AddTestForm testType={selectedTestType} onComplete={setTestResult} />
      ) : null}
    </>
  );
};

const AnyBox = Box as any;

const AddTestForm = ({
  testType,
  onComplete,
}: {
  testType: TestType;
  onComplete: (command: CreateTestCommand) => any;
}) => {
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

const ConfirmIdentity = ({
  userId,
  onConfirm,
  loading,
}: {
  userId: string;
  onConfirm: () => any;
  loading: boolean;
}) => {
  const { user } = useUser(userId);
  if (!user) {
    return <Spinner mx="auto" mt={4} sx={{ display: 'block' }} />;
  }

  const { firstName, lastName, dateOfBirth } = user.profile!;
  const { address1, address2, city, region, postcode } = user.address!;
  const text = (value?: string) => (value ? <Text>{value}</Text> : null);
  // TODO: icon for warning message
  // TODO: show country here
  return (
    <>
      <Message mb={3} variant="warning">
        <Text>Confirm identity</Text>
        <Text as="small">Check the patient's photo ID to confirm these details are correct</Text>
      </Message>
      <Heading as="h1" mb={3}>
        {firstName} {lastName}
      </Heading>
      <Text mb={4}>Date of birth: {format(new Date(dateOfBirth), 'dd/MM/yyyy')}</Text>
      {text(address1)}
      {text(address2)}
      {text(city)}
      {text(region)}
      {text(postcode)}
      <Button variant="block" mt={4} onClick={onConfirm} disabled={loading}>
        Confirm patient's identity
      </Button>
    </>
  );
};
