import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Label, Input, Button, Text, Heading, Box, Alert, Link as ThemeUiLink } from 'theme-ui';

import { createMagicLink } from '../api';
import { Message, useTranslations } from 'retranslate';

export const MagicLinkLoginPage = () => {
  const [email, setEmail] = useState('');

  const submitted = !!email;

  async function handleLogin({ email }: { email: string }) {
    await createMagicLink(email);
    setEmail(email);
  }

  const urlParams = new URLSearchParams(window.location.search);
  const invalidLink = urlParams.get('invalid');

  return (
    <>
      {invalidLink && !submitted && (
        <Alert variant="secondary" mb={4}>
          <Message>loginPage.invalidLink</Message>
        </Alert>
      )}
      <Heading as="h1" mb={3}>
        <Message>loginPage.heading</Message>
      </Heading>
      {submitted ? (
        <Text>
          <Message params={{ email: <strong>{email}</strong> }}>
            loginPage.description.submitted
          </Message>
        </Text>
      ) : (
        <>
          <Text mb={6}>
            <Message>loginPage.description.notSubmitted</Message>
          </Text>
          <LoginForm onComplete={handleLogin} />
        </>
      )}
      <ThemeUiLink
        href="https://cov-clear.com/privacy/" // TODO: Add link to Estonian privacy page
        mt={2}
        py={3}
        sx={{ display: 'block', width: '100%', textAlign: 'center' }}
      >
        <Message>loginPage.privacy</Message>
      </ThemeUiLink>
    </>
  );
};

const AnyBox = Box as any;

const LoginForm = ({
  onComplete,
}: {
  onComplete: ({ email }: { email: string }) => Promise<any>;
}) => {
  const { translate } = useTranslations();
  const form = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: yup.object().shape({
      email: yup
        .string()
        .trim()
        .email(translate('loginPage.form.email.invalid'))
        .required(translate('loginPage.form.email.required')),
    }),
    onSubmit: ({ email }) => onComplete({ email: email.trim() }),
  });

  return (
    <AnyBox as="form" sx={{ display: 'grid', gridGap: 4 }} onSubmit={form.handleSubmit}>
      <Box>
        <Label htmlFor="cov-email">
          <Message>loginPage.form.email.label</Message>
        </Label>
        <Input
          id="cov-email"
          type="email"
          {...form.getFieldProps('email')}
          placeholder={translate('loginPage.form.email.placeholder')}
        />
        {form.touched.email && form.errors.email ? <Text>{form.errors.email}</Text> : null}
      </Box>
      <Button type="submit" variant="block" disabled={form.isSubmitting} mt={2}>
        <Message>loginPage.form.button</Message>
      </Button>
    </AnyBox>
  );
};
