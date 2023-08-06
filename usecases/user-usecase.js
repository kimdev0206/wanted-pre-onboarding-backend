module.exports = ({ userRepository: repository, statusCodes, argon2, jwt }) => {
  return Object.freeze({
    postUser,
    patchUser,
  });

  async function postUser({ userEmail, password }) {
    const [row] = await repository.selectByUserEmail(userEmail);

    if (row) {
      const err = new Error("중복된 이메일 입니다.");
      err.status = statusCodes.UNAUTHORIZED;
      return Promise.reject(err);
    }

    const hashedPassword = await argon2.hash(password);

    const { insertId: userSeq } = await repository.insertUser({
      userEmail,
      hashedPassword,
    });
    const token = jwt.sign({ userSeq }, process.env.JWT_SECRET, {
      expiresIn: "1h",
      algorithm: "HS256",
    });
    return Promise.resolve({ token, status: statusCodes.CREATED });
  }

  async function patchUser({ userEmail, password }) {
    const [row] = await repository.selectByUserEmail(userEmail);

    if (!row) {
      const err = new Error("가입되지 않은 이메일 입니다.");
      err.status = statusCodes.UNAUTHORIZED;
      return Promise.reject(err);
    }

    const isValidPassword = await argon2.verify(row.hashedPassword, password);

    if (!isValidPassword) {
      const err = new Error("유효하지 않은 비밀번호 입니다.");
      err.status = statusCodes.UNAUTHORIZED;
      return Promise.reject(err);
    }

    const { userSeq } = row;
    const token = jwt.sign({ userSeq }, process.env.JWT_SECRET, {
      expiresIn: "1h",
      algorithm: "HS256",
    });
    return Promise.resolve(token);
  }
};
