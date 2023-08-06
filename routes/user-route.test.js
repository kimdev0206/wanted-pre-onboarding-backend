const request = require("supertest");
const { faker } = require("@faker-js/faker");
const { StatusCodes: statusCodes } = require("http-status-codes");
const app = require("../apps")();

const userEmail = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_PASSWORD;

beforeAll(() => require("../apps/database"));

describe("과제 1. 사용자 회원가입 엔드포인트 테스트", () => {
  test("사용자 회원가입", (done) => {
    request(app)
      .post("/user/sign-up")
      .send({
        userEmail: faker.internet.email(),
        password: faker.internet.password({ length: 8 }),
      })
      .expect(statusCodes.CREATED, done);
  });

  test("사용자 회원가입 (유효하지 않은 이메일 형식)", (done) => {
    request(app)
      .post("/user/sign-up")
      .send({
        userEmail: faker.lorem.word(),
        password: faker.internet.password({ length: 8 }),
      })
      .expect(statusCodes.BAD_REQUEST, done);
  });

  test("사용자 회원가입 (유효하지 않은 비밀번호 형식)", (done) => {
    request(app)
      .post("/user/sign-up")
      .send({
        userEmail: faker.internet.email(),
        password: faker.internet.password({ length: 7 }),
      })
      .expect(statusCodes.BAD_REQUEST, done);
  });

  test("사용자 회원가입 (중복된 이메일)", (done) => {
    request(app)
      .post("/user/sign-up")
      .send({
        userEmail: faker.internet.email(),
        password: faker.internet.password({ length: 8 }),
      })
      .expect(statusCodes.UNAUTHORIZED, done);
  });

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
        userEmail,
        password,
      })
      .expect(statusCodes.BAD_REQUEST, done);
  });

  test("사용자 로그인 (유효하지 않은 비밀번호 형식)", (done) => {
    request(app)
      .patch("/user/log-in")
      .send({
        userEmail,
        password,
      })
      .expect(statusCodes.BAD_REQUEST, done);
  });

  test("사용자 로그인 (가입되지 않은 이메일)", (done) => {
    request(app)
      .patch("/user/log-in")
      .send({
        userEmail,
        password,
      })
      .expect(statusCodes.UNAUTHORIZED, done);
  });

  test("사용자 로그인 (유효하지 않은 비밀번호)", (done) => {
    request(app)
      .patch("/user/log-in")
      .send({
        userEmail,
        password,
      })
      .expect(statusCodes.UNAUTHORIZED, done);
  });
});
