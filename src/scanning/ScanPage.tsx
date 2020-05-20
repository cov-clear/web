import React, { useState, useEffect, useRef } from 'react';
import { Text, Heading, Box, Spinner, Button } from 'theme-ui';
import QrReader from 'react-qr-reader';
import { useHistory } from 'react-router-dom';
import { createAccessPass } from '../api';
import { useAuthentication } from '../authentication';
import { useTranslations, Message } from 'retranslate';

import { UUID_VALIDATION_REGEX } from './UUID_VALIDATION_REGEX';

const errorClearTimeout = 5000;

export const ScanPage = () => {
  const history = useHistory();
  const { userId, token } = useAuthentication();
  const { translate } = useTranslations();
  const [error, setError] = useState<string | null>(null);
  const readerRef = useRef<any>();
  const [loading, setLoading] = useState(false);
  const [legacyMode, setLegacyMode] = useState(false);

  async function handleScan(url: string | null) {
    if (url && userId && token && !loading) {
      const code = parseSharingCodeFromUrl(url);
      if (code && code.match(UUID_VALIDATION_REGEX)) {
        setLoading(true);
        try {
          const accessPass = await createAccessPass(userId, code, { token });
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

  useEffect(() => {
    const timeout = setTimeout(() => setError(null), errorClearTimeout);
    return () => clearTimeout(timeout);
  }, [error]);

  // TODO: use legacy mode if on iOS, but not on safari.
  return (
    <>
      <Box mt={[0, 4]}>
        <QrReader
          ref={readerRef as any}
          delay={100}
          style={{ width: '100%' }}
          onScan={handleScan}
          onError={() => {
            setLegacyMode(true);
          }}
          showViewFinder={false}
          legacyMode={legacyMode}
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
        {legacyMode ? (
          <>
            <Text mb={3}>
              <Message>scanPage.legacyMode.prompt</Message>
            </Text>
            <Button mb={3} onClick={() => readerRef.current?.openImageDialog()}>
              <Message>scanPage.legacyMode.chooseImage</Message>
            </Button>
          </>
        ) : (
          <Text mb={3}>
            <Message>scanPage.description</Message>
          </Text>
        )}
        {loading ? <Spinner mx="auto" sx={{ display: 'block' }} /> : null}
      </Box>
    </>
  );
};

function parseSharingCodeFromUrl(data: string): string | null {
  try {
    return new URL(data).searchParams.get('sharingCode');
  } catch (error) {
    return null;
  }
}
