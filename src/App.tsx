import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { ThemeProvider, Container } from 'theme-ui';

import {
  LoginPage,
  LinkPage,
  Provider as AuthenticationProvider,
  AuthenticatedRoute,
} from './authentication';
import { IdentityPage } from './identity';

import theme from './theme';
import { NotFoundPage } from './staticPages';

const App = () => {
  return (
    <Container sx={{ maxWidth: '600px' }} pt={6} pb={5} px={3}>
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
        <Route path="*">
          <NotFoundPage />
        </Route>
      </Switch>
    </Container>
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
