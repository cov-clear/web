import React from 'react';
import { Message } from 'retranslate';
import { Container, Heading, Button } from 'theme-ui';
import { useState } from 'react';
import { createIdAuthenticationSession } from '../api';

export const EstonianIdLoginPage = () => {
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const session = await createIdAuthenticationSession();
    window.location.assign(session.redirectUrl);
  }

  return (
    <Container variant="page">
      <Heading as="h1" mb={5}>
        <Message>loginPage.heading</Message>
      </Heading>
      <Button variant="block" onClick={handleLogin} disabled={loading}>
        <Message>loginPage.estonian.button</Message>
      </Button>
    </Container>
  );
};
