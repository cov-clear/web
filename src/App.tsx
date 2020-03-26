import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
  Link,
  useParams,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';
import {
  Input,
  Label,
  Button,
  Grid,
  ThemeProvider,
  Divider,
  Text,
  Heading,
  Container,
  Spinner,
  Box,
} from 'theme-ui';
import Measure from 'react-measure';
import QRCode from 'qrcode.react';
import styled from '@emotion/styled';
import { useFormik } from 'formik';
import { useMediaLayout } from 'use-media';
import * as yup from 'yup';

/* import {  } from './api'; */
import theme from './theme';

const useMobileLayout = () => useMediaLayout({ maxWidth: '1000px' }); // TODO: how large should it be?

const PageContainer = ({ children }: { children: React.ReactNode }) => (
  <Container sx={{ maxWidth: '600px' }} pt={5} pb={4} px={2}>
    {children}
  </Container>
);

const BlockButton = styled(Button)(() => ({
  display: 'block',
  width: '100%',
})) as any;
const FloatingButton = styled(Button)(() => ({
  position: 'fixed',
  left: '50%',
  transform: 'translateX(-50%)',
  bottom: '10vh',
})) as any;

const Homepage = () => {
  return (
    <PageContainer>
      <Heading mb={4}>COVID-19 clearing application</Heading>
      <Text mb={2}>
        This application is for authorized folks to order and verify their results of the COVID-19
        antibody test, lorem ipsum etc
      </Text>
      <Grid gap={2}>
        <BlockButton as={Link} to="/login">
          Sign in
        </BlockButton>
      </Grid>
    </PageContainer>
  );
};

const IdentityPage = () => {
  // TODO: get user id passed in by having the user-scoped pages as child pages of the main page
  const { userId } = useParams();
  const history = useHistory();

  function handleIdentityFilled(identity: Identity) {
    // TODO: call backend
    history.push(`/users/${userId}/`);
  }

  return (
    <PageContainer>
      <Heading mb={4}>Your details</Heading>
      <IdentityForm onComplete={handleIdentityFilled} />
    </PageContainer>
  );
};

interface Identity {
  name: string;
  dateOfBirth: string;
}

