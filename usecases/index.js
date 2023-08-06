const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const { StatusCodes: statusCodes } = require("http-status-codes");
const makeUserUsecase = require("./user-usecase");
const makePostUsecase = require("./post-usecase");
const { userRepository, postRepository } = require("../repositories");

const userUsecase = makeUserUsecase({
  userRepository,
  statusCodes,
  argon2,
  jwt,
});
const postUsecase = makePostUsecase({ postRepository, statusCodes });

module.exports = Object.freeze({
  userUsecase,
  postUsecase,
});
