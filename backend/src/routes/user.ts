import express from "express"
import controller from "../controller/user.controller"

const router = express.Router()

router.get("/:id/posts", controller.getUserPosts)
router.get("/:id", controller.get)
router.post("/", controller.post)
router.put("/:id", controller.put)
router.delete("/:id", controller.delete)
router.patch("/:id/follow", controller.follow)

export default router
