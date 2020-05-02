import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { ThemeProvider } from 'theme-ui';
import { Provider as TranslationProvider } from 'retranslate';

import {
  LoginPage,
  EstonianIdLoginPage,
  AuthenticationCallbackPage,
  Provider as AuthenticationProvider,
  AuthenticatedRoute,
  useAuthentication,
} from './authentication';

import { messages } from './i18n/messages';
import theme from './theme';
import { NotFoundPage } from './staticPages';

import { ScanPage } from './scanning';
import { IdentityPage } from './identity';
import { AddTestPage, TestDetailPage } from './testing';
import { BulkUserCreationPage } from './admin';

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
      <Route path="/estonian-id-login" exact>
        <EstonianIdLoginPage />
      </Route>
      <Route path="/authentication-callback" exact>
        <AuthenticationCallbackPage />
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
        <BulkUserCreationPage />
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
        <TranslationProvider messages={messages} fallbackLanguage="en">
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </TranslationProvider>
      </ThemeProvider>
    </AuthenticationProvider>
  );
};

export default ConfiguredApp;
