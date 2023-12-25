const httpMocks = require("node-mocks-http");
const { StatusCodes } = require("http-status-codes");

const { validateUserSeq } = require(".");

let mockNext;

beforeAll(() => (mockNext = jest.fn()));

describe("", () => {
  afterEach(() => jest.clearAllMocks());

  test("유효한 사용자 일련번호", () => {
    const mockReq = httpMocks.createRequest({
      decodedToken: {
        userSeq: 0,
      },
      prevPost: {
        userSeq: 0,
      },
    });
    const mockRes = httpMocks.createResponse();

    validateUserSeq(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  test("유효하지 않은 사용자 일련번호", () => {
    const mockReq = httpMocks.createRequest({
      decodedToken: {
        userSeq: 0,
      },
      prevPost: {
        userSeq: 1,
      },
    });
    const mockRes = httpMocks.createResponse();

    validateUserSeq(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(StatusCodes.FORBIDDEN);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
