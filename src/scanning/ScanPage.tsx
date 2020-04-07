import React, { useState, useEffect } from 'react';
import { Text, Container, Heading, Box, Spinner } from 'theme-ui';
import QrReader from 'react-qr-reader';
import { useHistory } from 'react-router-dom';
import { createAccessPass } from '../api';
import { useAuthentication } from '../authentication';

const uuidValidationRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const errorClearTimeout = 5000;

export const ScanPage = () => {
  const history = useHistory();
  const { userId, token } = useAuthentication();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleScan(data: string | null) {
    if (data && userId && token && !loading) {
      // TODO: embed a piece of info before uuid (cov-user?) to make sure it's our uuid
      if (data.match(uuidValidationRegex)) {
        setLoading(true);
        const accessPass = await createAccessPass(userId, data, { token });
        setLoading(false);
        history.push(`/users/${accessPass.userId}`);
      } else {
        setError('Incorrect code');
      }
    }
  }

  function handleError(error: Error) {
    // TODO
  }

  useEffect(() => {
    const timeout = setTimeout(() => setError(null), errorClearTimeout);
    return () => clearTimeout(timeout);
  }, [error]);

  return (
    <Container sx={{ maxWidth: '600px' }}>
      <QrReader
        delay={100}
        style={{ width: '100%' }}
        onScan={handleScan}
        onError={handleError}
        showViewFinder={false}
      />
      <Box
        px={3}
        pt={3}
        mt={-2}
        sx={{
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          backgroundColor: 'background',
          position: 'relative',
        }}
      >
        <Heading as="h1" mb={3} sx={error ? { color: 'red' } : {}}>
          {error ? error : 'Scanning'}
        </Heading>
        <Text mb={3}>Point your camera at the person's sharing code</Text>
        {loading ? <Spinner mx="auto" sx={{ display: 'block' }} /> : null}
      </Box>
    </Container>
  );
};
