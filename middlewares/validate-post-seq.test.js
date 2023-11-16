const httpMocks = require("node-mocks-http");
const { faker } = require("@faker-js/faker");
const { StatusCodes } = require("http-status-codes");

const { validatePostSeq } = require(".");

let mockNext;

beforeAll(() => (mockNext = jest.fn()));

describe("", () => {
  afterEach(() => jest.clearAllMocks());

  test("유효한 게시글 일련번호 형식", () => {
    const mockReq = httpMocks.createRequest({
      params: {
        postSeq: 0,
      },
    });
    const mockRes = httpMocks.createResponse();

    validatePostSeq(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  test("유효하지 않은 게시글 일련번호 형식", () => {
    const mockReq = httpMocks.createRequest({
      params: {
        postSeq: faker.lorem.word(),
      },
    });
    const mockRes = httpMocks.createResponse();

    validatePostSeq(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
