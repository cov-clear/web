import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { ThemeProvider, Container, Heading } from 'theme-ui';

import { LoginPage } from './login';
import theme from './theme';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Container sx={{ maxWidth: '600px' }} pt={5} pb={4} px={2}>
          <Switch>
            <Route path="/login" exact>
              <LoginPage />
            </Route>
            <Route path="*">
              <Heading>Not found</Heading>
            </Route>
          </Switch>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
