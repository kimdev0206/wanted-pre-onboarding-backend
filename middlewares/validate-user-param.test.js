const httpMocks = require("node-mocks-http");
const { faker } = require("@faker-js/faker");
const { StatusCodes } = require("http-status-codes");

const { validateUserParam } = require(".");

let mockNext;

beforeAll(() => (mockNext = jest.fn()));

describe("", () => {
  afterEach(() => jest.clearAllMocks());

  test("유효한 인증 형식", () => {
    const mockReq = httpMocks.createRequest({
      body: {
        userEmail: faker.internet.email(),
        password: faker.internet.password({ length: 8 }),
      },
    });
    const mockRes = httpMocks.createResponse();

    validateUserParam(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  test("유효하지 않은 이메일 형식", () => {
    const mockReq = httpMocks.createRequest({
      body: {
        userEmail: faker.lorem.word(),
        password: faker.internet.password({ length: 8 }),
      },
    });
    const mockRes = httpMocks.createResponse();

    validateUserParam(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test("유효하지 않은 비밀번호 형식", () => {
    const mockReq = httpMocks.createRequest({
      body: {
        userEmail: faker.lorem.word(),
        password: faker.internet.password({ length: 7 }),
      },
    });
    const mockRes = httpMocks.createResponse();

    validateUserParam(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
