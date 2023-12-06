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

afterAll(() => database.close());

describe("부모 게시글 일련번호 수정", () => {
  const postSeqs = [2, 11];
  const newSuperSeq = 11;

  beforeEach(async () => {
    const promises = postSeqs.map((postSeq, idx) =>
      repository.insertPostWithSeq({
        postSeq,
        superSeq: postSeqs[idx - 1],
        postTitle: faker.person.jobTitle(),
        postContent: faker.lorem.text(),
        userSeq,
      })
    );

    await Promise.allSettled(promises);
  });

  afterEach(async () => {
    const recoverPost = usecase.putBreadcrumbs({
      postSeq,
      userSeq,
      superSeq,
    });

    const deletePosts = postSeqs.map((postSeq) =>
      repository.deletePost({
        postSeq,
        userSeq,
      })
    );

    await Promise.allSettled([recoverPost, ...deletePosts]);
  });

  /**
   * prev: null ← 1 ← 10 ← 21
   * next: null ← 2 ← 11 ← 21
   */
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

  /**
   * prev: null ← 1 ← 10 ← 21 ← 32
   * next: null ← 1 ← 10 ← 32
   */
  test("게시글 삭제 후, 부모 게시글과 손자 게시글 계층 연결", async () => {
    const status = await usecase.deleteBreadcrumbs({ postSeq, userSeq });

    expect(status).to.equal(statusCodes.NO_CONTENT);
  });
});
