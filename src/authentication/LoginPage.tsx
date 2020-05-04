import React from 'react';

import { useConfig } from '../common';
import { MagicLinkLoginPage } from './MagicLinkLoginPage';
import { EstonianIdLoginPage } from './EstonianIdLoginPage';
import { AuthenticationMethod } from '../api';
import { Spinner } from 'theme-ui';

export const LoginPage = () => {
  const config = useConfig();
  if (!config) {
    return <Spinner variant="spinner.main" />;
  }
  const LoginImplementation = loginImplementation[config.authenticationMethod];
  return <LoginImplementation />;
};

const loginImplementation: Record<AuthenticationMethod, React.FC> = {
  ESTONIAN_ID: EstonianIdLoginPage,
  MAGIC_LINK: MagicLinkLoginPage,
};
