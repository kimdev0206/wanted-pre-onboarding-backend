module.exports = ({ postController: controller, express, verifyToken }) => {
  const router = express.Router();

  // 과제 3. 새로운 게시글을 생성하는 엔드포인트
  router.post("/", verifyToken, controller.postPost);

  // 과제 4. 게시글 목록을 조회하는 엔드포인트
  router.get("/list", controller.getPostList);

  // 과제 5. 특정 게시글을 조회하는 엔드포인트
  router.get("/:postSeq", controller.getPost);

  // 과제 6. 특정 게시글을 수정하는 엔드포인트
  router.put("/:postSeq", verifyToken, controller.putPost);

  // 과제 7. 특정 게시글을 삭제하는 엔드포인트
  router.delete("/:postSeq", verifyToken, controller.deletePost);

  return router;
};