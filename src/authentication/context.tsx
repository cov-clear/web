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

const LOCAL_STORAGE_KEY = 'token';

export const Provider = ({ children }: { children?: ReactNode }) => {
  const [token, setToken] = useState<Token | null>(localStorage.getItem(LOCAL_STORAGE_KEY));

  const signOut = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setToken(null);
  }, []);

  const authenticate = useCallback((token) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, token);
    setToken(token);
  }, []);

  return <ContextProvider value={{ authenticate, signOut, token }}>{children}</ContextProvider>;
};

export const useAuthentication = (): AuthenticationContext => useContext(authenticationContext);
