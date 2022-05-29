import express from "express"
import controller from "../controller/user.controller"

const router = express.Router()

// router.get("/commented-and-liked-post", controller.getUsersThatCommentedAndLikedPost)
router.get("/:id/posts", controller.getUserPosts)
router.get("/:id", controller.get)
router.post("/", controller.post)
router.put("/:id", controller.put)
router.delete("/:id", controller.delete)

export default router
