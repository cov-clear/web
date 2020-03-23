import React from 'react';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import {
  Input,
  Label,
  Button,
  Grid,
  ThemeProvider,
  Divider,
  Text,
  Heading,
  Box,
  Container,
} from 'theme-ui';
import styled from '@emotion/styled';
import { useFormik } from 'formik';
import { useMediaLayout } from 'use-media';

import theme from './theme';

const useMobileLayout = () => useMediaLayout({ maxWidth: '1000px' }); // TODO: how large should it be?

const BlockButton = styled(Button)(() => ({
  display: 'block',
  width: '100%',
})) as any;

// TODO: reusable page element

const Homepage = () => {
  return (
    <Container sx={{ maxWidth: '600px' }} py={4} px={2}>
      <Heading>COVID-19 clearing application</Heading>
      <Text my={2}>
        This application is for authorized personnel to order and verify their results of the
        COVID-19 antibody test.
      </Text>
      <Divider />
      <Grid gap={2}>
        <BlockButton as={Link} to="/identity">
          Enter your information
        </BlockButton>
      </Grid>
    </Container>
  );
};

const IdentityPage = () => {
  return (
    <Container sx={{ maxWidth: '600px' }} py={4} px={2}>
      <Heading mb={2}>Your identity</Heading>
      <IdentityForm />
    </Container>
  );
};

const IdentityForm = () => {
  const form = useFormik({
    initialValues: {
      name: '',
      dateOfBirth: '',
    },
    onSubmit(data) {
      console.log(data);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <Label htmlFor="identity-name">Your full name</Label>
      <Input
        name="name"
        id="identity-name"
        type="text"
        onChange={form.handleChange}
        value={form.values.name}
        mb={2}
      />
      <Label htmlFor="identity-dateOfBirth">Your date of birth</Label>
      <Input
        name="dateOfBirth"
        id="identity-dateOfBirth"
        type="date"
        onChange={form.handleChange}
        value={form.values.dateOfBirth}
        mb={2}
      />
      <BlockButton type="submit">Submit</BlockButton>
    </form>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Switch>
          <Route path="/" exact>
            <Homepage />
          </Route>
          <Route path="/identity" exact>
            <IdentityPage />
          </Route>
        </Switch>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
