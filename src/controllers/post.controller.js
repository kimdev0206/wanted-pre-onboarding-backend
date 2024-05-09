const path = require("node:path");
const { Router } = require("express");
const { verifyAccessToken } = require("../middlewares");
const PostService = require("../services/post.service");
const { perfTime } = require("../../utils");

function PostController() {
  this.service = new PostService();

  const router = Router();
  this.initRoutes(router);

  return {
    router,
  };
}

PostController.prototype.initRoutes = function (router) {
  const path = "/posts";

  // 과제 3. 새로운 게시글을 생성하는 엔드포인트
  router.post(path, verifyAccessToken, this.postPost.bind(this));

  // 과제 4. 게시글 목록을 조회하는 엔드포인트
  router.get(path, this.getPosts.bind(this));

  // 과제 5. 특정 게시글을 조회하는 엔드포인트
  router.get(`${path}/:postSeq`, this.getPost.bind(this));

  // 과제 6. 특정 게시글을 수정하는 엔드포인트
  router.put(`${path}/:postSeq`, verifyAccessToken, this.putPost.bind(this));

  // 과제 7. 특정 게시글을 삭제하는 엔드포인트
  router.delete(
    `${path}/:postSeq`,
    verifyAccessToken,
    this.deletePost.bind(this)
  );
};

PostController.prototype.postPost = async function (req, res, next) {
  try {
    const { userSeq } = req.decodedToken;
    const { title, content } = req.body;

    const params = { userSeq, title, content };
    const { status, meta } = await this.service.postPost(params);

    res.status(status);
    res.json({
      meta,
      message: "게시글이 생성 되었습니다.",
    });
  } catch (error) {
    next(error);
  }
};

PostController.prototype.getPosts = async function (req, res, next) {
  try {
    const { limit, page } = req.query;

    const params = { limit: Number(limit), page };
    const { meta, data } = await this.service.getPosts(params);

    res.json({
      meta,
      data,
    });
  } catch (error) {
    next(error);
  }
};

PostController.prototype.getPost = perfTime(async function (req, res, next) {
  try {
    const { postSeq } = req.params;
    const { meta, data } = await this.service.getPost(postSeq);

    res.json({
      meta,
      data,
    });
  } catch (error) {
    next(error);
  }
}, `${path.basename(__filename)} getPost`);

PostController.prototype.putPost = async function (req, res, next) {
  try {
    const { userSeq } = req.decodedToken;
    const { postSeq } = req.params;
    const { title, content } = req.body;
    const prevPost = req.prevPost;

    const params = { userSeq, postSeq, title, content, prevPost };
    const status = await this.service.putPost(params);

    res.status(status);
    res.json({
      message: "게시글이 수정 되었습니다.",
    });
  } catch (error) {
    next(error);
  }
};

PostController.prototype.deletePost = async function (req, res, next) {
  try {
    const { userSeq } = req.decodedToken;
    const { postSeq } = req.params;

    const params = { userSeq, postSeq };
    const status = await this.service.deletePost(params);

    res.status(status);
    res.json({
      message: "게시글이 삭제 되었습니다.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = PostController;
