const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserRepository = require("../repositories/user.repository");

function UserService() {
  this.repository = new UserRepository();
}

UserService.prototype.signUp = async function (params) {
  const [row] = await this.repository.selectUser(params.email);

  if (row) {
    let error = new Error("동일한 이메일의 회원이 존재합니다.");
    error.status = 409;
    throw error;
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(params.password, saltRounds);
  await this.repository.insertUser({ ...params, hashedPassword });

  return 201;
};

UserService.prototype.logIn = async function (params) {
  const [row] = await this.repository.selectUser(params.email);

  if (!row) {
    let error = new Error("요청하신 이메일의 회원이 존재하지 않습니다.");
    error.status = 400;
    throw error;
  }

  if (!(await bcrypt.compare(params.password, row.hashedPassword))) {
    let error = new Error("요청하신 비밀번호가 일치하지 않습니다.");
    error.status = 400;
    throw error;
  }

  const accessToken = jwt.sign({ userSeq: row.userSeq }, "secret");
  return accessToken;
};

module.exports = UserService;
