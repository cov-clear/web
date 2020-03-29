import React from 'react';
import {
  Box,
  Spinner,
  Text,
  Heading,
  NavLink as ThemeUiNavLink,
  Flex,
  NavLinkProps,
} from 'theme-ui';
import {
  useRouteMatch,
  Switch,
  Route,
  NavLink as RouterNavLink,
  NavLinkProps as RouterNavLinkProps,
  Redirect,
} from 'react-router-dom';
import { format } from 'date-fns';

import { useUser, useSharingCode } from '../resources';
import { Profile, Address } from '../api';

import { ProfileForm } from './ProfileForm';
import { AddressForm } from './AddressForm';
import { QRCode } from './QRCode';
import { Test as TestIcon, Profile as ProfileIcon } from './icons';

const Small = ({ children }: { children: React.ReactNode }) => (
  <Text as="small" sx={{ fontSize: 2, fontWeight: 2 }}>
    {children}
  </Text>
);

const NavLink = ThemeUiNavLink as React.FC<NavLinkProps & RouterNavLinkProps>;

export const IdentityPage = () => {
  const {
    url,
    params: { userId },
  } = useRouteMatch();
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
      <Text mb={4}>Date of birth: {format(new Date(user.profile.dateOfBirth), 'dd/MM/yyyy')}</Text>
      <Flex as="nav">
        <NavLink as={RouterNavLink} to={`${url}/profile`} variant="tab">
          <ProfileIcon /> Profile
        </NavLink>
        <NavLink as={RouterNavLink} to={`${url}/tests`} variant="tab">
          <TestIcon /> Tests
        </NavLink>
      </Flex>
      <Switch>
        <Route path={`${url}/profile`} exact>
          {sharingCode ? (
            <Box mt={5}>
              <QRCode value={sharingCode.code} />
            </Box>
          ) : null}
        </Route>
        <Route path={`${url}/tests`} exact>
          Tests will be shown here
        </Route>
      </Switch>
      <Redirect from={url} to={`${url}/profile`} />
    </>
  );
};
