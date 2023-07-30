const makeUserController = require("./user-controller");
const makePostController = require("./post-controller");
const { userUsecase, postUsecase } = require("../usecases");
const logger = require("../utils/logger");

const userController = makeUserController({ userUsecase, logger });
const postController = makePostController({ postUsecase, logger });

module.exports = Object.freeze({
  userController,
  postController,
});
