import React, { Fragment } from 'react';
import { useParams } from 'react-router-dom';
import { Heading, Spinner, Text, Divider, Box, Grid } from 'theme-ui';
import { useTranslations, Message } from 'retranslate';

import { useI18n } from '../common';
import { useTest } from '../resources';
import { InterpretationBadge } from './InterpretationBadge';

export const TestDetailPage = () => {
  const { testId } = useParams<{ testId: string }>();
  const { translate } = useTranslations();
  const { test, loading } = useTest(testId);
  const { formatDate } = useI18n();

  if (loading || !test) {
    return <Spinner variant="spinner.main" />;
  }

  const { testType } = test;

  const testResults =
    test?.results && testType
      ? Object.entries(testType.resultsSchema.properties).map(([key, value]) => {
          return {
            label: value.title,
            value: test?.results?.details[key],
          };
        })
      : [];
  testResults.unshift({
    label: translate('testDetailPage.results.label'),
    value: testType?.name,
  });

  return (
    <>
      <Heading as="h1" mb={2}>
        <Message>testDetailPage.heading</Message>
      </Heading>

      <Text mb={2}>
        <Message>testDetailPage.date</Message>: {formatDate(new Date(test!.creationTime))}
      </Text>

      {test.resultsInterpretations?.map((interpretation, index) => (
        <InterpretationBadge key={index} interpretation={interpretation} mr={2} />
      ))}

      {test?.results ? (
        <>
          <Text mt={5}>
            <Message>testDetailPage.resultDetails</Message>
          </Text>
          <Divider mb={3} />
          <Grid gap={3} columns="max-content 2fr" as="dl">
            {testResults.map(({ value, label }, index) => (
              <Fragment key={index}>
                <Box as="dt">{label}:</Box>
                <Box as="dd">
                  <strong>
                    {typeof value === 'boolean'
                      ? value
                        ? translate('testDetailPage.yes')
                        : translate('testDetailPage.no')
                      : value}
                  </strong>
                </Box>
              </Fragment>
            ))}
          </Grid>
        </>
      ) : null}

      {test?.results?.notes ? (
        <>
          <Text mt={5}>
            <Message>testDetailPage.notes</Message>
          </Text>
          <Divider mb={3} />
          {test.results.notes}
        </>
      ) : null}
    </>
  );
};
