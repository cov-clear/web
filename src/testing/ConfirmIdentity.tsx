import React from 'react';
import { format } from 'date-fns';
import { Spinner, Message, Text, Button, Heading } from 'theme-ui';

import { useUser } from '../resources';

export const ConfirmIdentity = ({
  userId,
  onConfirm,
  loading,
}: {
  userId: string;
  onConfirm: () => any;
  loading: boolean;
}) => {
  const { user } = useUser(userId);
  if (!user) {
    return <Spinner mx="auto" mt={4} sx={{ display: 'block' }} />;
  }

  const { firstName, lastName, dateOfBirth } = user.profile!;
  const { address1, address2, city, region, postcode } = user.address!;
  const text = (value?: string) => (value ? <Text>{value}</Text> : null);
  // TODO: icon for warning message
  // TODO: show country
  return (
    <>
      <Message mb={3} variant="warning">
        <Text>Confirm identity</Text>
        <Text as="small">Check the patient's photo ID to confirm these details are correct</Text>
      </Message>
      <Heading as="h1" mb={3}>
        {firstName} {lastName}
      </Heading>
      <Text mb={4}>Date of birth: {format(new Date(dateOfBirth), 'dd/MM/yyyy')}</Text>
      {text(address1)}
      {text(address2)}
      {text(city)}
      {text(region)}
      {text(postcode)}
      <Button variant="block" mt={4} onClick={onConfirm} disabled={loading}>
        Confirm patient's identity
      </Button>
    </>
  );
};
