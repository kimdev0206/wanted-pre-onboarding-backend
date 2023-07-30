const bcypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { StatusCodes: statusCodes } = require("http-status-codes");
const makeUserUsecase = require("./user-usecase");
const makePostUsecase = require("./post-usecase");
const { userRepository, postRepository } = require("../repositories");

// TODO: 기본 옵션 캡슐화
const userUsecase = makeUserUsecase({
  userRepository,
  statusCodes,
  bcypt,
  jwt,
});
const postUsecase = makePostUsecase({ postRepository, statusCodes });

module.exports = Object.freeze({
  userUsecase,
  postUsecase,
});
