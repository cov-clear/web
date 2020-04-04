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
import { AddTestPage, TestDetailPage } from './testing';

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
      <AuthenticatedRoute path="/users/:userId/add-test">
        <AddTestPage />
      </AuthenticatedRoute>
      <AuthenticatedRoute path="/users/:userId">
        <IdentityPage />
      </AuthenticatedRoute>
      <AuthenticatedRoute path="/tests/:testId" exact>
        <TestDetailPage />
      </AuthenticatedRoute>
      <AuthenticatedRoute path="/scan" exact>
        <ScanPage />
      </AuthenticatedRoute>
      <AuthenticatedRoute path="/admin/create-users" exact requiredPermission="BULK_CREATE_USERS">
        Create users
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
