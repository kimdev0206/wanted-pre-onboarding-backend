const express = require("express");
const { userRoute, postRoute } = require("../routes");
const { handleErrorEndpoint, handleErrorModule } = require("../middlewares");
const httpRequestLogger = require("../middlewares/http-request-logger");
const { queryParser, bodyParser } = require("../middlewares/parser");

module.exports = () => {
  const app = express();

  app.use(queryParser, bodyParser, httpRequestLogger);

  app.use("/user", userRoute);
  app.use("/post", postRoute);

  app.use(handleErrorEndpoint);
  app.use(handleErrorModule);

  return app;
};
