import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Token } from '../api';
import { decode } from './token';

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
const useLocalStorage = process.env.NODE_ENV !== 'production';

export const Provider = ({ children }: { children?: ReactNode }) => {
  const [token, setToken] = useState<Token | null>(
    useLocalStorage ? localStorage.getItem(LOCAL_STORAGE_KEY) : null
  );

  const signOut = useCallback(() => {
    if (useLocalStorage) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setToken(null);
  }, []);

  const authenticate = useCallback(token => {
    if (useLocalStorage) {
      localStorage.setItem(LOCAL_STORAGE_KEY, token);
    }
    setToken(token);
  }, []);

  return <ContextProvider value={{ authenticate, signOut, token }}>{children}</ContextProvider>;
};

export interface Authentication extends AuthenticationContext {
  userId?: string;
  hasPermission: (permission: string) => boolean;
}

export const useAuthentication = (): Authentication => {
  const context = useContext(authenticationContext);
  const decodedToken = context.token ? decode(context.token) : null;

  const hasPermission = useCallback(
    (permission: string) => {
      if (!decodedToken) {
        return false;
      }
      return decodedToken.permissions.includes(permission);
    },
    [decodedToken]
  );

  if (decodedToken) {
    return {
      ...context,
      userId: decodedToken.userId,
      hasPermission,
    };
  }
  return {
    ...context,
    hasPermission,
  };
};
