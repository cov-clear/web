import http, { CancelToken } from 'axios';

const HTTP_TIMEOUT = 3000;

const unAuthenticated = () => http.create({ timeout: HTTP_TIMEOUT });

const authenticated = (token: Token) =>
  http.create({
    timeout: HTTP_TIMEOUT,
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
  options?: HttpOptions
): Promise<MagicLinkResult> {
  const response = await unAuthenticated().post(
    '/api/v1/auth/magic-links',
    { email },
    { cancelToken: options?.cancelToken }
  );
  return response.data;
}

export interface IdAuthenticationSession {
  redirectUrl: string;
}

export async function createIdAuthenticationSession(
  options?: HttpOptions
): Promise<IdAuthenticationSession> {
  const response = await unAuthenticated().post('/api/v1/auth/sessions', {
    cancelToken: options?.cancelToken,
  });
  return response.data;
}

export enum AuthenticationMethod {
  MAGIC_LINK = 'MAGIC_LINK',
  ESTONIAN_ID = 'ESTONIAN_ID',
}

export async function authenticate(
  method: AuthenticationMethod,
  authCode: string,
  options?: HttpOptions
): Promise<Token> {
  const response = await unAuthenticated().post(
    '/api/v1/auth/login',
    { method, authCode },
    { cancelToken: options?.cancelToken }
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
  region?: string;
  postcode: string;
  countryCode: string;
}

export async function updateUser(user: User, options: AuthenticatedHttpOptions): Promise<User> {
  const response = await authenticated(options.token).patch(`/api/v1/users/${user.id}`, user, {
    cancelToken: options.cancelToken,
  });
  return response.data;
}

export interface CreateUserCommand {
  authenticationDetails: {
    method: AuthenticationMethod;
    identifier: string;
  };
  roles: Role['name'][];
}

export async function createUsers(
  command: CreateUserCommand[],
  options: AuthenticatedHttpOptions
): Promise<User[]> {
  const response = await authenticated(options.token).post('/api/v1/admin/users', command);
  return response.data;
}

export interface Country {
  code: string;
  name: string;
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
  options: AuthenticatedHttpOptions
): Promise<SharingCode> {
  const response = await authenticated(options.token).post(
    `/api/v1/users/${userId}/sharing-code`,
    undefined,
    {
      cancelToken: options.cancelToken,
    }
  );
  return response.data;
}

export interface AccessPass {
  userId: string;
  expiryTime: string;
}

export async function createAccessPass(
  userId: string,
  code: string,
  options: AuthenticatedHttpOptions
): Promise<AccessPass> {
  const response = await authenticated(options.token).post(
    `/api/v1/users/${userId}/access-passes`,
    { code },
    {
      cancelToken: options.cancelToken,
    }
  );
  return response.data;
}

export type FieldValue = boolean | string | number;

export interface TestResults {
  details: { [key: string]: FieldValue };
  notes: string;
  testerUserId: string;
  creationTime: string;
}

export type ResultInterpretationTheme = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MUTED';

export interface ResultInterpretation {
  name: string;
  theme: ResultInterpretationTheme;
}

export interface Test {
  id: string;
  userId: string;
  testType: TestType;
  creationTime: string;
  results?: TestResults;
  resultsInterpretations?: ResultInterpretation[];
}

export async function fetchTest(testId: string, options: AuthenticatedHttpOptions): Promise<Test> {
  const response = await authenticated(options.token).get(`/api/v1/tests/${testId}`, {
    cancelToken: options.cancelToken,
  });
  return response.data;
}

export async function fetchTests(
  userId: string,
  options: AuthenticatedHttpOptions
): Promise<Test[]> {
  const response = await authenticated(options.token).get(`/api/v1/users/${userId}/tests`, {
    cancelToken: options.cancelToken,
  });
  return response.data;
}

export type FieldType = 'boolean' | 'string' | 'number' | 'integer' | 'null';

export interface FieldSchema {
  type: FieldType;
  title: string;
  description?: string;
  enum?: FieldValue[];
}

export interface ObjectSchema {
  type: 'object';
  title: string;
  description?: string;
  properties: { [key: string]: FieldSchema };
}

export interface TestType {
  id: string;
  name: string;
  resultsSchema: ObjectSchema;
  neededPermissionToAddResults: string;
}

export async function fetchTestTypes(options: AuthenticatedHttpOptions): Promise<TestType[]> {
  const response = await authenticated(options.token).get(`/api/v1/test-types`, {
    cancelToken: options.cancelToken,
  });
  return response.data;
}

export type FilledSchema = { [key: string]: FieldValue };

export interface CreateTestCommand {
  testTypeId: string;
  results?: {
    details: FilledSchema;
    notes?: string;
  };
}

export async function createTest(
  userId: string,
  command: CreateTestCommand,
  options: AuthenticatedHttpOptions
) {
  const response = await authenticated(options.token).post(
    `/api/v1/users/${userId}/tests`,
    command,
    {
      cancelToken: options.cancelToken,
    }
  );
  return response.data;
}

export interface Role {
  name: string;
  permissions: string[];
}

export async function fetchRoles(options: AuthenticatedHttpOptions): Promise<Role[]> {
  const response = await authenticated(options.token).get('/api/v1/roles', {
    cancelToken: options.cancelToken,
  });
  return response.data;
}
