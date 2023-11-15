const request = require("supertest");
const { faker } = require("@faker-js/faker");
const { StatusCodes } = require("http-status-codes");

require("dotenv").config();
const app = require("../apps")();
const database = require("../apps/database");
const makeUserRepository = require("../repositories/user-repository");

let userEmail, password;

beforeAll(() => {
  userEmail = faker.internet.email();
  password = faker.internet.password({ length: 8 });
});

afterAll((done) => {
  const repository = makeUserRepository(database);
  repository.deleteUser(userEmail).then(done);
});

describe("과제 1. 사용자 회원가입 엔드포인트 테스트", () => {
  test("사용자 회원가입", (done) => {
    request(app)
      .post("/user/sign-up")
      .send({
        userEmail,
        password,
      })
      .expect(StatusCodes.CREATED, done);
  });

  test("사용자 회원가입 (유효하지 않은 이메일 형식)", (done) => {
    request(app)
      .post("/user/sign-up")
      .send({
        userEmail: faker.lorem.word(),
        password,
      })
      .expect(StatusCodes.BAD_REQUEST, done);
  });

  test("사용자 회원가입 (유효하지 않은 비밀번호 형식)", (done) => {
    request(app)
      .post("/user/sign-up")
      .send({
        userEmail,
        password: faker.internet.password({ length: 7 }),
      })
      .expect(StatusCodes.BAD_REQUEST, done);
  });

  test("사용자 회원가입 (중복된 이메일)", (done) => {
    request(app)
      .post("/user/sign-up")
      .send({
        userEmail,
        password,
      })
      .expect(StatusCodes.UNAUTHORIZED, done);
  });
});

describe("과제 2. 사용자 로그인 엔드포인트", () => {
  test("사용자 로그인", (done) => {
    request(app)
      .patch("/user/log-in")
      .send({
        userEmail,
        password,
      })
      .end(done);
  });

  test("사용자 로그인 (유효하지 않은 이메일 형식)", (done) => {
    request(app)
      .patch("/user/log-in")
      .send({
        userEmail: faker.lorem.word(),
        password,
      })
      .expect(StatusCodes.BAD_REQUEST, done);
  });

  test("사용자 로그인 (유효하지 않은 비밀번호 형식)", (done) => {
    request(app)
      .patch("/user/log-in")
      .send({
        userEmail,
        password: faker.internet.password({ length: 7 }),
      })
      .expect(StatusCodes.BAD_REQUEST, done);
  });

  test("사용자 로그인 (가입되지 않은 이메일)", (done) => {
    request(app)
      .patch("/user/log-in")
      .send({
        userEmail: faker.internet.email(),
        password,
      })
      .expect(StatusCodes.UNAUTHORIZED, done);
  });

  test("사용자 로그인 (유효하지 않은 비밀번호)", (done) => {
    request(app)
      .patch("/user/log-in")
      .send({
        userEmail,
        password: faker.internet.password({ length: 8 }),
      })
      .expect(StatusCodes.UNAUTHORIZED, done);
  });
});
