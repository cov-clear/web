import React, { useState, useEffect } from 'react';
import { BrowserRouter, Switch, Route, Redirect, useHistory } from 'react-router-dom';
import {
  ThemeProvider,
  Container,
  NavLink,
  Heading,
  Flex,
  Label,
  Input,
  Text,
  Button,
  Link,
  Spinner,
} from 'theme-ui';

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
      <Route path="/demo-smartid" exact>
        <DemoSmartId />
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
        <BulkUserCreationPage />
      </AuthenticatedRoute>
      <Route path="*">
        <NotFoundPage />
      </Route>
    </Switch>
  );
};

const DemoSmartId = () => {
  const [id, setId] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { userId } = useAuthentication();
  const history = useHistory();
  useEffect(() => {
    if (submitted) {
      const timeout = setTimeout(() => {
        history.push(`/users/${userId}`);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [history, submitted, userId]);
  return (
    <Container variant="page">
      <Heading mb={6} as="h1">
        Sign in
      </Heading>
      {submitted ? (
        <>
          <Text>Make sure the code you received matches the code you see here:</Text>
          <Heading sx={{ fontSize: 7, textAlign: 'center' }} mt={4}>
            1337
          </Heading>
          <Spinner mt={4} mx="auto" sx={{ display: 'block' }} />
        </>
      ) : (
        <>
          <Flex as="nav" mb={4}>
            <NavLink variant="tab" className="active">
              Smart-ID
            </NavLink>
            <NavLink variant="tab">Mobiil-ID</NavLink>
          </Flex>
          <Label htmlFor="id-code">ID code</Label>
          <Input id="id-code" value={id} onChange={({ target: { value } }) => setId(value)} />
          <Button mt={3} variant="block" onClick={() => setSubmitted(true)}>
            Submit
          </Button>
          <Link
            href="https://cov-clear.com/privacy/"
            mt={2}
            py={3}
            sx={{ display: 'block', width: '100%', textAlign: 'center' }}
          >
            Privacy
          </Link>
        </>
      )}
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
