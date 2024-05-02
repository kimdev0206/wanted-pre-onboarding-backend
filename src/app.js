const express = require("express");
const cookieParser = require("cookie-parser");
const { errorMiddleware, logMiddleware } = require("./middlewares");

function App() {
  this.app = express();
  this.initPreMiddlewares();

  const controllers = require("./controllers");
  this.initControllers(controllers);

  this.initPostMiddlewares();

  return this.app;
}

App.prototype.initPreMiddlewares = function () {
  this.app.use(express.urlencoded({ extended: false }));
  this.app.use(express.json());
  this.app.use(cookieParser());
  this.app.use(logMiddleware);
};

App.prototype.initControllers = function (controllers) {
  Object.values(controllers).forEach((controller) =>
    this.app.use("/api", controller.router)
  );
};

App.prototype.initPostMiddlewares = function () {
  this.app.use(errorMiddleware);
};

module.exports = App;
