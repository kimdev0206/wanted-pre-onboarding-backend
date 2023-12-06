module.exports = ({ postRepository: repository, statusCodes }) => {
  const getSuperTree = async (postSeq) => {
    const [_, ...rows] = await repository.selectSuperTree(postSeq);
    return rows.map((row) => row.postSeq).reverse();
  };

  const getChild = async (postSeq) => {
    const rows = await repository.selectChild(postSeq);
    return rows.map((row) => row.postSeq);
  };

  return Object.freeze({
    postPost,
    getPostList,
    getPost,
    putPost,
    putBreadcrumbs,
    deletePost,
    deleteBreadcrumbs,
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
    const [row] = await repository.selectPost(postSeq);

    if (!row) {
      const err = new Error("유효하지 않은 게시글 일련번호 입니다.");
      err.status = statusCodes.BAD_REQUEST;
      return Promise.reject(err);
    }

    const { userSeq: _, ...result } = row;
    const [child, superTree] = await Promise.all([
      getChild(postSeq),
      getSuperTree(postSeq),
    ]);

    return Promise.resolve({
      ...result,
      child,
      breadcrumbs: { depth: superTree.length, result: superTree },
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

  async function putBreadcrumbs({ postSeq, userSeq, superSeq }) {
    const [[row], superTree] = await Promise.all([
      repository.selectPost(postSeq),
      getSuperTree(postSeq),
    ]);

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

    const prevSuperSeq = superTree.at(-1);
    const isNotModified = prevSuperSeq === superSeq;

    if (isNotModified) {
      return Promise.resolve(statusCodes.NO_CONTENT);
    }

    await repository.updateSuperTree({ postSeq, userSeq, superSeq });

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

  async function deleteBreadcrumbs({ postSeq, userSeq }) {
    const [[row], superTree, child] = await Promise.all([
      repository.selectPost(postSeq),
      getSuperTree(postSeq),
      getChild(postSeq),
    ]);

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

    const promises = child.map((subSeq) => getSuperTree(subSeq));

    const subSeq = [await Promise.allSettled(promises)].filter(
      (superTree) => (postSeq = superTree.at(-1))
    );
    const superSeq = superTree.at(-1);

    await Promise.allSettled([
      repository.updateSuperTree({ postSeq: subSeq, userSeq, superSeq }),
      repository.deletePost({ postSeq, userSeq }),
    ]);

    return Promise.resolve(statusCodes.NO_CONTENT);
  }
};
