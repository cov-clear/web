import React from 'react';
import { Box, Flex, Heading, Button, ButtonProps } from 'theme-ui';
import { Link, LinkProps } from 'react-router-dom';
import { useAuthentication } from '../authentication';
import { Message } from 'retranslate';

const LinkButton = Button as React.FC<ButtonProps & LinkProps>;
// TODO: the styling on this header is very ad-hoc. Let's move it into the theme.
// TODO: this maybe doesn't belong in this module. Where does it belong?
export const ViewingOtherProfileHeader = () => {
  const { userId } = useAuthentication();
  return (
    <Box sx={{ backgroundColor: 'primary', color: 'background' }}>
      <Flex px={3} py={2} sx={{ justifyContent: 'space-between', maxWidth: '600px' }} mx="auto">
        <Heading as="h2" sx={{ lineHeight: 1.8 }}>
          <Message>viewingOtherProfileHeader.heading</Message>
        </Heading>
        <LinkButton
          as={Link}
          to={`/users/${userId}`}
          sx={{ border: '2px solid', borderColor: 'background' }}
        >
          <Message>viewingOtherProfileHeader.button</Message>
        </LinkButton>
      </Flex>
    </Box>
  );
};
