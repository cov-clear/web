import React from 'react';
import { Spinner } from 'theme-ui';

import { useConfig } from '../common';
import { MagicLinkLoginPage } from './MagicLinkLoginPage';
import { EstonianIdLoginPage } from './EstonianIdLoginPage';
import { AuthenticationMethod } from '../api';

export const LoginPage = () => {
  const config = useConfig();
  if (!config) {
    return <Spinner variant="spinner.main" />;
  }
  const LoginImplementation = loginImplementation[config.preferredAuthMethod];
  return <LoginImplementation />;
};

const loginImplementation: Record<AuthenticationMethod, React.FC> = {
  ESTONIAN_ID: EstonianIdLoginPage,
  MAGIC_LINK: MagicLinkLoginPage,
};
