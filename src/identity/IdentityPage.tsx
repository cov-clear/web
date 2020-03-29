import React from 'react';
import { Spinner, Text, Heading } from 'theme-ui';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';

import { useUser } from '../resources';
import { Profile, Address } from '../api';

import { ProfileForm } from './ProfileForm';
import { AddressForm } from './AddressForm';

const Small = ({ children }: { children: React.ReactNode }) => (
  <Text as="small" sx={{ fontSize: 2, fontWeight: 2 }}>
    {children}
  </Text>
);

export const IdentityPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, update: updateUser } = useUser(userId);

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
        <Heading mb={5}>
          Enter your details <Small>1/2</Small>
        </Heading>
        <ProfileForm onComplete={createProfile} />
      </>
    );
  }

  if (!user.address) {
    return (
      <>
        <Heading mb={5}>
          Enter your details <Small>2/2</Small>
        </Heading>
        <AddressForm onComplete={createAddress} />
      </>
    );
  }

  return (
    <>
      <Heading mb={5}>
        {user.profile.firstName} {user.profile.lastName}
      </Heading>
      <Identity email={user.email} profile={user.profile} />
    </>
  );
};

const Identity = ({ email, profile }: { email: string; profile: Profile }) => {
  return (
    <>
      <Text>
        Born <strong>{format(new Date(profile.dateOfBirth), 'dd/MM/yyyy')}</strong>
      </Text>
      <Text>
        Contact <strong>{email}</strong>
      </Text>
    </>
  );
};
