import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { ThemeProvider, Container } from 'theme-ui';

import {
  LoginPage,
  LinkPage,
  Provider as AuthenticationProvider,
  AuthenticatedRoute,
} from './authentication';
import { IdentityPage } from './identity';

import theme from './theme';
import { NotFoundPage, StartPage } from './staticPages';

const App = () => {
  return (
    <Container sx={{ maxWidth: '600px' }} pt={5} pb={4} px={2}>
      <Switch>
        <Route path="/" exact>
          <StartPage />
        </Route>
        <Route path="/login" exact>
          <LoginPage />
        </Route>
        <Route path="/link/:linkId" exact>
          <LinkPage />
        </Route>
        <AuthenticatedRoute path="/users/:userId" exact>
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