const IdentityForm = ({ onComplete }: { onComplete: (identity: Identity) => any }) => {
  const form = useFormik({
    initialValues: {
      name: '',
      dateOfBirth: '',
    },
    validationSchema: yup.object().shape({
      name: yup.string().required('Please fill your name'),
      dateOfBirth: yup
        .date()
        .required('Please fill your date of birth')
        .max(new Date(), 'Please check your date of birth'),
    }),
    onSubmit: onComplete,
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <Label htmlFor="identity-name">Your full name</Label>
      <Input name="name" id="identity-name" type="text" {...form.getFieldProps('name')} />
      {form.touched.name && form.errors.name ? <Text>{form.errors.name}</Text> : null}
      <Label mt={2} htmlFor="identity-dateOfBirth">
        Your date of birth
      </Label>
      <Input
        name="dateOfBirth"
        id="identity-dateOfBirth"
        type="date"
        {...form.getFieldProps('dateOfBirth')}
      />
      {form.touched.dateOfBirth && form.errors.dateOfBirth ? (
        <Text>{form.errors.dateOfBirth}</Text>
      ) : null}
      <BlockButton mt={2} type="submit" disabled={form.isSubmitting}>
        Submit
      </BlockButton>
    </form>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const submitted = !!email;

  function handleLogin({ email }: { email: string }) {
    // TODO: call backend
    setEmail(email);
  }

  return (
    <PageContainer>
      <Heading mb={2}>Sign in</Heading>
      {submitted ? (
        <Text>
          Please check your inbox at <strong>{email}</strong> for the signup link.
        </Text>
      ) : (
        <LoginForm onComplete={handleLogin} />
      )}
    </PageContainer>
  );
};

const LoginForm = ({ onComplete }: { onComplete: ({ email }: { email: string }) => any }) => {
  const form = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: yup.object().shape({
      email: yup
        .string()
        .email('Please check your email address')
        .required('Please fill your email address'),
    }),
    onSubmit: onComplete,
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <Label htmlFor="cov-email">Your email</Label>
      <Input name="email" id="cov-email" type="email" {...form.getFieldProps('email')} />
      {form.touched.email && form.errors.email ? <Text>{form.errors.email}</Text> : null}
      <BlockButton type="submit" disabled={form.isSubmitting} mt={2}>
        Submit
      </BlockButton>
    </form>
  );
};

const LinkPage = () => {
  const history = useHistory();
  const { linkId } = useParams();
  useEffect(() => {
    // TODO: api call here
    const timeout = setTimeout(() => {
      // TODO: replace with user id gotten through auth
      // TODO: do not redirect /identity if no identity created, but to main page instead
      history.replace('/users/123/identity');
    }, 1000);

    return () => clearTimeout(timeout);
  }, [history, linkId]);
  return (
    <PageContainer>
      <Spinner mx="auto" sx={{ display: 'block' }} />
    </PageContainer>
  );
};

const MainPage = () => {
  const { userId } = useParams();
  const { path } = useRouteMatch();
  const tests = [];
  // TODO: if the user does not have identity, redirect to /identity
  const permissions = {
    administerTest: false,
    administerSelfTest: false,
    scanPerson: true,
    listPeople: false,
  };

  return (
    <PageContainer>
      <Heading pb={4}>Uku Tammet</Heading>
      <Switch>
        <Route path={path} exact>
          I will show tests
        </Route>
        <Route path={`${path}/code`} exact>
          <ResponsiveQRCode value={'8210f7e6-ee90-49f9-bba5-6a4816811e8d'} />
        </Route>
      </Switch>
      {permissions.scanPerson && (
        <FloatingButton as={Link} to="/scan">
          Scan code
        </FloatingButton>
      )}
    </PageContainer>
  );
};

const ResponsiveQRCode = ({ value }: { value: string }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  function handleResize({ bounds }: any) {
    console.log(bounds);
    if (bounds) {
      setDimensions(bounds);
    }
  }

  return (
    <Measure bounds onResize={handleResize}>
      {({ measureRef }) => (
        <Box ref={measureRef} sx={{ width: '100%' }}>
          <QRCode size={dimensions.width} value={value} />
        </Box>
      )}
    </Measure>
  );
};

const NotFoundPage = () => {
  return (
    <PageContainer>
      <Heading>Not found</Heading>
    </PageContainer>
  );
};

/* const CodePage = () => { */
/*   return ( */
/*     <PageContainer> */
/*       <Heading mb={4}>I will show the QR code</Heading> */
/*     </PageContainer> */
/*   ); */
/* }; */

const ScanPage = () => {
  return (
    <PageContainer>
      <Heading mb={4}>I will scan the QR code</Heading>
    </PageContainer>
  );
};

/*
homepage ->
login ->
click on email magic link ->
link/:uuid/ -redirect->
/user/:id/identity ->
/user/:id/ -> Main page. Shows user's tests if they exist.
If they are a tester/checker, has a "scan" button, and an "add test" button.
If they are not, shows "show code" button. If they are not and no tests have been done, shows code immediately.
/user/:id/code -> shows qr code (this will prolly be a modal)

/scan -> scans qr codes to do checker/tester flow
*/

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Switch>
          <Route path="/" exact>
            <Homepage />
          </Route>
          <Route path="/login" exact>
            <LoginPage />
          </Route>
          <Route path="/link/:linkId" exact>
            <LinkPage />
          </Route>
          <Route path="/users/:userId/identity" exact>
            <IdentityPage />
          </Route>
          <Route path="/users/:userId">
            <MainPage />
          </Route>
          <Route path="/scan" exact>
            <ScanPage />
          </Route>
          <Route path="*">
            <NotFoundPage />
          </Route>
        </Switch>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
