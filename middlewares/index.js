const jwt = require("jsonwebtoken");
const { StatusCodes: statusCodes } = require("http-status-codes");
const path = require("path");
const fileName = path.basename(__filename, ".js");
const logger = require("../utils/logger");

function validateUserParam(req, res, next) {
  try {
    const { userEmail, password } = req.body;

    if (!userEmail.includes("@")) {
      res.status(statusCodes.BAD_REQUEST);
      return res.json({ message: "유효하지 않은 이메일 형식입니다." });
    }

    if (password.length < 8) {
      res.status(statusCodes.BAD_REQUEST);
      return res.json({ message: "비밀번호는 8자 이상이어야 합니다." });
    }
  } catch (err) {
    logger.warn(`[${fileName}]_${err.message}`);

    res.status(statusCodes.INTERNAL_SERVER_ERROR);
    return res.json({ message: "서버 내부에서 에러가 발생하였습니다." });
  }

  return next();
}

function verifyToken(req, res, next) {
  if (!req.headers.authorization) {
    res.status(statusCodes.UNAUTHORIZED);
    return res.json({ message: "JWT 토큰이 필요합니다." });
  }

  const encodedToken = req.headers.authorization.split(" ")[1];
  const secretKey = process.env.JWT_SECRET;

  try {
    req.decodedToken = jwt.verify(encodedToken, secretKey);
    return next();
  } catch (err) {
    logger.warn(`[${fileName}]_${err.message}`);

    res.status(statusCodes.UNAUTHORIZED);
    return res.json({ message: "JWT 토큰이 만료되었습니다." });
  }
}

function handleErrorEndpoint(req, res) {
  res.status(statusCodes.NOT_FOUND);
  return res.json({
    message: "유효하지 않은 API 입니다.",
  });
}

function handleErrorModule(err, req, res) {
  logger.error(`[${fileName}]_${err.message}`);

  res.status(err.status);
  return res.json({ message: "서버 내부에서 에러가 발생하였습니다." });
}

module.exports = Object.freeze({
  validateUserParam,
  verifyToken,
  handleErrorEndpoint,
  handleErrorModule,
});
