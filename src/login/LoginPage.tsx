import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Label, Input, Button, Text, Message, Heading } from 'theme-ui';
import { Link } from 'react-router-dom';

import { createMagicLink } from '../api';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [developmentCode, setDevelopmentCode] = useState('');

  const submitted = !!email;

  async function handleLogin({ email }: { email: string }) {
    const result = await createMagicLink(email);
    setEmail(email);
    if (result.code) {
      setDevelopmentCode(result.code);
    }
  }

  return (
    <>
      <Heading mb={4}>Sign in</Heading>
      {submitted ? (
        <>
          <Text>
            Please check your inbox at <strong>{email}</strong> for the signup link.
          </Text>
          {developmentCode && (
            <Message mt={2}>
              In development mode, you can navigate there directly by clicking{' '}
              <Link to={`/link/${developmentCode}`}>here</Link>
            </Message>
          )}
        </>
      ) : (
        <LoginForm onComplete={handleLogin} />
      )}
    </>
  );
};

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
      <Button
        sx={{ display: 'block', width: '100%' }}
        type="submit"
        disabled={form.isSubmitting}
        mt={2}
      >
        Submit
      </Button>
    </form>
  );
};
