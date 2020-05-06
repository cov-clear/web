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
      title: 'Test result',
      type: 'object',
      properties: {
        positive: {
          title: 'Test result',
          type: 'boolean',
          oneOf: [
            {
              title: 'Positive',
              const: true,
            },
            {
              title: 'Negative',
              const: false,
            },
          ],
        },
      },
      required: ['positive'],
    },
    neededPermissionToAddResults: 'CREATE_TESTS_WITHOUT_ACCESS_PASS',
  };
}
