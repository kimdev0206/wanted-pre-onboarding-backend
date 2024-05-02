const request = require("supertest");
const { faker } = require("@faker-js/faker");
const App = require("../src/app");

const app = new App();
const path = "/api/posts";
const email = faker.internet.email();
let cookie;
let otherCookie;
let postSeq;

beforeAll(async () => {
  const otherEmail = faker.internet.email();
  const password = faker.internet.password({ length: 8 });

  const [signUpResponse] = await Promise.all([
    request(app).post("/api/users/sign-up").send({ email, password }),
    request(app)
      .post("/api/users/sign-up")
      .send({ email: otherEmail, password }),
  ]);

  expect(signUpResponse.status).toBe(201);

  var [logInResponse, otherResponse] = await Promise.all([
    request(app).post("/api/users/log-in").send({ email, password }),
    request(app)
      .post("/api/users/log-in")
      .send({ email: otherEmail, password }),
  ]);

  [cookie] = logInResponse.get("Set-Cookie");
  [otherCookie] = otherResponse.get("Set-Cookie");

  expect(logInResponse.status).toBe(200);
  expect(cookie).toBeTruthy();
});

afterAll(async () => {
  const UserRepository = require("../src/repositories/user.repository");
  const database = require("../src/database");

  const repository = new UserRepository();
  await repository.deleteUser(email);

  await database.pool.end();
});

describe("과제 3. 새로운 게시글을 생성하는 엔드포인트", () => {
  test("새로운 게시글 생성", async () => {
    const res = await request(app).post(path).set("Cookie", cookie).send({
      title: faker.person.jobTitle(),
      content: faker.lorem.text(),
    });

    expect(res.status).toBe(201);

    postSeq = res.body.meta.postSeq;
  });
});

describe("과제 4. 게시글 목록을 조회하는 엔드포인트", () => {
  test("게시글 목록 전체 조회", async () => {
    const res = await request(app).get(path);

    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test("게시글 목록 부분 조회", async () => {
    const res = await request(app).get(path).query({ limit: 10, page: 1 });

    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe("과제 5. 특정 게시글을 조회하는 엔드포인트", () => {
  test("특정 게시글 조회", async () => {
    const res = await request(app).get(path + `/${postSeq}`);

    expect(res.body.data.post).toHaveProperty("title");
  });

  test("존재하지 않는 게시글", async () => {
    const res = await request(app).get(path + "/1");

    expect(res.status).toBe(400);
  });
});

describe("과제 6. 특정 게시글을 수정하는 엔드포인트", () => {
  test("특정 게시글 수정", async () => {
    const res = await request(app)
      .put(path + `/${postSeq}`)
      .set("Cookie", cookie)
      .send({
        title: faker.person.jobTitle(),
        content: faker.lorem.text(),
      });

    expect(res.status).toBe(201);
  });

  test("유효하지 않은 게시글 접근", async () => {
    const res = await request(app)
      .put(path + `/${postSeq}`)
      .set("Cookie", otherCookie)
      .send({
        title: faker.person.jobTitle(),
        content: faker.lorem.text(),
      });

    expect(res.status).toBe(403);
  });
});

describe("과제 7. 특정 게시글을 삭제하는 엔드포인트", () => {
  test("특정 게시글 삭제", async () => {
    const res = await request(app)
      .delete(path + `/${postSeq}`)
      .set("Cookie", cookie);

    expect(res.status).toBe(204);
  });

  test("유효하지 않은 게시글 접근", async () => {
    const res = await request(app)
      .delete(path + `/${postSeq}`)
      .set("Cookie", otherCookie);

    expect(res.status).toBe(403);
  });
});
