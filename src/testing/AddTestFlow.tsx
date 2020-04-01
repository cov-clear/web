import React, { useState, useEffect } from 'react';
import { Heading, Select, Label } from 'theme-ui';

import { CreateTestCommand, createTest } from '../api';
import { useHistory } from 'react-router-dom';

import { useTestTypes } from '../resources';
import { useAuthentication } from '../authentication';
import { ConfirmIdentity } from './ConfirmIdentity';
import { AddTestForm } from './AddTestForm';

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

