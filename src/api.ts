import http, { CancelToken } from 'axios';

const authenticated = (token: Token) =>
  http.create({
    timeout: 3000,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export interface HttpOptions {
  cancelToken?: CancelToken;
}

export interface DevelopmentAuthCode {
  value: string;
}

export interface MagicLinkResult {
  code?: DevelopmentAuthCode; // only there in development
  creationTime: string;
  active: boolean;
}

export async function createMagicLink(
  email: string,
  options?: HttpOptions,
): Promise<MagicLinkResult> {
  const response = await http.post(
    '/api/v1/auth/magic-links',
    { email },
    { cancelToken: options?.cancelToken },
  );
  return response.data;
}

export async function authenticate(authCode: string, options?: HttpOptions): Promise<Token> {
  const response = await http.post(
    '/api/v1/auth/login',
    { authCode },
    { cancelToken: options?.cancelToken },
  );
  return response.data.token;
}

export type Token = string;

export interface AuthenticatedHttpOptions extends HttpOptions {
  token: Token;
}

export interface User {
  id: string;
  email: string;
  creationTime: string;
  profile?: Profile;
  address?: Address;
}

export async function fetchUser(id: string, options: AuthenticatedHttpOptions): Promise<User> {
  const response = await authenticated(options.token).get(`/api/v1/users/${id}`, {
    cancelToken: options.cancelToken,
  });
  return response.data;
}

export enum Sex {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export interface Profile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: Sex;
}

export interface Address {
  address1: string;
  address2?: string;
  city: string;
  region: string;
  postcode: string;
  countryCode: string;
}

export interface Country {
  code: string;
  name: string;
}

export async function updateUser(user: User, options: AuthenticatedHttpOptions): Promise<User> {
  const response = await authenticated(options.token).patch(`/api/v1/users/${user.id}`, user, {
    cancelToken: options.cancelToken,
  });
  return response.data;
}

export async function fetchCountries(options: AuthenticatedHttpOptions): Promise<Country[]> {
  const response = await authenticated(options.token).get('/api/v1/countries', {
    cancelToken: options.cancelToken,
  });
  return response.data;
}

export interface SharingCode {
  code: string;
  expiryTime: string;
}

export async function createSharingCodeForUserId(
  userId: string,
  options: AuthenticatedHttpOptions,
) {
  const response = await authenticated(options.token).post(
    `/api/v1/users/${userId}/sharing-code`,
    undefined,
    {
      cancelToken: options.cancelToken,
    },
  );
  return response.data;
}
