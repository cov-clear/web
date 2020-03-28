import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { Heading, Button, ButtonProps, Image } from 'theme-ui';

import medicalIllustration from './illustrations/medicalIllustration.svg';
import balloonIllustration from './illustrations/balloons.svg';

const NavButton = Button as React.FC<ButtonProps & LinkProps>;
export const NotFoundPage = () => (
  <>
    <Heading mb={4}>This page doesn't exist</Heading>
    <Image src={balloonIllustration} alt="A woman flying away with a bundle of balloons" mb={2} />
    <NavButton as={Link} variant="block" to="/">
      Go to the start page
    </NavButton>
  </>
);

export const StartPage = () => (
  <>
    <Heading mb={4}>Cov-clear</Heading>
    <Image
      src={medicalIllustration}
      alt="Two doctors standing next to a large pill bottle"
      mb={2}
    />
    <NavButton as={Link} variant="block" to="/login">
      Sign in
    </NavButton>
  </>
);
