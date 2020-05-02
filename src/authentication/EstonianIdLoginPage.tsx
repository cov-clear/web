import React from 'react';
import { useState } from 'react';
import { createIdAuthenticationSession } from '../api';
import { Container, Heading, Button } from 'theme-ui';

export const EstonianIdLoginPage = () => {
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const session = await createIdAuthenticationSession();
    window.location.assign(session.redirectUrl);
  }

  return (
    <Container variant="page">
      <Heading as="h1" mb={3}>
        Sign in
      </Heading>
      <Button variant="block" onClick={handleLogin} disabled={loading}>
        Sign in via Estonian ID
      </Button>
    </Container>
  );
};
