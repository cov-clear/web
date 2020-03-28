import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { ThemeProvider, Container, Heading } from 'theme-ui';

import { LoginPage, LinkPage, Provider as AuthenticationProvider } from './authentication';
import theme from './theme';

const NotFound = () => <Heading>Not found</Heading>;

const App = () => {
  return (
    <Container sx={{ maxWidth: '600px' }} pt={5} pb={4} px={2}>
      <Switch>
        <Route path="/login" exact>
          <LoginPage />
        </Route>
        <Route path="/link/:linkId" exact>
          <LinkPage />
        </Route>
        <Route path="*">
          <NotFound />
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
