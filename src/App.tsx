import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { ThemeProvider } from 'theme-ui';

import {
  LoginPage,
  LinkPage,
  Provider as AuthenticationProvider,
  AuthenticatedRoute,
  useAuthentication,
} from './authentication';

import theme from './theme';
import { NotFoundPage } from './staticPages';

import { ScanPage } from './scanning';
import { IdentityPage } from './identity';

const App = () => {
  const { userId } = useAuthentication();
  return (
    <Switch>
      <Route
        path="/"
        exact
        render={() => {
          if (userId) {
            return <Redirect to={`/users/${userId}`} />;
          }
          return <Redirect to="/login" />;
        }}
      />
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
