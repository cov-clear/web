import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { Heading, Button, ButtonProps } from 'theme-ui';

const NavButton = Button as React.FC<ButtonProps & LinkProps>;
export const NotFoundPage = () => (
  <>
    <Heading mb={4}>This page wasn't found</Heading>
    <NavButton as={Link} sx={{ display: 'block', width: '100%' }} to="/">
      Go to the start page
    </NavButton>
  </>
);

export const StartPage = () => (
  <>
    <Heading mb={4}>cov-clear</Heading>
    <NavButton as={Link} sx={{ display: 'block', width: '100%' }} to="/login">
      Sign in
    </NavButton>
  </>
);
