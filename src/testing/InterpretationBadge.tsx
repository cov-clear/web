import React from 'react';
import { Badge, BadgeProps } from 'theme-ui';

import { ResultInterpretation, ResultInterpretationTheme } from '../api';

const AnyBadge = Badge as any;

export const InterpretationBadge = ({
  interpretation,
  ...rest
}: {
  interpretation: ResultInterpretation;
} & BadgeProps) => {
  return (
    <AnyBadge variant={variantForInterpretationTheme(interpretation.theme)} {...rest}>
      {interpretation.name}
    </AnyBadge>
  );
};

function variantForInterpretationTheme(theme: ResultInterpretationTheme) {
  switch (theme) {
    case 'MUTED':
      return 'muted';
    case 'NEGATIVE':
      return 'negative';
    case 'POSITIVE':
    case 'NEUTRAL': // fallthrough
    default:
      return 'neutral';
  }
}
