import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { ThemeProvider, Spinner, Container } from 'theme-ui';
import { Provider as TranslationProvider } from 'retranslate';

import { Navigation } from './Navigation';
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
import {
  PERMISSIONS_REQUIRED_FOR_ADD_TEST_TO_IDENTIFIER_PAGE,
  PERMISSIONS_REQUIRED_FOR_USER_CREATION_PAGE,
  ADD_TEST_TO_IDENTIFIER_PATH,
  USER_CREATION_PATH,
  HOME_PATH,
} from './paths';

// Includes fairly large dependencies for QR scanning and workers
const ScanPage = lazy(async () => {
  const { ScanPage } = await import('./scanning');
  return { default: ScanPage };
});

const App = () => {
  const { defaultLanguage } = useConfig();
  const { userId } = useAuthentication();
  const isLoggedIn = !!userId;

  return (
    <TranslationProvider
      messages={messages}
      language={defaultLanguage}
      fallbackLanguage={Language.ENGLISH}
    >
      <BrowserRouter>
        <Suspense fallback={<Spinner variant="spinner.main" />}>
          <Switch>
            <AuthenticatedRoute path="/scan" exact>
              <Container sx={{ maxWidth: 'pageWidth' }}>
                <ScanPage />
              </Container>
            </AuthenticatedRoute>

            <>
              {isLoggedIn && <Navigation />}

              <Container variant="page">
                <Switch>
                  <Route
                    path="/"
                    exact
                    render={() => <Redirect to={isLoggedIn ? HOME_PATH : '/login'} />}
                  />
                  <Route path="/login" exact>
                    <LoginPage />
                  </Route>
                  <Route path="/authentication-callback" exact>
                    <AuthenticationCallbackPage />
                  </Route>
                  <AuthenticatedRoute path={HOME_PATH}>
                    <IdentityPage />
                  </AuthenticatedRoute>
                  <AuthenticatedRoute path="/users/:userId/add-test">
                    <AddTestPage />
                  </AuthenticatedRoute>
                  <AuthenticatedRoute path="/users/:userId">
                    <IdentityPage />
                  </AuthenticatedRoute>
                  <AuthenticatedRoute path="/tests/:testId" exact>
                    <TestDetailPage />
                  </AuthenticatedRoute>
                  <AuthenticatedRoute
                    path={ADD_TEST_TO_IDENTIFIER_PATH}
                    exact
                    requiredPermissions={PERMISSIONS_REQUIRED_FOR_ADD_TEST_TO_IDENTIFIER_PAGE}
                  >
                    <AddTestToIdentifierPage />
                  </AuthenticatedRoute>
                  <AuthenticatedRoute
                    path={USER_CREATION_PATH}
                    exact
                    requiredPermissions={PERMISSIONS_REQUIRED_FOR_USER_CREATION_PAGE}
                  >
                    <BulkUserCreationPage />
                  </AuthenticatedRoute>
                  render=
                  {() => {
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
                    requiredPermissions={['CREATE_USERS', 'CREATE_TESTS_WITHOUT_ACCESS_PASS']}
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
              </Container>
            </>
          </Switch>
        </Suspense>
      </BrowserRouter>
    </TranslationProvider>
  );
};

const ConfiguredApp = () => {
  const config = useConfig();

  return (
    <AuthenticationProvider>
      <ThemeProvider theme={theme}>
        {config ? <App /> : <Spinner variant="spinner.main" />}
      </ThemeProvider>
    </AuthenticationProvider>
  );
};

export default ConfiguredApp;
