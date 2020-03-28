import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Token } from '../api';

interface AuthenticationContext {
  token: Token | null;
  authenticate: (token: Token) => void;
  signOut: () => void;
}

const authenticationContext = createContext<AuthenticationContext>({
  token: null,
  authenticate: () => {},
  signOut: () => {},
});

const { Provider: ContextProvider } = authenticationContext;

export const Provider = ({ children }: { children?: ReactNode }) => {
  const [token, setToken] = useState<Token | null>(null);
  const signOut = useCallback(() => setToken(null), [setToken]);
  const authenticate = setToken as (token: Token) => void;

  return <ContextProvider value={{ authenticate, signOut, token }}>{children}</ContextProvider>;
};

export const useAuthentication = (): AuthenticationContext => useContext(authenticationContext);
