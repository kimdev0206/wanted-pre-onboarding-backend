const path = require("path");
const fileName = path.basename(__filename, ".js");

module.exports = ({ userUsecase: usecase, logger }) => {
  return Object.freeze({
    signUp,
    logIn,
  });

  async function signUp(req, res) {
    const { userEmail, password } = req.body;

    try {
      const { token, status } = await usecase.postUser({ userEmail, password });
      res.header("Authorization", `Bearer ${token}`);

      const message = "회원가입이 완료되었습니다.";
      logger.info(`사용자 ${userEmail}의 ${message}`);
      res.status(status);
      res.json({ message });
    } catch (err) {
      logger.warn(`[${fileName}]_${err.message}`);

      res.status(err.status);
      res.json({ message: err.message });
    }
  }

  async function logIn(req, res) {
    const { userEmail, password } = req.body;

    try {
      const token = await usecase.patchUser({ userEmail, password });
      res.header("Authorization", `Bearer ${token}`);

      const message = "로그인이 완료되었습니다.";
      logger.info(`사용자 ${userEmail}의 ${message}`);
      res.json({ message });
    } catch (err) {
      logger.warn(`[${fileName}]_${err.message}`);

      res.status(err.status);
      res.json({ message: err.message });
    }
  }
};
