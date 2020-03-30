import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { ThemeProvider } from 'theme-ui';

import {
  LoginPage,
  LinkPage,
  Provider as AuthenticationProvider,
  AuthenticatedRoute,
} from './authentication';

import theme from './theme';
import { NotFoundPage } from './staticPages';

import { ScanPage } from './scanning';
import { IdentityPage } from './identity';

const App = () => {
  return (
    <Switch>
      <Route path="/" exact render={() => <Redirect to="/login" />} />
      <Route path="/login" exact>
        <LoginPage />
      </Route>
      <Route path="/link/:linkId" exact>
        <LinkPage />
      </Route>
      <AuthenticatedRoute path="/users/:userId">
        <IdentityPage />
      </AuthenticatedRoute>
      <AuthenticatedRoute path="/scan">
        <ScanPage />
      </AuthenticatedRoute>
      <Route path="*">
        <NotFoundPage />
      </Route>
    </Switch>
  );
};

const ConfiguredApp = () => {
  return (
    <AuthenticationProvider>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </AuthenticationProvider>
  );
};

export default ConfiguredApp;
