module.exports = function (req, _, next) {
  const { email, password } = req.body;

  if (!email.includes("@")) {
    let error = new Error("요청하신 이메일은 유효하지 않은 형식입니다.");
    error.status = 400;
    return next(error);
  }

  if (password.length < 8) {
    let error = new Error("비밀번호는 8자 이상이어야 합니다.");
    error.status = 400;
    return next(error);
  }

  next();
};
