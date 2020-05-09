import React, { useState, useEffect } from 'react';
import { Text, Container, Heading, Box, Spinner } from 'theme-ui';
import QrReader from 'react-qr-reader';
import { useHistory } from 'react-router-dom';
import { createAccessPass } from '../api';
import { useAuthentication } from '../authentication';
import { useTranslations, Message } from 'retranslate';

const uuidValidationRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const errorClearTimeout = 5000;

export const ScanPage = () => {
  const history = useHistory();
  const { userId, token } = useAuthentication();
  const { translate } = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleScan(data: string | null) {
    if (data && userId && token && !loading) {
      // TODO: embed a piece of info before uuid (cov-user?) to make sure it's our uuid
      if (data.match(uuidValidationRegex)) {
        setLoading(true);
        try {
          const accessPass = await createAccessPass(userId, data, { token });
          history.push(`/users/${accessPass.userId}`);
        } catch (e) {
          setError(translate('scanPage.error.incorrectCode'));
        }
        setLoading(false);
      } else {
        setError(translate('scanPage.error.incorrectCode'));
      }
    }
  }

  function handleError() {
    setError(translate('scanPage.error.generic'));
  }

  useEffect(() => {
    const timeout = setTimeout(() => setError(null), errorClearTimeout);
    return () => clearTimeout(timeout);
  }, [error]);

  // TODO: use legacy mode if on iOS, but not on safari.
  return (
    <Container sx={{ maxWidth: '600px' }}>
      <Box mt={[0, 4]}>
        <QrReader
          delay={100}
          style={{ width: '100%' }}
          onScan={handleScan}
          onError={handleError}
          showViewFinder={false}
        />
      </Box>
      <Box
        px={3}
        pt={3}
        mt={[-3, 0]}
        sx={{
          borderTopLeftRadius: ['16px', 0],
          borderTopRightRadius: ['16px', 0],
          backgroundColor: 'background',
          position: 'relative',
        }}
      >
        <Heading as="h1" mb={3} sx={error ? { color: 'red' } : {}}>
          {error ? error : <Message>scanPage.heading</Message>}
        </Heading>
        <Text mb={3}>
          <Message>scanPage.description</Message>
        </Text>
        {loading ? <Spinner mx="auto" sx={{ display: 'block' }} /> : null}
      </Box>
    </Container>
  );
};
