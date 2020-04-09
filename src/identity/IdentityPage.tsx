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

import { useUser } from '../resources';
import { Profile, Address } from '../api';

import { ProfileForm } from './ProfileForm';
import { AddressForm } from './AddressForm';
import { SharingCode } from './SharingCode';
import { Test as TestIcon, Profile as ProfileIcon } from '../icons';
import { useAuthentication } from '../authentication';

import { TestList } from '../testing';
import { ViewingOtherProfileHeader } from './ViewingOtherProfileHeader';

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
  const { userId: authenticatedUserId } = useAuthentication();
  const isOwnUser = userId === authenticatedUserId;

  if (!user) {
    return <Spinner variant="spinner.main" />;
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
      {!isOwnUser ? <ViewingOtherProfileHeader /> : null}
      <Box pt={isOwnUser ? undefined : 4}>
        <Heading as="h1" mb={3}>
          {user.profile.firstName} {user.profile.lastName}
        </Heading>
        <Text mb={5}>
          Date of birth: {format(new Date(user.profile.dateOfBirth), 'd MMM yyyy')}
        </Text>
        {isOwnUser ? (
          <Flex as="nav">
            <NavLink
              as={RouterNavLink}
              to={`${url}/tests`}
              variant="tab"
              data-testid="test-result-link"
            >
              <TestIcon mr={1} /> Results
            </NavLink>
            <NavLink
              as={RouterNavLink}
              to={`${url}/profile`}
              variant="tab"
              data-testid="share-access-link"
            >
              <ProfileIcon mr={1} /> Share
            </NavLink>
          </Flex>
        ) : null}
        <Switch>
          <Route path={`${url}/profile`} exact>
            <Box mt={6}>
              <SharingCode userId={userId} />
            </Box>
          </Route>
          <Route path={`${url}/tests`} exact>
            <TestList userId={userId} />
          </Route>
        </Switch>
        <Route
          path={url}
          exact
          render={() =>
            isOwnUser ? (
              <Redirect exact from={url} to={`${url}/profile`} />
            ) : (
              <Redirect exact from={url} to={`${url}/tests`} />
            )
          }
        />
      </Box>
    </>
  );
};
