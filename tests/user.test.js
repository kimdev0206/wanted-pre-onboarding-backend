const request = require("supertest");
const { faker } = require("@faker-js/faker");
const App = require("../src/app");

const app = new App();
const email = faker.internet.email();
const password = faker.internet.password({ length: 8 });

afterAll(async () => {
  const UserRepository = require("../src/repositories/user.repository");
  const database = require("../src/database");

  const repository = new UserRepository();
  await repository.deleteUser(email);

  await database.pool.end();
});

describe("과제 1. 사용자 회원가입 엔드포인트 테스트", () => {
  const path = "/api/users/sign-up";

  test("사용자 회원가입", async () => {
    const res = await request(app).post(path).send({ email, password });

    expect(res.status).toBe(201);
  });

  test("유효하지 않은 이메일", async () => {
    const res = await request(app).post(path).send({ email, password });

    expect(res.status).toBe(409);
  });

  test("유효하지 않은 형식의 이메일", async () => {
    const res = await request(app)
      .post(path)
      .send({ email: faker.lorem.word(), password });

    expect(res.status).toBe(400);
  });
});

describe("과제 2. 사용자 로그인 엔드포인트", () => {
  const path = "/api/users/log-in";

  test("사용자 로그인", async () => {
    const res = await request(app).post(path).send({ email, password });
    const accessToken = res.headers["set-cookie"];

    expect(res.status).toBe(200);
    expect(accessToken).toBeTruthy();
  });

  test("유효하지 않은 이메일", async () => {
    const res = await request(app).post(path).send({
      email: faker.internet.email(),
      password,
    });

    expect(res.status).toBe(400);
  });

  test("유효하지 않은 비밀번호", async () => {
    const res = await request(app)
      .post(path)
      .send({
        email,
        password: faker.internet.password({ length: 8 }),
      });

    expect(res.status).toBe(400);
  });

  test("유효하지 않은 형식의 비밀번호", async () => {
    const res = await request(app)
      .post(path)
      .send({
        email,
        password: faker.internet.password({ length: 7 }),
      });

    expect(res.status).toBe(400);
  });
});
