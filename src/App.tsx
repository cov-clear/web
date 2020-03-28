import React from 'react';
import { BrowserRouter, Switch, Route, Link, LinkProps } from 'react-router-dom';
import { ThemeProvider, Container, Heading, Button, ButtonProps } from 'theme-ui';

import { LoginPage, LinkPage, Provider as AuthenticationProvider } from './authentication';
import theme from './theme';

const NavButton = Button as React.FC<ButtonProps & LinkProps>;
const NotFound = () => (
  <>
    <Heading mb={4}>This page wasn't found</Heading>
    <NavButton as={Link} sx={{ display: 'block', width: '100%' }} to="/">
      Go to the start page
    </NavButton>
  </>
);

const StartPage = () => (
  <>
    <Heading mb={4}>cov-clear</Heading>
    <NavButton as={Link} sx={{ display: 'block', width: '100%' }} to="/login">
      Sign in
    </NavButton>
  </>
);

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
