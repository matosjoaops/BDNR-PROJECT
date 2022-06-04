import express from "express"
import controller from "../controller/post.controller"

const router = express.Router()

router.get("/user-liked/:userId", controller.getUserLikedPosts)
router.get("/post-type-distribution", controller.getPostTypeDistribution)
router.get("/item-type-distribution", controller.getItemTypeDistribution)

router.get("/ratio", controller.getRatio)
router.get("/:id", controller.get)
router.get("/", controller.getPosts)
router.post("/", controller.post)
router.put("/:id", controller.put)
router.delete("/:id", controller.delete)
router.post("/:postId/like", controller.likePost)
router.delete("/:postId/like", controller.removeLikePost)

// Comments
router.get("/:postId/comments", controller.getComments)
router.post("/:postId/comments", controller.postComment)
router.patch("/:postId/comments/:commentId", controller.updateComment)
router.delete("/:postId/comments/:commentId", controller.deleteComment)



export default router
