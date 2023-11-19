module.exports = ({ postRepository: repository, statusCodes }) => {
  return Object.freeze({
    postPost,
    getPostList,
    getPost,
    putPost,
    deletePost,
  });

  async function postPost({ postTitle, postContent, userSeq }) {
    await repository.insertPost({
      postTitle,
      postContent,
      userSeq,
    });

    return Promise.resolve(statusCodes.CREATED);
  }

  async function getPostList({ limit, pageSeq }) {
    const [{ postListCount }] = await repository.selectPostListCount();
    const lastPageSeq = Math.ceil(postListCount / limit);

    if (pageSeq > lastPageSeq) {
      const err = new Error("유효하지 않은 페이지 일련번호 입니다.");
      err.status = statusCodes.BAD_REQUEST;
      return Promise.reject(err);
    }

    const offset = (pageSeq - 1) * limit;
    const rows = await repository.selectPostListPaging({ limit, offset });

    return Promise.resolve({
      totalCount: postListCount,
      result: rows,
    });
  }

  async function getPost(postSeq) {
    const getSubPostSeqs = async (postSeq) => {
      const rows = await repository.selectSubPostSeqs(postSeq);
      return rows.map((row) => row.postSeq);
    };

    const getBreadcrumbs = async (postSeq) => {
      const [_, ...rows] = await repository.selectParentPostSeq(postSeq);
      return rows.map((row) => row.postSeq).reverse();
    };

    const [row] = await repository.selectPost(postSeq);

    if (!row) {
      const err = new Error("유효하지 않은 게시글 일련번호 입니다.");
      err.status = statusCodes.BAD_REQUEST;
      return Promise.reject(err);
    }

    const { userSeq: _, ...result } = row;
    const [subPostSeqs, breadcrumbs] = await Promise.all([
      getSubPostSeqs(postSeq),
      getBreadcrumbs(postSeq),
    ]);

    return Promise.resolve({
      ...result,
      subPostSeqs,
      breadcrumbs: { depth: breadcrumbs.length, result: breadcrumbs },
    });
  }

  async function putPost({ postSeq, userSeq, postTitle, postContent }) {
    const [row] = await repository.selectPost(postSeq);

    if (!row) {
      const err = new Error("유효하지 않은 게시글 일련번호 입니다.");
      err.status = statusCodes.BAD_REQUEST;
      return Promise.reject(err);
    }

    if (userSeq !== row.userSeq) {
      const err = new Error("권한이 없습니다.");
      err.status = statusCodes.FORBIDDEN;
      return Promise.reject(err);
    }

    const isNotModified =
      postTitle === row.postTitle && postContent === row.postContent;

    if (isNotModified) {
      return Promise.resolve(statusCodes.NO_CONTENT);
    }

    await repository.updatePost({ postSeq, userSeq, postTitle, postContent });

    return Promise.resolve(statusCodes.CREATED);
  }

  async function deletePost({ postSeq, userSeq }) {
    const [row] = await repository.selectPost(postSeq);

    if (!row) {
      const err = new Error("유효하지 않은 게시글 일련번호 입니다.");
      err.status = statusCodes.BAD_REQUEST;
      return Promise.reject(err);
    }

    if (userSeq !== row.userSeq) {
      const err = new Error("권한이 없습니다.");
      err.status = statusCodes.FORBIDDEN;
      return Promise.reject(err);
    }

    await repository.deletePost({ postSeq, userSeq });

    return Promise.resolve(statusCodes.NO_CONTENT);
  }
};
