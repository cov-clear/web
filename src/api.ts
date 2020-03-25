interface Profile {
  name: string,
  dateOfBirth: string,
  sex: string,
}

interface Address {
  address1: string,
  address2?: string,
  city: string,
  region: string,
  postcode: string,
  countryCode: string
}

interface User {
  id?: string,
  email: string,
  roles: string, // Define this
  profile: Profile,
  address: Address
}

interface TestType {
  id: string,
  name: string
  resultsSchema: object,
  requiresTrustedTester: boolean
}

interface TestResult {
  id?: string,
  testType: string,
  userId: string,
  results: object,
  testerId: string,
  trustedTester?: boolean
}

interface SharingCode {
  code: string,
  expiry: string
}

const user = {
  id: "ABCDE-12345-ABCDE-12345",
  email: "test@test.com",
  roles: "abc",
  profile: {
    name: "John Smith",
    dateOfBirth: "1970-01-01",
    sex: "male"
  },
  address: {
    address1: "65 Shoreditch High Street",
    address2: "Shoreditch",
    city: "London",
    region: "Greater London",
    postcode: "E1 6JJ",
    countryCode: "UK"
  }
};

const testResult = {
  id: "ABCDE-12345-ABCDE-12346",
  testType: "Antibody",
  userId: "ABCDE-12345-ABCDE-12345",
  results: {
    c: true,
    igg: true,
    igm: true
  },
  testerId: "ABCDE-12345-ABCDE-12346",
  trustedTester: true
};

const testType = {
  id: "ABCDE-12345-ABCDE-12347",
  name: "Antibody",
  resultsSchema: {
    type: "object",
    properties: {
      c: { type: boolean, title: "C" },
      igg: { type: boolean, title: "IgG" },
      igm: { type: boolean, title: "IgM" },
    }
  },
  requiresTrustedTester: false
}

const sharingCode = {
  code: "3a44e5ce-a799-4fe8-a626-cc2e05deaf3a",
  expiry: "2020-04-01T00:00:00Z"
};


function createMagicLink(email: string): Promise<undefined> {
  // POST /auth/magic-links { email }
  return getPromise();
};

function createLogin(email: string, authCode: string): Promise<undefined> {
  // POST /auth/login { email, authCode, method: "magic-link" }
  const response = [];
  return getPromise();
}

function getUser(token: string, userId: string): Promise<User> {
  // GET /users/:userId
  return getPromise(user);
}

function createUser(token: string, user: User): Promise<User> {
  // POST /users { ...data }
  return getPromise(user);
}

function updateUser(token: string, userId: string, user: User): Promise<User> {
  // PUT /users/:userId { ...data }
  return getPromise(user);
}

function getTestResults(token: string, userId: string): Promise<Array<TestResult>> {
  // GET /users/:userId/tests
  return getPromise([testResult]);
}

function createTestResult(token: string, userId: string, data): Promise<TestResult> {
  // POST /users/:userId/tests { ...data }
  return getPromise(testResult);
}

function createSharingCode(token: string, userId: string): Promise<SharingCode> {
  // POST /users/:userId/sharing-code { }
  return getPromise(sharingCode);
}

function requestAccess(token: string, userId: string, sharingCode: string): Promise<object> {
  // POST /users/:userId/access-requests { sharingCode }
  return getPromise({ userId: "ABCDE-12345-ABCDE-12345" });
}

function getTestTypes(token: string)Promise<Array<TestType>> {
  // GET /test-types
  return getPromise([testType]);
}

function getPromise(response: any): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(response), 1000);
  });
}

export default {
  createMagicLink,
  createLogin,
  getUser,
  createUser,
  updateUser,
  getTestResults,
  createTestResult,
  createSharingCode,
  requestAccess,
  getTestTypes
};
