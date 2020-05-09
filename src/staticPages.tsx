import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { Heading, Button, ButtonProps, Image } from 'theme-ui';

import balloonIllustration from './illustrations/balloons.svg';
import { Message, useTranslations } from 'retranslate';

const NavButton = Button as React.FC<ButtonProps & LinkProps>;
export const NotFoundPage = () => {
  const { translate } = useTranslations();

  return (
    <>
      <Heading as="h1" mb={5}>
        <Message>notFoundPage.heading</Message>
      </Heading>
      <Image src={balloonIllustration} alt={translate('notFoundPage.imageAltText')} mb={2} />
      <NavButton as={Link} variant="block" to="/">
        <Message>notFoundPage.button</Message>
      </NavButton>
    </>
  );
};
