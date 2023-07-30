module.exports = ({
  userController: controller,
  express,
  validateUserParam,
}) => {
  const router = express.Router();

  router.use(validateUserParam);

  // 과제 1. 사용자 회원가입 엔드포인트
  router.post("/sign-up", controller.signUp);

  // 과제 2. 사용자 로그인 엔드포인트
  router.patch("/log-in", controller.logIn);

  return router;
};
