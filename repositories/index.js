const makeUserRepository = require("./user-repository");
const makePostRepository = require("./post-repository");
const database = require("../apps/database");

const userRepository = makeUserRepository(database);
const postRepository = makePostRepository(database);

module.exports = Object.freeze({
  userRepository,
  postRepository,
});
