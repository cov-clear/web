import React, { useState } from 'react';
import { Box } from 'theme-ui';
import Measure from 'react-measure';
import ReactQRCode from 'qrcode.react';

export const QRCode = ({ value }: { value: string }) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  function handleResize({ bounds }: any) {
    console.log(bounds);
    if (bounds) {
      setDimensions(bounds);
    }
  }

  return (
    <Measure bounds onResize={handleResize}>
      {({ measureRef }) => (
        <Box ref={measureRef} sx={{ width: '50%' }} mx="auto">
          <ReactQRCode size={dimensions.width} value={value} level="M" />
        </Box>
      )}
    </Measure>
  );
};
