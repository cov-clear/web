import decodeToken from 'jwt-decode';
import { Token } from '../api';

export interface TokenPayload {
  userId: string;
  roles: string[];
  permissions: string[];
}

export const decode = (token: Token): TokenPayload => decodeToken<TokenPayload>(token);
