import React, { FC } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { Container, Heading, Text, Button, ButtonProps } from 'theme-ui';

const LinkButton = Button as React.FC<ButtonProps & LinkProps>;

export const HowItWorksPage: FC = () => {
  return (
    <Container variant="page">
      <Heading as="h1" mb={4}>
        How it works
      </Heading>

      <Text mb={4}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Non delectus minus temporibus
        distinctio beatae soluta debitis voluptatum hic suscipit odit ducimus tempore quasi ad dicta
        nisi deleniti facere, dolore assumenda?
      </Text>

      <LinkButton as={Link} to="/" variant="block">
        Continue
      </LinkButton>
    </Container>
  );
};
