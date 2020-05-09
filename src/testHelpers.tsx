import React, { ReactElement } from 'react';
import { render, RenderResult } from '@testing-library/react';
import { Provider as TranslationProvider } from 'retranslate';

import { messages } from './i18n/messages';
import { TestType } from './api';

export function renderWrapped(element: ReactElement): RenderResult {
  const wrap = (element: ReactElement): JSX.Element => (
    <TranslationProvider messages={messages} fallbackLanguage="en">
      {element}
    </TranslationProvider>
  );
  const renderResult = render(wrap(element));

  return {
    ...renderResult,
    rerender: (newElement: ReactElement): void => renderResult.rerender(wrap(newElement)),
  };
}

export function aTestType(): TestType {
  return {
    id: 'some-test-type-id',
    name: 'PCR test',
    resultsSchema: {
      type: 'object',
      properties: {
        positive: {
          title: 'Test result',
          type: 'boolean',
          oneOf: [
            {
              title: 'Negative',
              const: false,
            },
            {
              title: 'Positive',
              const: true,
            },
          ],
        },
      },
      required: ['positive'],
    },
    neededPermissionToAddResults: 'CREATE_TESTS_WITHOUT_ACCESS_PASS',
  };
}

export function antibodyTestType(): TestType {
  return {
    id: 'some-antibody-test-type',
    name: 'Antibody test',
    resultsSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: 'COVID-19 Take Home Test',
      type: 'object',
      properties: {
        c: {
          title: 'Control',
          type: 'boolean',
          description: "Indicator if sample doesn't show COVID-19",
        },
        igg: {
          title: 'IgG',
          type: 'boolean',
          description: 'Indicator if sample shows IgG positive',
        },
        igm: {
          title: 'IgM',
          type: 'boolean',
          description: 'Indicator if sample shows IgM positive',
        },
      },
    },
    neededPermissionToAddResults: 'CREATE_TESTS_WITHOUT_ACCESS_PASS',
    interpretationRules: [
      {
        output: {
          namePattern: 'IgG antibodies found',
          theme: 'POSITIVE',
          propertyVariables: {},
        },
        condition: {
          type: 'object',
          properties: {
            c: {
              type: 'boolean',
              const: true,
            },
            igg: {
              type: 'boolean',
              const: true,
            },
          },
          required: ['c', 'igg'],
        },
      },
      {
        output: {
          namePattern: 'IgG antibodies not found',
          theme: 'MUTED',
          propertyVariables: {},
        },
        condition: {
          type: 'object',
          properties: {
            c: {
              type: 'boolean',
              const: true,
            },
            igg: {
              type: 'boolean',
              const: false,
            },
          },
          required: ['c', 'igg'],
        },
      },
      {
        output: {
          namePattern: 'IgM antibodies found',
          theme: 'NEUTRAL',
        },
        condition: {
          type: 'object',
          properties: {
            c: {
              type: 'boolean',
              const: true,
            },
            igm: {
              type: 'boolean',
              const: true,
            },
          },
          required: ['c', 'igm'],
        },
      },
      {
        output: {
          namePattern: 'IgM antibodies not found',
          theme: 'MUTED',
        },
        condition: {
          type: 'object',
          properties: {
            c: {
              type: 'boolean',
              const: true,
            },
            igm: {
              type: 'boolean',
              const: false,
            },
          },
          required: ['c', 'igm'],
        },
      },
      {
        output: {
          namePattern: 'Test Invalid',
          theme: 'MUTED',
        },
        condition: {
          type: 'object',
          properties: {
            c: {
              type: 'boolean',
              const: false,
            },
          },
          required: ['c'],
        },
      },
    ],
  };
}
