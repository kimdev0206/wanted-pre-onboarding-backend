const jwt = require("jsonwebtoken");

module.exports = function (req, _, next) {
  if (!req.cookies["Access-Token"]) {
    let error = new Error("접근 토큰이 존재하지 않습니다.");
    error.status = 401;
    return next(error);
  }

  try {
    const accessToken = req.cookies["Access-Token"];
    req.decodedToken = jwt.verify(accessToken, "secret");
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      let error = new Error("접근 토큰이 만료되었습니다.");
      error.status = 401;
      return next(error);
    }

    if (error instanceof jwt.JsonWebTokenError) {
      error.status = 401;
      return next(error);
    }
  }

  next();
};
