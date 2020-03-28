import React, { useEffect } from 'react';
import { Spinner } from 'theme-ui';
import { useParams, useHistory } from 'react-router-dom';
import http from 'axios';
import { authenticate as exchangeLinkForToken } from '../api';
import { useAuthentication } from './context';
import { decode } from './token';

export const LinkPage = () => {
  const { linkId } = useParams();
  const { authenticate } = useAuthentication();
  const history = useHistory();

  useEffect(() => {
    const cancelToken = http.CancelToken.source();

    async function authenticateWithLink() {
      if (linkId) {
        const token = await exchangeLinkForToken(linkId, { cancelToken: cancelToken.token });
        authenticate(token);
        const { userId } = decode(token);
        history.replace(`/users/${userId}`);
      }
    }

    authenticateWithLink();

    return () => cancelToken.cancel();
  }, [authenticate, history, linkId]);

  return <Spinner mx="auto" sx={{ display: 'block' }} />;
};
