const httpMocks = require("node-mocks-http");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const { verifyToken } = require(".");

const userSeq = 0;
let mockNext;

beforeAll(() => (mockNext = jest.fn()));

describe("", () => {
  afterEach(() => jest.clearAllMocks());

  test("유효한 JWT 토큰", () => {
    const token = jwt.sign({ userSeq }, process.env.JWT_SECRET, {
      expiresIn: "1h",
      algorithm: "HS256",
    });
    const mockReq = httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const mockRes = httpMocks.createResponse();

    verifyToken(mockReq, mockRes, mockNext);

    expect(mockReq).toHaveProperty("decodedToken.userSeq", userSeq);
    expect(mockNext).toHaveBeenCalled();
  });

  test("JWT 누락", () => {
    const mockReq = httpMocks.createRequest({
      headers: {},
    });
    const mockRes = httpMocks.createResponse();

    verifyToken(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    expect(mockReq).not.toHaveProperty("decodedToken.userSeq", userSeq);
    expect(mockNext).not.toHaveBeenCalled();
  });

  test("JWT 만료", () => {
    const token = jwt.sign({}, process.env.JWT_SECRET, {
      expiresIn: "1ms",
      algorithm: "HS256",
    });

    setTimeout(() => {}, 1);

    const mockReq = httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const mockRes = httpMocks.createResponse();

    verifyToken(mockReq, mockRes, mockNext);

    expect(mockRes.statusCode).toBe(StatusCodes.UNAUTHORIZED);
    expect(mockReq).not.toHaveProperty("decodedToken.userSeq", userSeq);
    expect(mockNext).not.toHaveBeenCalled();
  });
});
