const request = require("supertest");
const { faker } = require("@faker-js/faker");
const { StatusCodes: statusCodes } = require("http-status-codes");
const app = require("../apps")();

const userEmail = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_PASSWORD;

beforeAll(() => require("../apps/database"));

describe("과제 3. 새로운 게시글을 생성하는 엔드포인트", () => {
  const agent = request.agent(app);

  beforeEach((done) => {
    agent
      .patch("/user/log-in")
      .send({
        userEmail,
        password,
      })
      .end(done);
  });

  test("새로운 게시글 생성", (done) => {
    agent
      .post("/post")
      .send({
        postTite: faker.person.jobTitle(),
        postContent: faker.lorem.text(),
      })
      .expect(statusCodes.CREATED, done);
  });
});
