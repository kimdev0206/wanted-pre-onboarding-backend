const express = require("express");
const makeUserRoute = require("./user-route");
const makePostRoute = require("./post-route");
const { userController, postController } = require("../controllers");
const {
  validateUserParam,
  validateUserSeq,
  validatePostSeqType,
  validatePostSeq,
  validatePostTitle,
  verifyToken,
} = require("../middlewares");

const userRoute = makeUserRoute({ userController, express, validateUserParam });
const postRoute = makePostRoute({
  postController,
  express,
  validateUserSeq,
  validatePostSeqType,
  validatePostSeq,
  validatePostTitle,
  verifyToken,
});

module.exports = Object.freeze({
  userRoute,
  postRoute,
});
