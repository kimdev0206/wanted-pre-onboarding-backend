const request = require("supertest");
const { faker } = require("@faker-js/faker");
const { StatusCodes } = require("http-status-codes");

require("dotenv").config();
const app = require("../apps")();
const limit = 10;

beforeAll(() => require("../apps/database"));

describe("과제 3. 새로운 게시글을 생성하는 엔드포인트", () => {
  const agent = request.agent(app);
  const userEmail = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_PASSWORD;

  let jwtToken = "";

  beforeEach(async () => {
    const res = await agent.patch("/user/log-in").send({
      userEmail,
      password,
    });

    jwtToken = res.headers.authorization.split(" ")[1];
  });

  test("새로운 게시글 생성", async () => {
    const res = await agent
      .post("/post")
      .auth(jwtToken, { type: "bearer" })
      .send({
        postTitle: faker.person.jobTitle(),
        postContent: faker.lorem.text(),
      });

    expect(res.status).toBe(StatusCodes.CREATED);
  });

  test("새로운 게시글 생성 (게시글 제목 누락)", async () => {
    const res = await agent
      .post("/post")
      .auth(jwtToken, { type: "bearer" })
      .send({
        postContent: faker.lorem.text(),
      });

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });

  test("새로운 게시글 생성 (JWT 토큰 만료)", async () => {
    const expiredJWTtoken = process.env.TEST_EXPIRED_JWT_TOKEN;
    const res = await agent
      .post("/post")
      .auth(expiredJWTtoken, { type: "bearer" })
      .send({
        postTitle: faker.person.jobTitle(),
        postContent: faker.lorem.text(),
      });

    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  test("새로운 게시글 생성 (JWT 토큰 누락)", async () => {
    const res = await agent.post("/post").send({
      postTitle: faker.person.jobTitle(),
      postContent: faker.lorem.text(),
    });

    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
  });
});

describe("과제 4. 게시글 목록을 조회하는 엔드포인트", () => {
  let lastPageSeq = 0;

  test("게시글 목록 조회 (첫 페이지)", async () => {
    const res = await request(app).get(`/post/list?limit=${limit}&pageSeq=1`);

    expect(res.body.result).toBeInstanceOf(Array);
    expect(res.body.result.length).toBeGreaterThan(0);

    lastPageSeq = Math.ceil(res.body.meta.totalCount / limit);
  });

  test("게시글 목록 조회 (마지막 페이지)", async () => {
    const res = await request(app).get(
      `/post/list?limit=${limit}&pageSeq=${lastPageSeq}`
    );

    expect(res.body.result).toBeInstanceOf(Array);
    expect(res.body.result.length).toBeGreaterThan(0);
  });

  test("게시글 목록 조회 (유효하지 않은 페이지 일련번호)", async () => {
    const res = await request(app).get(
      `/post/list?limit=${limit}&pageSeq=${lastPageSeq + 1}`
    );

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });
});

describe("과제 5. 특정 게시글을 조회하는 엔드포인트", () => {
  test("특정 게시글 조회", async () => {
    const validPostSeq = 1;
    const res = await request(app).get(`/post/${validPostSeq}`);

    expect(res.body.result).toHaveProperty("postTitle");
  });

  test("특정 게시글 조회 (유효하지 않은 게시글 일련번호)", async () => {
    const invalidPostSeq = Number.MAX_SAFE_INTEGER;
    const res = await request(app).get(`/post/${invalidPostSeq}`);

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });

  test("특정 게시글 조회 (유효하지 않은 게시글 일련번호 형식)", async () => {
    const invalidPostSeq = faker.lorem.word();
    const res = await request(app).get(`/post/${invalidPostSeq}`);

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });
});

describe("과제 6. 특정 게시글을 수정하는 엔드포인트", () => {
  const agent = request.agent(app);
  const userEmail = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_PASSWORD;

  let jwtToken = "";
  let existPostSeq = 0;

  beforeEach(async () => {
    const [userRes, postRes] = await Promise.all([
      agent.patch("/user/log-in").send({
        userEmail,
        password,
      }),
      agent.get(`/post/list?limit=${limit}&pageSeq=1`),
    ]);

    expect(postRes.body.result[0].userEmail).toBe(userEmail);

    jwtToken = userRes.headers.authorization.split(" ")[1];
    existPostSeq = postRes.body.result[0].postSeq;
  });

  test("특정 게시글 수정", async () => {
    const res = await agent
      .put(`/post/${existPostSeq}`)
      .auth(jwtToken, { type: "bearer" })
      .send({
        postTitle: faker.person.jobTitle(),
        postContent: faker.lorem.text(),
      });

    expect(res.status).toBe(StatusCodes.CREATED);
  });

  test("특정 게시글 수정 (수정된 데이터 없음)", async () => {
    const getPostRes = await agent.get(`/post/${existPostSeq}`);
    let {
      postTitle,
      postContent,
      userEmail: existUserEmail,
    } = getPostRes.body.result;

    expect(existUserEmail).toBe(userEmail);

    const putPostRes = await agent
      .put(`/post/${existPostSeq}`)
      .auth(jwtToken, { type: "bearer" })
      .send({
        postTitle,
        postContent,
      });

    expect(putPostRes.status).toBe(StatusCodes.NO_CONTENT);
  });

  test("특정 게시글 수정 (유효하지 않은 게시글 일련번호)", async () => {
    const invalidPostSeq = Number.MAX_SAFE_INTEGER;
    const res = await agent
      .put(`/post/${invalidPostSeq}`)
      .auth(jwtToken, { type: "bearer" })
      .send({
        postTitle: faker.person.jobTitle(),
        postContent: faker.lorem.text(),
      });

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });

  test("특정 게시글 수정 (유효하지 않은 게시글 일련번호 형식)", async () => {
    const invalidPostSeq = faker.lorem.word();
    const res = await agent
      .put(`/post/${invalidPostSeq}`)
      .auth(jwtToken, { type: "bearer" })
      .send({
        postTitle: faker.person.jobTitle(),
        postContent: faker.lorem.text(),
      });

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });

  test("특정 게시글 수정 (게시글 제목 누락)", async () => {
    const res = await agent
      .put(`/post/${existPostSeq}`)
      .auth(jwtToken, { type: "bearer" })
      .send({
        postContent: faker.lorem.text(),
      });

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });

  test("특정 게시글 수정 (게시글 제목 누락)", async () => {
    const res = await agent
      .put(`/post/${existPostSeq}`)
      .auth(jwtToken, { type: "bearer" })
      .send({
        postTitle: "",
        postContent: faker.lorem.text(),
      });

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });

  test("특정 게시글 수정 (JWT 토큰 만료)", async () => {
    const expiredJWTtoken = process.env.TEST_EXPIRED_JWT_TOKEN;
    const res = await agent
      .put(`/post/${existPostSeq}`)
      .auth(expiredJWTtoken, { type: "bearer" })
      .send({
        postTitle: faker.person.jobTitle(),
        postContent: faker.lorem.text(),
      });

    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  test("특정 게시글 수정 (JWT 토큰 누락)", async () => {
    const res = await agent.put(`/post/${existPostSeq}`).send({
      postTitle: faker.person.jobTitle(),
      postContent: faker.lorem.text(),
    });

    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  test("특정 게시글 수정 (권한 없음)", async () => {
    const unexpiredJWTtoken = process.env.TEST_UNEXPIRED_JWT_TOKEN;
    const res = await agent
      .put(`/post/${existPostSeq}`)
      .auth(unexpiredJWTtoken, { type: "bearer" })
      .send({
        postTitle: faker.person.jobTitle(),
        postContent: faker.lorem.text(),
      });

    expect(res.status).toBe(StatusCodes.FORBIDDEN);
  });
});

describe("과제 7. 특정 게시글을 삭제하는 엔드포인트", () => {
  const agent = request.agent(app);
  const userEmail = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_PASSWORD;

  let jwtToken = "";
  let existPostSeq = 0;

  beforeEach(async () => {
    const [userRes, postRes] = await Promise.all([
      agent.patch("/user/log-in").send({
        userEmail,
        password,
      }),
      agent.get(`/post/list?limit=${limit}&pageSeq=1`),
    ]);

    expect(postRes.body.result[0].userEmail).toBe(userEmail);

    jwtToken = userRes.headers.authorization.split(" ")[1];
    existPostSeq = postRes.body.result[0].postSeq;
  });

  test("특정 게시글 삭제", async () => {
    const res = await agent
      .delete(`/post/${existPostSeq}`)
      .auth(jwtToken, { type: "bearer" });

    expect(res.status).toBe(StatusCodes.NO_CONTENT);
  });

  test("특정 게시글 삭제 (유효하지 않은 게시글 일련번호)", async () => {
    const invalidPostSeq = Number.MAX_SAFE_INTEGER;
    const res = await agent
      .delete(`/post/${invalidPostSeq}`)
      .auth(jwtToken, { type: "bearer" });

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });

  test("특정 게시글 삭제 (유효하지 않은 게시글 일련번호 형식)", async () => {
    const invalidPostSeq = faker.lorem.word();
    const res = await agent
      .delete(`/post/${invalidPostSeq}`)
      .auth(jwtToken, { type: "bearer" });

    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });

  test("특정 게시글 삭제 (JWT 토큰 만료)", async () => {
    const expiredJWTtoken = process.env.TEST_EXPIRED_JWT_TOKEN;
    const res = await agent
      .delete(`/post/${existPostSeq}`)
      .auth(expiredJWTtoken, { type: "bearer" });

    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  test("특정 게시글 삭제 (JWT 토큰 누락)", async () => {
    const res = await agent.delete(`/post/${existPostSeq}`);

    expect(res.status).toBe(StatusCodes.UNAUTHORIZED);
  });

  test("특정 게시글 삭제 (권한 없음)", async () => {
    const unexpiredJWTtoken = process.env.TEST_UNEXPIRED_JWT_TOKEN;
    const res = await agent
      .delete(`/post/${existPostSeq}`)
      .auth(unexpiredJWTtoken, { type: "bearer" });

    expect(res.status).toBe(StatusCodes.FORBIDDEN);
  });
});
