import React from 'react';
import { Message } from 'retranslate';
import { Container, Heading, Button, Text, Alert, Link } from 'theme-ui';
import { useState } from 'react';
import { createIdAuthenticationSession } from '../api';
import { useLocation } from 'react-router-dom';

export const EstonianIdLoginPage = () => {
  const [loading, setLoading] = useState(false);
  const urlParams = new URLSearchParams(useLocation().search);

  async function handleLogin() {
    setLoading(true);
    const session = await createIdAuthenticationSession();
    window.location.assign(session.redirectUrl);
  }

  const invalidLink = urlParams.get('invalid');

  return (
    <Container variant="page">
      {invalidLink && (
        <Alert variant="secondary" mb={4}>
          <Message>error.authentication</Message>
        </Alert>
      )}
      <Heading as="h1" mb={5}>
        <Message>loginPage.heading</Message>
      </Heading>
      <Text mb={5}>
        <Message
          params={{
            termsLink: (
              <Link href="immunitypassport.co/tingimused">
                <Message>loginPage.estonian.termsLink</Message>
              </Link>
            ),
          }}
        >
          loginPage.estonian.terms
        </Message>
      </Text>
      <Button variant="block" onClick={handleLogin} disabled={loading} mb={2}>
        <Message>loginPage.estonian.button</Message>
      </Button>
    </Container>
  );
};
