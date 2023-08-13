const express = require("express");
const makeUserRoute = require("./user-route");
const makePostRoute = require("./post-route");
const { userController, postController } = require("../controllers");
const {
  validateUserParam,
  validatePostSeq,
  verifyToken,
} = require("../middlewares");

const userRoute = makeUserRoute({ userController, express, validateUserParam });
const postRoute = makePostRoute({
  postController,
  express,
  validatePostSeq,
  verifyToken,
});

module.exports = Object.freeze({
  userRoute,
  postRoute,
});
