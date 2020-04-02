import React from 'react';
import { Flex, Box, Spinner, Text, Button, ButtonProps, Heading, Badge } from 'theme-ui';
import { LinkProps, Link } from 'react-router-dom';
import { format } from 'date-fns';

import { Test } from '../api';
import { Plus as PlusIcon, Caret } from '../icons';
import { useTests, useTestTypes } from '../resources';

const LinkButton = Button as React.FC<ButtonProps & LinkProps>;
export const TestList = ({ userId }: { userId: string }) => {
  const { loading: loadingTests, tests } = useTests(userId);
  const { permittedTestTypes, loading: loadingTestTypes } = useTestTypes();

  if (loadingTests || loadingTestTypes) {
    return <Spinner mx="auto" mt={4} sx={{ display: 'block' }} />;
  }

  return (
    <>
      {!tests.length ? (
        <Text mt={4}>No tests yet.</Text>
      ) : (
        <Box as="ul" sx={{ listStyleType: 'none' }} px={0}>
          {tests.map(test => {
            return (
              <Flex
                key={test.id}
                py={3}
                as="li"
                sx={{ justifyContent: 'space-between', borderBottom: '1px solid #DEDEDE' }}
              >
                <Box>
                  <Heading as="h3">{format(new Date(test.creationTime), 'd MMM yyyy')}</Heading>
                  <Badge mt={2} variant="primary">
                    Test interpretation will be here
                  </Badge>
                </Box>
                <Caret sx={{ alignSelf: 'center' }} />
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
