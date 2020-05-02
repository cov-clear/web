import React, { useEffect } from 'react';
import { Spinner } from 'theme-ui';
import { useParams, useHistory } from 'react-router-dom';
import http from 'axios';
import { authenticate, AuthenticationMethod } from '../api';
import { useAuthentication } from './context';
import { decode } from './token';

export const LinkPage = () => {
  const { linkId } = useParams();
  const { authenticate: saveToken } = useAuthentication();
  const history = useHistory();

  useEffect(() => {
    const cancelToken = http.CancelToken.source();

    async function authenticateWithLink() {
      if (linkId) {
        try {
          const token = await authenticate(AuthenticationMethod.MAGIC_LINK, linkId, {
            cancelToken: cancelToken.token,
          });
          saveToken(token);
          const { userId } = decode(token);
          history.replace(`/users/${userId}`);
        } catch (error) {
          history.replace(`/login?invalid=true`);
        }
      }
    }

    authenticateWithLink();

    return () => cancelToken.cancel();
  }, [authenticate, history, linkId]);

  return <Spinner variant="spinner.main" />;
};
