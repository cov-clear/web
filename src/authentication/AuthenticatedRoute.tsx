import React from 'react';
import { RouteProps, Redirect, Route } from 'react-router-dom';
import { useAuthentication } from './context';

const AuthenticatedRouteRedirecter = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuthentication();
  const authenticated = !!token;

  if (!authenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
};

export const AuthenticatedRoute = ({ children, ...rest }: RouteProps) => {
  return (
    <Route
      {...rest}
      render={() => <AuthenticatedRouteRedirecter>{children}</AuthenticatedRouteRedirecter>}
    />
  );
};
