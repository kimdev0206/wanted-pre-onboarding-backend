module.exports = function (error, req, res, next) {
  const status = error.status || 500;
  const message = error.message || "서버 내부에서 에러가 발생했습니다.";

  console.error(error);
  res.status(status);
  res.json({ message });
};
