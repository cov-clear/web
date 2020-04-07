import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Container,
  Label,
  Input,
  Button,
  Text,
  Heading,
  Box,
  Alert,
  Link as ThemeUiLink,
} from 'theme-ui';

import { createMagicLink } from '../api';

export const LoginPage = () => {
  const [email, setEmail] = useState('');

  const submitted = !!email;

  async function handleLogin({ email }: { email: string }) {
    await createMagicLink(email);
    setEmail(email);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const invalidLink = urlParams.get('invalid');

  return (
    <Container variant="page">
      {invalidLink && !submitted && (
        <Alert variant="secondary" mb={4}>
          That link wasn't valid, please request a new one.
        </Alert>
      )}
      <Heading as="h1" mb={3}>
        Sign in
      </Heading>
      {submitted ? (
        <Text>
          We sent an email to <strong>{email}</strong> with a secure link to sign you in.
        </Text>
      ) : (
        <>
          <Text mb={6}>We’ll send you a secure sign in link to your email</Text>
          <LoginForm onComplete={handleLogin} />
        </>
      )}
      <ThemeUiLink
        href="https://cov-clear.com/privacy/"
        mt={2}
        py={3}
        sx={{ display: 'block', width: '100%', textAlign: 'center' }}
      >
        Privacy
      </ThemeUiLink>
    </Container>
  );
};

const AnyBox = Box as any;

const LoginForm = ({
  onComplete,
}: {
  onComplete: ({ email }: { email: string }) => Promise<any>;
}) => {
  const form = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: yup.object().shape({
      email: yup
        .string()
        .trim()
        .email('Please check your email address')
        .required('Please fill your email address'),
    }),
    onSubmit: ({ email }) => onComplete({ email: email.trim() }),
  });

  return (
    <AnyBox as="form" sx={{ display: 'grid', gridGap: 4 }} onSubmit={form.handleSubmit}>
      <Box>
        <Label htmlFor="cov-email">Your email</Label>
        <Input
          id="cov-email"
          type="email"
          {...form.getFieldProps('email')}
          placeholder="e.g. john.smith@email.com"
        />
        {form.touched.email && form.errors.email ? <Text>{form.errors.email}</Text> : null}
      </Box>
      <Button type="submit" variant="block" disabled={form.isSubmitting} mt={2}>
        Send magic link
      </Button>
    </AnyBox>
  );
};
