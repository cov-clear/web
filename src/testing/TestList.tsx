import React from 'react';
import { Flex, Box, Spinner, Text, Button, ButtonProps, Heading, FlexProps } from 'theme-ui';
import { LinkProps, Link } from 'react-router-dom';
import { Message } from 'retranslate';

import { formatDate } from '../i18n/date';
import { Plus as PlusIcon, Caret } from '../icons';
import { useTests, useTestTypes } from '../resources';

import { InterpretationBadge } from './InterpretationBadge';

const LinkButton = Button as React.FC<ButtonProps & LinkProps>;
const LinkFlex = Flex as React.FC<FlexProps & LinkProps>;

export const TestList = ({ userId }: { userId: string }) => {
  const { loading: loadingTests, tests } = useTests(userId);
  const { permittedTestTypes, loading: loadingTestTypes } = useTestTypes();

  if (loadingTests || loadingTestTypes) {
    return <Spinner mx="auto" mt={6} sx={{ display: 'block' }} />;
  }

  return (
    <>
      {!tests.length ? (
        <Text variant="muted" my={5} sx={{ textAlign: 'center' }}>
          <Message>testList.description</Message>
        </Text>
      ) : (
        <Box as="ul" sx={{ listStyleType: 'none' }} px={0}>
          {tests.map((test) => {
            return (
              <Box key={test.id} as="li">
                <LinkFlex
                  as={Link}
                  to={`/tests/${test.id}`}
                  py={3}
                  sx={{
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #DEDEDE',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  <Box>
                    <Heading as="h3" mb={2}>
                      {/* TODO: Add Estonian date formatting */}
                      {formatDate(new Date(test.creationTime))}
                    </Heading>
                    {test.resultsInterpretations?.map((interpretation, index) => (
                      <InterpretationBadge key={index} interpretation={interpretation} mr={2} />
                    ))}
                  </Box>
                  <Caret sx={{ alignSelf: 'center' }} />
                </LinkFlex>
              </Box>
            );
          })}
        </Box>
      )}
      {permittedTestTypes.length ? (
        <LinkButton as={Link} to={`/users/${userId}/add-test`} variant="block" mt={4}>
          <PlusIcon mr={1} /> <Message>testList.button</Message>
        </LinkButton>
      ) : null}
    </>
  );
};
