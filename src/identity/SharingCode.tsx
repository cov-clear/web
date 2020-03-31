import React, { useState } from 'react';
import { Box, Spinner } from 'theme-ui';
import Measure, { ContentRect } from 'react-measure';
import ReactQRCode from 'qrcode.react';

import { useSharingCode } from '../resources';

export const SharingCode = ({ userId }: { userId: string }) => {
  console.log(<ReactQRCode value="test" />);
  const sharingCode = useSharingCode(userId);

  if (!sharingCode) {
    return <Spinner sx={{ display: 'block' }} mx="auto" />;
  }

  return <QRCode value={sharingCode.code} />;
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
        <Box ref={measureRef} sx={{ width: '50%' }} mx="auto">
          <ReactQRCode size={size} value={value} level="M" />
        </Box>
      )}
    </Measure>
  );
};
