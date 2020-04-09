import React, { useState, useEffect } from 'react';
import { Heading, Select, Label, Box } from 'theme-ui';

import { CreateTestCommand, createTest } from '../api';
import { Redirect, useHistory, useRouteMatch } from 'react-router-dom';

import { useTestTypes } from '../resources';
import { useAuthentication } from '../authentication';
import { ViewingOtherProfileHeader } from '../identity';
import { ConfirmIdentity } from './ConfirmIdentity';
import { AddTestForm } from './AddTestForm';

export const AddTestPage = () => {
  const {
    url,
    params: { userId },
  } = useRouteMatch<{ userId: string }>();
  const [selectedTestTypeId, setSelectedTestTypeId] = useState<string>('');
  const [testResult, setTestResult] = useState<CreateTestCommand | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const history = useHistory();
  const { token, userId: ownUserId } = useAuthentication();
  const isOwnUser = userId === ownUserId;
  const { permittedTestTypes } = useTestTypes();
  const selectedTestType = permittedTestTypes.find((type) => type.id === selectedTestTypeId);
  const confirmPageMatch = useRouteMatch(`${url}/confirm`);

  useEffect(() => {
    if (!selectedTestTypeId && permittedTestTypes.length) {
      setSelectedTestTypeId(permittedTestTypes[0].id);
    }
  }, [permittedTestTypes, selectedTestTypeId]);

  async function handleSubmit(testResult: CreateTestCommand) {
    if (isOwnUser) {
      return saveAndFinish(testResult);
    } else {
      setTestResult(testResult);
      history.push(`${url}/confirm`);
    }
  }

  async function handleConfirmIdentity() {
    if (testResult) {
      return saveAndFinish(testResult);
    }
  }

  async function saveAndFinish(testResult: CreateTestCommand) {
    setSubmitting(true);
    await createTest(userId, testResult, { token: token! });
    history.push(`/users/${userId}/tests`);
  }

  if (confirmPageMatch) {
    if (!testResult) {
      return <Redirect to={url} />;
    }
    return (
      <>
        {!isOwnUser ? <ViewingOtherProfileHeader /> : null}
        <Box pt={isOwnUser ? undefined : 4}>
          <ConfirmIdentity userId={userId} loading={submitting} onConfirm={handleConfirmIdentity} />
        </Box>
      </>
    );
  }

  return (
    <>
      {!isOwnUser ? <ViewingOtherProfileHeader /> : null}
      <Box pt={isOwnUser ? undefined : 4}>
        <Heading as="h1" mb={5}>
          Enter new test result
        </Heading>
        {permittedTestTypes.length > 1 ? (
          <>
            <Label htmlFor="test-type">Test type</Label>
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
        {selectedTestType ? (
          <AddTestForm
            key={selectedTestType.id}
            testType={selectedTestType}
            onComplete={handleSubmit}
          />
        ) : null}
      </Box>
    </>
  );
};
