import React from 'react';
import { format } from 'date-fns';
import { Box, Spinner, Alert, Text, Button, Heading } from 'theme-ui';

import { useUser, useCountries } from '../resources';
import { Warning as WarningIcon } from '../icons';

export const ConfirmIdentity = ({
  userId,
  onConfirm,
  loading,
}: {
  userId: string;
  onConfirm: () => any;
  loading: boolean;
}) => {
  const { countries } = useCountries();
  const { user } = useUser(userId);

  if (!user || !countries.length) {
    return <Spinner mx="auto" mt={4} sx={{ display: 'block' }} />;
  }

  const { firstName, lastName, dateOfBirth } = user.profile!;
  const { address1, address2, city, region, postcode, countryCode } = user.address!;
  const country = countries.find(({ code }) => code === countryCode);
  const text = (value?: string) => (value ? <Text>{value}</Text> : null);

  return (
    <>
      <Alert mb={4} variant="warning">
        <WarningIcon mr={3} sx={{ alignSelf: 'flex-start' }} />
        <Box>
          <Text>Confirm identity</Text>
          <Text as="small">Check the patient's photo ID to confirm these details are correct</Text>
        </Box>
      </Alert>
      <Heading as="h1" mb={3}>
        {firstName} {lastName}
      </Heading>
      <Text mb={4}>Date of birth: {format(new Date(dateOfBirth), 'dd/MM/yyyy')}</Text>
      {text(address1)}
      {text(address2)}
      {text(city)}
      {text(region)}
      {text(postcode)}
      {text(country?.name)}
      <Button variant="block" mt={4} onClick={onConfirm} disabled={loading}>
        Confirm patient's identity
      </Button>
    </>
  );
};
