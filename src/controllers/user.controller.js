const { Router } = require("express");
const { validateUserBody } = require("../middlewares");
const UserService = require("../services/user.service");

function UserController() {
  this.service = new UserService();

  const router = Router();
  this.initRoutes(router);

  return {
    router,
  };
}

UserController.prototype.initRoutes = function (router) {
  const path = "/users";

  // 과제 1. 사용자 회원가입 엔드포인트
  router.post(`${path}/sign-up`, validateUserBody, this.signUp.bind(this));

  // 과제 2. 사용자 로그인 엔드포인트
  router.post(`${path}/log-in`, validateUserBody, this.logIn.bind(this));
};

UserController.prototype.signUp = async function (req, res, next) {
  try {
    const { email, password } = req.body;

    const params = { email, password };
    const status = await this.service.signUp(params);

    res.status(status);
    res.json({
      message: "회원가입이 완료 되었습니다.",
    });
  } catch (error) {
    next(error);
  }
};

UserController.prototype.logIn = async function (req, res, next) {
  try {
    const { email, password } = req.body;

    const params = { email, password };
    const accessToken = await this.service.logIn(params);

    res.cookie("Access-Token", accessToken);
    res.json({
      message: "로그인이 완료 되었습니다.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = UserController;
