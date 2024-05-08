const {
  makePostPromise,
  makePostHasClosurePromise,
} = require("../scripts/utils");
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
    await Promise.allSettled([
      makePostPromise({
        userSeq,
        postSeq: newSuperSeq,
      }),
      repository.insertPostHasClosure({
        superSeq: 1,
        subSeq: newSuperSeq,
      }),
    ]);
  });

  afterEach(async () => {
    const supers = await repository.selectSupers(postSeq);
    expect(supers.at(-1).postSeq).toBe(newSuperSeq);

    const results = await Promise.allSettled([
      repository.updateSupers({
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
      superSeq: newSuperSeq,
      postSeq,
    };
    const row = await repository.updateSupers(params);

    expect(row.affectedRows).toBeGreaterThan(0);
  });
});

describe("게시글 삭제 후, 부모 게시글과 손자 게시글 계층 연결", () => {
  let title, content, superSeqs, subSeqs;

  beforeEach(async () => {
    const [posts, supers, subs] = await Promise.all([
      repository.selectPost(postSeq),
      repository.selectSupers(postSeq),
      repository.selectSubs(postSeq),
    ]);

    title = posts.title;
    content = posts.content;
    superSeqs = supers.map((each) => each.postSeq);
    subSeqs = subs.map((each) => each.postSeq);
  });

  afterEach(async () => {
    const params = {
      userSeq,
      postSeq,
      title,
      content,
    };
    const post = makePostPromise(params);

    const supers = superSeqs.map((superSeq) =>
      makePostHasClosurePromise({ superSeq, subSeq: postSeq })
    );
    const subs = subSeqs.map((subSeq) =>
      makePostHasClosurePromise({ superSeq: postSeq, subSeq })
    );

    const results = await Promise.allSettled([post, ...supers, ...subs]);
    expect(isAllSettled(results)).toBe(true);
  });

  test("게시글 삭제 후, 부모 게시글과 손자 게시글 계층 연결", async () => {
    const results = await Promise.allSettled([
      repository.deletePost({ userSeq, postSeq }),
      repository.deletePostHasClosure(postSeq),
    ]);
    expect(isAllSettled(results)).toBe(true);
  });
});
