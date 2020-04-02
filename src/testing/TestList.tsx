import React from 'react';
import { Flex, Box, Spinner, Text, Button, ButtonProps } from 'theme-ui';
import { LinkProps, Link } from 'react-router-dom';
import { format } from 'date-fns';

import { Plus as PlusIcon } from '../icons';
import { useTests, useTestTypes } from '../resources';

const LinkButton = Button as React.FC<ButtonProps & LinkProps>;

export const TestList = ({ userId }: { userId: string }) => {
  const { loading: loadingTests, tests } = useTests(userId);
  const { permittedTestTypes, testTypes, loading: loadingTestTypes } = useTestTypes();

  if (loadingTests || loadingTestTypes) {
    return <Spinner mx="auto" mt={4} sx={{ display: 'block' }} />;
  }

  // TODO: finish implementing design for this
  return (
    <>
      {!tests.length ? (
        <Text mt={4}>No tests yet.</Text>
      ) : (
        <Box as="ul" sx={{ listStyleType: 'none' }} px={0}>
          {tests.map(test => {
            const testType = testTypes.find(({ id }) => id === test.testTypeId)!;
            return (
              <Flex
                key={test.id}
                py={3}
                as="li"
                sx={{ justifyContent: 'space-between', borderBottom: '1px solid #DEDEDE' }}
              >
                <Text>{testType.name}</Text>
                <Text>{format(new Date(test.creationTime), 'dd MMM yyyy')}</Text>
              </Flex>
            );
          })}
        </Box>
      )}
      {permittedTestTypes.length ? (
        <LinkButton as={Link} to={`/users/${userId}/add-test`} variant="block" mt={4}>
          <PlusIcon mr={1} /> Add new test result
        </LinkButton>
      ) : null}
    </>
  );
};
