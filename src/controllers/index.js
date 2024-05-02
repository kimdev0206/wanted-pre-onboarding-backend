const PostController = require("./post.controller");
const UserController = require("./user.controller");

const postController = new PostController();
const userController = new UserController();

module.exports = {
  postController,
  userController,
};
