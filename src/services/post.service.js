const PostRepository = require("../repositories/post.repository");
const { isAllSettled } = require("../../utils");

function PostService() {
  this.repository = new PostRepository();
}

PostService.prototype.postPost = async function (params) {
  const { insertId } = await this.repository.insertPost(params);

  return {
    status: 201,
    meta: {
      postSeq: insertId,
    },
  };
};

PostService.prototype.getPosts = async function (params) {
  const offset = params.limit * (params.page - 1);
  const rows = await this.repository.selectPosts({ ...params, offset });

  if (!rows.length) {
    let error = new Error("게시글이 존재하지 않습니다.");
    error.status = 404;
    throw error;
  }

  const [row] = await this.repository.selectPostsCount();

  return {
    meta: {
      totalSize: row.totalSize,
      size: rows.length,
    },
    data: rows,
  };
};

PostService.prototype.getPost = async function (postSeq) {
  const [row] = await this.repository.selectPost({ postSeq });

  if (!row) {
    let error = new Error(
      `요청하신 게시글 일련번호 (${postSeq}) 의 게시글이 존재하지 않습니다.`
    );
    error.status = 400;
    throw error;
  }

  const [supers, subs] = await Promise.all([
    this.repository.selectSupers(postSeq),
    this.repository.selectSubs(postSeq),
  ]);

  const superSeqs = supers.map((each) => each.postSeq);
  const subSeqs = subs.map((each) => each.postSeq);

  return {
    meta: {
      superSeqsSize: superSeqs.length,
      subSeqssSize: subSeqs.length,
    },
    data: {
      post: row,
      superSeqs,
      subSeqs,
    },
  };
};

PostService.prototype.putPost = async function (params) {
  const [row] = await this.repository.selectPost(params);

  if (!row) {
    let error = new Error(
      `요청하신 게시글 일련번호 (${params.postSeq}) 의 접근이 유효하지 않습니다.`
    );
    error.status = 403;
    throw error;
  }

  await this.repository.updatePost(params);

  return 201;
};

PostService.prototype.deletePost = async function (params) {
  const [row] = await this.repository.selectPost(params);

  if (!row) {
    let error = new Error(
      `요청하신 게시글 일련번호 (${params.postSeq}) 의 접근이 유효하지 않습니다.`
    );
    error.status = 403;
    throw error;
  }

  const results = await Promise.allSettled([
    this.repository.deletePost(params),
    this.repository.deletePostHasClosure(params.postSeq),
  ]);

  if (!isAllSettled(results)) {
    const rejectedResults = results.filter(
      (result) => result.status === "rejected"
    );

    throw new Error(
      `${rejectedResults.length} 개의 I/O 처리가 실패하였습니다.`
    );
  }

  return 204;
};

module.exports = PostService;
