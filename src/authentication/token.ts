import decodeToken from 'jwt-decode';
import { Token } from '../api';

export enum Role {}

export interface TokenPayload {
  userId: string;
  roles: Role[];
}

export const decode = (token: Token): TokenPayload => decodeToken<TokenPayload>(token);
