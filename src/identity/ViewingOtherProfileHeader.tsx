import React from 'react';
import { Box, Flex, Heading, Button, ButtonProps } from 'theme-ui';
import { Link, LinkProps } from 'react-router-dom';

const LinkButton = Button as React.FC<ButtonProps & LinkProps>;
// TODO: the styling on this header is very ad-hoc. Let's move it into the theme.
// TODO: this maybe doesn't belong in this module. Where does it belong?
export const ViewingOtherProfileHeader = () => (
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
