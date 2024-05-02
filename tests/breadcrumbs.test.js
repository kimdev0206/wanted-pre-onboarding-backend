const { makePostPromise } = require("../scripts/utils");
const PostRepository = require("../src/repositories/post.repository");
const database = require("../src/database");
const { isAllSettled } = require("../utils");

const repository = new PostRepository();

// NOTE: 변경 가능합니다.
const userSeq = 1;
const prevSuperSeq = 10;
const newSuperSeq = 11;
const postSeq = 21;

afterAll(async () => await database.pool.end());

describe("부모 게시글 일련번호 수정", () => {
  beforeEach(async () => {
    const params = {
      userSeq,
      superSeq: 1,
      postSeq: newSuperSeq,
    };
    await makePostPromise(params);
  });

  afterEach(async () => {
    const supers = await repository.selectSupers(postSeq);
    expect(supers.at(-1).postSeq).toBe(newSuperSeq);

    const results = await Promise.allSettled([
      repository.updateSupers({
        userSeq,
        superSeq: prevSuperSeq,
        postSeq,
      }),
      repository.deletePost({
        userSeq,
        postSeq: newSuperSeq,
      }),
    ]);
    expect(isAllSettled(results)).toBe(true);
  });

  test("부모 게시글 일련번호 수정", async () => {
    const supers = await repository.selectSupers(postSeq);
    expect(supers.at(-1).postSeq).toBe(prevSuperSeq);

    const params = {
      userSeq,
      superSeq: newSuperSeq,
      postSeq,
    };
    const row = await repository.updateSupers(params);

    expect(row.affectedRows).toBeGreaterThan(0);
  });
});

describe("게시글 삭제 후, 부모 게시글과 손자 게시글 계층 연결", () => {
  let title, content;

  beforeEach(async () => {
    const row = await repository.selectPost(postSeq);

    title = row.title;
    content = row.content;
  });

  afterEach(async () => {
    const superSeq = prevSuperSeq;
    const subSeq = 32;
    const postSeqs = [superSeq, postSeq, subSeq];

    const params = {
      userSeq,
      postSeq,
      superSeq,
      title,
      content,
    };
    const post = makePostPromise(params);

    let updatePosts = [];

    for (let i = 1; i < postSeqs.length; i++) {
      const params = {
        userSeq,
        superSeq: postSeqs[i - 1],
        postSeq: postSeqs[i],
      };
      updatePosts.push(repository.updateSupers(params));
    }

    const results = await Promise.allSettled([post, ...updatePosts]);
    expect(isAllSettled(results)).toBe(true);
  });

  test("게시글 삭제 후, 부모 게시글과 손자 게시글 계층 연결", async () => {
    const [supers, subs] = await Promise.all([
      repository.selectSupers(postSeq),
      repository.selectSubs(postSeq),
    ]);

    const updatePosts = subs.map((each) =>
      repository.updateSupers({
        userSeq,
        superSeq: supers.at(-1).postSeq,
        postSeq: each.postSeq,
      })
    );

    const results = await Promise.allSettled([
      ...updatePosts,
      repository.deletePost({
        userSeq,
        postSeq,
      }),
    ]);
    expect(isAllSettled(results)).toBe(true);
  });
});
