import React from 'react';
import { Spinner, Text, Heading } from 'theme-ui';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';

import { useUser } from '../resources';
import { Profile } from '../api';

import { ProfileForm } from './ProfileForm';

export const IdentityPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, update: updateUser } = useUser(userId);

  if (!user) {
    return <Spinner mx="auto" sx={{ display: 'block' }} />;
  }

  function createProfile(profile: Profile) {
    return updateUser({ ...user!, profile });
  }

  return (
    <>
      <Heading mb={5}>
        {!user.profile ? (
          <>
            Enter your details <small>1/2</small>
          </>
        ) : (
          <>
            {user.profile.firstName} {user.profile.lastName}
          </>
        )}
      </Heading>
      {!user.profile ? (
        <ProfileForm onComplete={createProfile} />
      ) : (
        <Identity email={user.email} profile={user.profile} />
      )}
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
