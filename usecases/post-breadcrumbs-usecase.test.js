const { expect } = require("chai");
const { faker } = require("@faker-js/faker");
const { StatusCodes: statusCodes } = require("http-status-codes");

require("dotenv").config();
const database = require("../apps/database");
const { postUsecase: usecase } = require("./");
const { postRepository: repository } = require("../repositories");

const userSeq = +process.env.TEST_USER_SEQ;
const postSeq = 21;
const superSeq = 10;

afterAll(async () => await database.close());

describe("부모 게시글 일련번호 수정", () => {
  const newSuperSeq = 11;

  beforeEach(async () => {
    await repository.insertPostWithSeq({
      postSeq: newSuperSeq,
      superSeq: 1,
      postTitle: faker.person.jobTitle(),
      postContent: faker.lorem.text(),
      userSeq,
    });
  });

  afterEach(async () => {
    const recoverPost = usecase.putBreadcrumbs({
      postSeq,
      userSeq,
      superSeq,
    });

    const deletePost = repository.deletePost({
      postSeq: newSuperSeq,
      userSeq,
    });

    await Promise.allSettled([recoverPost, deletePost]);
  });

  test("부모 게시글 일련번호 수정", async () => {
    const status = await usecase.putBreadcrumbs({
      postSeq,
      userSeq,
      superSeq: newSuperSeq,
    });

    expect(status).to.equal(statusCodes.CREATED);
  });

  test("부모 게시글 일련번호 수정 (변경된 요소 존재하지 않음)", async () => {
    const status = await usecase.putBreadcrumbs({
      postSeq,
      userSeq,
      superSeq,
    });

    expect(status).to.equal(statusCodes.NO_CONTENT);
  });
});

describe("게시글 삭제 후, 부모 게시글과 손자 게시글 계층 연결", () => {
  let postTitle, postContent;

  beforeEach(async () => {
    ({ postTitle, postContent } = await usecase.getPost(postSeq));
  });

  afterEach(async () => {
    const subSeq = 32;
    const postSeqs = [superSeq, postSeq, subSeq];

    const recoverPost = repository.insertPostWithSeq({
      postSeq,
      superSeq,
      postTitle,
      postContent,
      userSeq,
    });

    const updatePosts = [];

    for (let i = 1; i < postSeqs.length; i++) {
      const postSeq = postSeqs[i];
      const superSeq = postSeqs[i - 1];

      updatePosts.push(
        repository.updateSuperTree({
          postSeq,
          userSeq,
          superSeq,
        })
      );
    }

    await Promise.allSettled([recoverPost, ...updatePosts]);
  });

  test("게시글 삭제 후, 부모 게시글과 손자 게시글 계층 연결", async () => {
    const status = await usecase.deleteBreadcrumbs({ postSeq, userSeq });

    expect(status).to.equal(statusCodes.NO_CONTENT);
  });
});
