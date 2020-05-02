import React, { ReactElement } from 'react';
import { render, RenderResult } from '@testing-library/react';
import { Provider as TranslationProvider } from 'retranslate';

import { messages } from './i18n/messages';

export function renderWrapped(element: ReactElement): RenderResult {
  return render(
    <TranslationProvider messages={messages} fallbackLanguage="en">
      {element}
    </TranslationProvider>
  );
}
