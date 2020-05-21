import React, { useEffect } from 'react';
import { Spinner } from 'theme-ui';
import { useHistory, useLocation } from 'react-router-dom';
import http from 'axios';

import { createAccessPass } from '../api';
import { useAuthentication } from '../authentication';
import { UUID_VALIDATION_REGEX } from './UUID_VALIDATION_REGEX';

export const ScanCallbackPage = () => {
  const queryParams = useQuery();
  const { userId, token } = useAuthentication();
  const history = useHistory();

  const sharingCode = queryParams.get('sharingCode');

  useEffect(() => {
    const cancelToken = http.CancelToken.source();

    async function run() {
      if (sharingCode && userId && token) {
        if (sharingCode.match(UUID_VALIDATION_REGEX)) {
          try {
            const accessPass = await createAccessPass(userId, sharingCode, {
              token,
              cancelToken: cancelToken.token,
            });

            history.push(`/users/${accessPass.userId}`);
          } catch (error) {
            if (!http.isCancel(error)) {
              history.replace('/scan');
            }
          }
        } else {
          history.replace('/scan');
        }
      }
    }

    run();

    return () => cancelToken.cancel();
  }, [history, sharingCode, token, userId]);

  return <Spinner variant="spinner.main" />;
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}
