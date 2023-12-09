const httpMocks = require("node-mocks-http");
const { faker } = require("@faker-js/faker");
const { StatusCodes } = require("http-status-codes");

require("dotenv").config();
const { validatePostSeq } = require(".");
const database = require("../apps/database");
const { postRepository: repository } = require("../repositories");

const postSeq = 2_147_483_647; // MySQL INT타입 최댓값
const userSeq = +process.env.TEST_USER_SEQ;
let mockNext;

beforeAll(async () => {
  await repository.insertPostWithSeq({
    postSeq,
    superSeq: 1,
    postTitle: faker.person.jobTitle(),
    postContent: faker.lorem.text(),
    userSeq,
  });

  mockNext = jest.fn();
});
afterAll(async () => {
  await repository.deletePost({ postSeq, userSeq });
  await database.close();
});

describe("", () => {
  afterEach(() => jest.clearAllMocks());

  test("유효한 게시글 일련번호", async () => {
    const mockReq = httpMocks.createRequest({
      params: {
        postSeq,
      },
    });
    const mockRes = httpMocks.createResponse();

    await validatePostSeq(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  test("유효하지 않은 게시글 일련번호", async () => {
    const mockReq = httpMocks.createRequest({
      params: {
        postSeq: Number.MAX_SAFE_INTEGER,
      },
    });
    const mockRes = httpMocks.createResponse();

    await validatePostSeq(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(StatusCodes.BAD_REQUEST);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
