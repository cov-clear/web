import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { Heading, Button, ButtonProps, Image } from 'theme-ui';

import balloonIllustration from './illustrations/balloons.svg';

const NavButton = Button as React.FC<ButtonProps & LinkProps>;
export const NotFoundPage = () => (
  <>
    <Heading as="h1" mb={5}>
      This page doesn't exist
    </Heading>
    <Image src={balloonIllustration} alt="A woman flying away with a bundle of balloons" mb={2} />
    <NavButton as={Link} variant="block" to="/">
      Go to the start page
    </NavButton>
  </>
);
