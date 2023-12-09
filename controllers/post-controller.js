const path = require("path");
const fileName = path.basename(__filename, ".js");

module.exports = ({ postUsecase: usecase, logger }) => {
  return Object.freeze({
    postPost,
    getPostList,
    getPost,
    putPost,
    deletePost,
  });

  async function postPost(req, res) {
    const { postTitle, postContent } = req.body;
    const { userSeq } = req.decodedToken;

    try {
      const status = await usecase.postPost({
        postTitle,
        postContent,
        userSeq,
      });

      const message = "새로운 게시글 생성이 완료되었습니다.";
      res.status(status);
      res.json({ message });
    } catch (err) {
      logger.warn(`[${fileName}] ${err.message}`);

      res.status(err.status);
      res.json({ message: err.message });
    }
  }

  async function getPostList(req, res) {
    const { limit, pageSeq } = req.query;

    try {
      const { totalCount, result } = await usecase.getPostList({
        limit,
        pageSeq,
      });

      const message = "게시글 목록 조회가 완료되었습니다.";
      res.json({
        message,
        meta: {
          totalCount,
          curPageCount: result.length,
          limit,
          pageSeq,
        },
        result,
      });
    } catch (err) {
      logger.warn(`[${fileName}] ${err.message}`);

      res.status(err.status);
      res.json({ message: err.message });
    }
  }

  async function getPost(req, res) {
    const { postSeq } = req.params;
    const prevPost = req.prevPost;

    try {
      const result = await usecase.getPost({ postSeq, prevPost });

      const message = "특정 게시글 조회가 완료되었습니다.";
      res.json({ message, result });
    } catch (err) {
      logger.warn(`[${fileName}] ${err.message}`);

      res.status(err.status);
      res.json({ message: err.message });
    }
  }

  async function putPost(req, res) {
    const { postSeq } = req.params;
    const { userSeq } = req.decodedToken;
    const { postTitle, postContent } = req.body;
    const prevPost = req.prevPost;

    try {
      const status = await usecase.putPost({
        postSeq,
        userSeq,
        postTitle,
        postContent,
        prevPost,
      });

      const message = "특정 게시글 수정이 완료되었습니다.";
      res.status(status);
      res.json({ message });
    } catch (err) {
      logger.warn(`[${fileName}] ${err.message}`);

      res.status(err.status);
      res.json({ message: err.message });
    }
  }

  async function deletePost(req, res) {
    const { postSeq } = req.params;
    const { userSeq } = req.decodedToken;
    const prevPost = req.prevPost;

    try {
      const status = await usecase.deletePost({ postSeq, userSeq, prevPost });

      const message = "특정 게시글 삭제가 완료되었습니다.";
      res.status(status);
      res.json({ message });
    } catch (err) {
      logger.warn(`[${fileName}] ${err.message}`);

      res.status(err.status);
      res.json({ message: err.message });
    }
  }
};
