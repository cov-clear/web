import React, { FC } from 'react';
import { RouteProps, Redirect, Route } from 'react-router-dom';

import { useAuthentication } from './context';
import { NotFoundPage } from '../staticPages';

interface AuthenticatedRouteRedirecterProps {
  requiredPermission?: string;
}

const AuthenticatedRouteRedirecter: FC<AuthenticatedRouteRedirecterProps> = ({
  requiredPermission,
  children,
}) => {
  const { token, hasPermission } = useAuthentication();
  const authenticated = !!token;

  if (!authenticated) {
    return <Redirect to="/login" />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <NotFoundPage />;
  }

  return <>{children}</>;
};

interface AuthenticatedRouteProps extends RouteProps {
  requiredPermission?: string;
}

export const AuthenticatedRoute: FC<AuthenticatedRouteProps> = ({
  requiredPermission,
  children,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={() => (
        <AuthenticatedRouteRedirecter requiredPermission={requiredPermission}>
          {children}
        </AuthenticatedRouteRedirecter>
      )}
    />
  );
};
