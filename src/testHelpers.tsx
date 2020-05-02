import React, { ReactElement } from 'react';
import { render, RenderResult } from '@testing-library/react';
import { Provider as TranslationProvider } from 'retranslate';

import { messages } from './i18n/messages';

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
