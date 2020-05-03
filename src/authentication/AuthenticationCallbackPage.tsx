import React, { useEffect } from 'react';
import { Spinner } from 'theme-ui';
import { useHistory, useLocation } from 'react-router-dom';
import http from 'axios';
import { authenticate, AuthenticationMethod } from '../api';
import { useAuthentication } from './context';
import { decode } from './token';

export const AuthenticationCallbackPage = () => {
  const queryParams = useQuery();
  const { authenticate: saveToken } = useAuthentication();
  const history = useHistory();

  useEffect(() => {
    const cancelToken = http.CancelToken.source();

    async function authenticateWithMethod() {
      const method = AuthenticationMethod[queryParams.get('method') as AuthenticationMethod];
      const authCode = queryParams.get(authenticationMethodAuthCodeQueryParameter[method]);
      if (method && authCode) {
        try {
          const token = await authenticate(method, authCode, {
            cancelToken: cancelToken.token,
          });
          saveToken(token);
          const { userId } = decode(token);
          history.replace(`/users/${userId}`);
        } catch (error) {
          history.replace(`/login?invalid=true`);
        }
      } else {
        history.replace(`/login?invalid=true`);
      }
    }

    authenticateWithMethod();

    return () => cancelToken.cancel();
  }, [saveToken, history, queryParams]);

  return <Spinner variant="spinner.main" />;
};

const authenticationMethodAuthCodeQueryParameter: Record<AuthenticationMethod, string> = {
  ESTONIAN_ID: 'session_token',
  MAGIC_LINK: 'authCode',
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}
