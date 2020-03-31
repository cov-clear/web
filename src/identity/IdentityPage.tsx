import React from 'react';
import {
  Box,
  Spinner,
  Text,
  Heading,
  NavLink as ThemeUiNavLink,
  Flex,
  Container,
  NavLinkProps,
  ButtonProps,
  Button,
} from 'theme-ui';
import {
  useRouteMatch,
  Switch,
  Route,
  NavLink as RouterNavLink,
  NavLinkProps as RouterNavLinkProps,
  Redirect,
  Link,
  LinkProps,
} from 'react-router-dom';
import { format } from 'date-fns';

import { useUser } from '../resources';
import { Profile, Address } from '../api';

import { ProfileForm } from './ProfileForm';
import { AddressForm } from './AddressForm';
import { SharingCode } from './SharingCode';
import { Test as TestIcon, Profile as ProfileIcon, Camera as CameraIcon } from './icons';
import { useAuthentication } from '../authentication';

const Small = ({ children }: { children: React.ReactNode }) => (
  <Text as="small" sx={{ fontSize: 2, fontWeight: 2 }}>
    {children}
  </Text>
);

const NavLink = ThemeUiNavLink as React.FC<NavLinkProps & RouterNavLinkProps>;
const LinkButton = Button as React.FC<ButtonProps & LinkProps>;

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
      <Container variant="page">
        <Heading as="h1" mb={5}>
          Enter your details <Small>1/2</Small>
        </Heading>
        <ProfileForm onComplete={createProfile} />
      </Container>
    );
  }

  if (!user.address) {
    return (
      <Container variant="page">
        <Heading as="h1" mb={5}>
          Enter your details <Small>2/2</Small>
        </Heading>
        <AddressForm onComplete={createAddress} />
      </Container>
    );
  }

  return (
    <>
      {!isOwnUser ? <ViewingOtherProfileHeader /> : null}
      <Container variant="page" pt={isOwnUser ? undefined : 4}>
        <Heading as="h1" mb={5}>
          {user.profile.firstName} {user.profile.lastName}
        </Heading>
        <Text mb={4}>
          Date of birth: {format(new Date(user.profile.dateOfBirth), 'dd/MM/yyyy')}
        </Text>
        {isOwnUser ? (
          <Flex as="nav">
            <NavLink as={RouterNavLink} to={`${url}/profile`} variant="tab">
              <ProfileIcon /> Profile
            </NavLink>
            <NavLink as={RouterNavLink} to={`${url}/tests`} variant="tab">
              <TestIcon /> Tests
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
            Tests will be shown here
          </Route>
        </Switch>
        {isOwnUser ? (
          <Redirect from={url} to={`${url}/profile`} />
        ) : (
          <Redirect from={url} to={`${url}/tests`} />
        )}
        <LinkButton as={Link} to="/scan" variant="fab">
          <CameraIcon /> Scan
        </LinkButton>
      </Container>
    </>
  );
};

// TODO: the styling on this header is very ad-hoc. Let's move it into the theme.
const ViewingOtherProfileHeader = () => (
  <Box sx={{ backgroundColor: 'primary', color: 'background' }}>
    <Flex px={3} py={2} sx={{ justifyContent: 'space-between', maxWidth: '600px' }} mx="auto">
      <Heading as="h2" sx={{ lineHeight: 1.8 }}>
        Viewing profile
      </Heading>
      <LinkButton as={Link} to="/scan" sx={{ border: '2px solid', borderColor: 'background' }}>
        Close
      </LinkButton>
    </Flex>
  </Box>
);
