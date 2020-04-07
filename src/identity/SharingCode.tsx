import React, { useState } from 'react';
import { Box, Spinner, Text, ButtonProps, Button } from 'theme-ui';
import Measure, { ContentRect } from 'react-measure';
import { Link, LinkProps } from 'react-router-dom';
import ReactQRCode from 'qrcode.react';

import { useSharingCode } from '../resources';
import { Camera as CameraIcon } from '../icons';

const LinkButton = Button as React.FC<ButtonProps & LinkProps>;

export const SharingCode = ({ userId }: { userId: string }) => {
  const { loading, sharingCode } = useSharingCode(userId);

  if (loading || !sharingCode) {
    return <Spinner sx={{ display: 'block' }} mx="auto" />;
  }

  return <QRCode value={sharingCode!.code} />;
};

const QRCode = ({ value }: { value: string }) => {
  const [size, setSize] = useState(0);

  function handleResize({ bounds }: ContentRect) {
    if (bounds) {
      setSize(bounds.width);
    }
  }

  return (
    <Measure bounds onResize={handleResize}>
      {({ measureRef }) => (
        <>
          <Box ref={measureRef} sx={{ width: '50%' }} mx="auto">
            <ReactQRCode size={size} value={value} level="M" />
          </Box>
          <Box sx={{ width: '70%', textAlign: 'center' }} mx="auto">
            <Text my="3">Let another user scan your code to securely share your results</Text>

            <LinkButton as={Link} to="/scan">
              <CameraIcon mr={1} /> Scan another user
            </LinkButton>
          </Box>
        </>
      )}
    </Measure>
  );
};
