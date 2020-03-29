import React from 'react';
import { Spinner, Text, Heading } from 'theme-ui';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';

import { useUser, useSharingCode } from '../resources';
import { Profile, Address } from '../api';

import { ProfileForm } from './ProfileForm';
import { AddressForm } from './AddressForm';
import { QRCode } from './QRCode';

const Small = ({ children }: { children: React.ReactNode }) => (
  <Text as="small" sx={{ fontSize: 2, fontWeight: 2 }}>
    {children}
  </Text>
);

export const IdentityPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, update: updateUser } = useUser(userId);
  const sharingCode = useSharingCode(userId);

  if (!user) {
    return <Spinner mx="auto" sx={{ display: 'block' }} />;
  }

  function createProfile(profile: Profile) {
    return updateUser({ ...user!, profile });
  }

  function createAddress(address: Address) {
    return updateUser({ ...user!, address });
  }

  if (!user.profile) {
    return (
      <>
        <Heading as="h1" mb={5}>
          Enter your details <Small>1/2</Small>
        </Heading>
        <ProfileForm onComplete={createProfile} />
      </>
    );
  }

  if (!user.address) {
    return (
      <>
        <Heading as="h1" mb={5}>
          Enter your details <Small>2/2</Small>
        </Heading>
        <AddressForm onComplete={createAddress} />
      </>
    );
  }

  return (
    <>
      <Heading as="h1" mb={5}>
        {user.profile.firstName} {user.profile.lastName}
      </Heading>
      <Text mb={5}>Date of birth: {format(new Date(user.profile.dateOfBirth), 'dd/MM/yyyy')}</Text>
      {sharingCode ? <QRCode value={sharingCode.code} /> : null}
    </>
  );
};
