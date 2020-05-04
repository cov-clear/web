import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { ThemeProvider, Spinner } from 'theme-ui';
import { Provider as TranslationProvider } from 'retranslate';

import {
  LoginPage,
  AuthenticationCallbackPage,
  Provider as AuthenticationProvider,
  AuthenticatedRoute,
  useAuthentication,
} from './authentication';

import { messages } from './i18n/messages';
import theme from './theme';
import { NotFoundPage } from './staticPages';

import { IdentityPage } from './identity';
import { AddTestPage, TestDetailPage, AddTestToIdentifierPage } from './testing';
import { BulkUserCreationPage } from './admin';
import { useConfig } from './common';
import { Language } from './api';

// Includes fairly large dependencies for QR scanning and workers
const ScanPage = lazy(async () => {
  const { ScanPage } = await import('./scanning');
  return { default: ScanPage };
});

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
      <AuthenticatedRoute
        path="/add-test"
        exact
        requiredPermissions={['CREATE_USERS']} // TODO: Add 'CREATE_TESTS_WITHOUT_ACCESS_PASS' when test adding is there
      >
        <AddTestToIdentifierPage />
      </AuthenticatedRoute>
      <AuthenticatedRoute
        path="/admin/create-users"
        exact
        requiredPermissions={['BULK_CREATE_USERS']}
      >
        <BulkUserCreationPage />
      </AuthenticatedRoute>
      <Route path="*">
        <NotFoundPage />
      </Route>
    </Switch>
  );
};

const ConfiguredApp = () => {
  const { defaultLanguage } = useConfig();

  return (
    <AuthenticationProvider>
      <ThemeProvider theme={theme}>
        <TranslationProvider
          messages={messages}
          language={defaultLanguage}
          fallbackLanguage={Language.ENGLISH}
        >
          <BrowserRouter>
            <Suspense fallback={<Spinner variant="spinner.main" />}>
              <App />
            </Suspense>
          </BrowserRouter>
        </TranslationProvider>
      </ThemeProvider>
    </AuthenticationProvider>
  );
};

export default ConfiguredApp;
