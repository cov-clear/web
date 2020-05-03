import React, { FC } from 'react';
import { RouteProps, Redirect, Route } from 'react-router-dom';

import { useAuthentication } from './context';
import { NotFoundPage } from '../staticPages';

interface AuthenticatedRouteRedirecterProps {
  requiredPermissions?: string[];
}

const AuthenticatedRouteRedirecter: FC<AuthenticatedRouteRedirecterProps> = ({
  requiredPermissions,
  children,
}) => {
  const { token, hasPermission: userHasPermission } = useAuthentication();
  const authenticated = !!token;

  if (!authenticated) {
    return <Redirect to="/login" />;
  }

  if (requiredPermissions && !requiredPermissions.every(userHasPermission)) {
    return <NotFoundPage />;
  }

  return <>{children}</>;
};

interface AuthenticatedRouteProps extends RouteProps {
  requiredPermissions?: string[];
}

export const AuthenticatedRoute: FC<AuthenticatedRouteProps> = ({
  requiredPermissions,
  children,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={() => (
        <AuthenticatedRouteRedirecter requiredPermissions={requiredPermissions}>
          {children}
        </AuthenticatedRouteRedirecter>
      )}
    />
  );
};
