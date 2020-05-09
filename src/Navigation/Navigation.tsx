import React, { FC } from 'react';
import { NavLink as RouterNavLink, NavLinkProps as RouterNavLinkProps } from 'react-router-dom';
import {
  Flex,
  NavLink as ThemeUiNavLink,
  NavLinkProps as ThemeUiNavLinkProps,
  Box,
} from 'theme-ui';
import { Message } from 'retranslate';

import {
  PERMISSIONS_REQUIRED_FOR_ADD_TEST_TO_IDENTIFIER_PAGE,
  PERMISSIONS_REQUIRED_FOR_USER_CREATION_PAGE,
  ADD_TEST_TO_IDENTIFIER_PATH,
  USER_CREATION_PATH,
  HOME_PATH,
} from '../paths';
import { useAuthentication } from '../authentication';

const CombinedNavLink = ThemeUiNavLink as FC<ThemeUiNavLinkProps & RouterNavLinkProps>;

const NavLink: FC<RouterNavLinkProps> = ({ to, children }) => {
  return (
    <CombinedNavLink p={2} as={RouterNavLink} to={to}>
      {children}
    </CombinedNavLink>
  );
};

export const Navigation = () => {
  const { hasPermission: userHasPermission, signOut } = useAuthentication();
  const hasPermissions = (permissions: string[]) => permissions.every(userHasPermission);

  return (
    <Flex as="nav" p={2} sx={{ maxWidth: 'pageWidth', justifyContent: 'space-between' }} mx="auto">
      <Box>
        {
          <NavLink to={HOME_PATH}>
            <Message>navigation.home</Message>
          </NavLink>
        }

        {hasPermissions(PERMISSIONS_REQUIRED_FOR_USER_CREATION_PAGE) && (
          <NavLink to={USER_CREATION_PATH}>
            <Message>navigation.userCreation</Message>
          </NavLink>
        )}

        {hasPermissions(PERMISSIONS_REQUIRED_FOR_ADD_TEST_TO_IDENTIFIER_PAGE) && (
          <NavLink to={ADD_TEST_TO_IDENTIFIER_PATH}>
            <Message>navigation.addTest</Message>
          </NavLink>
        )}
      </Box>

      <ThemeUiNavLink p={2} onClick={signOut} href="/">
        Log out
      </ThemeUiNavLink>
    </Flex>
  );
};
