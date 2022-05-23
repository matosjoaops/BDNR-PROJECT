import express from "express"
import controller from "../controller/post.controller"

const router = express.Router()

router.get("/ratio", controller.getRatio)
router.get("/:id", controller.get)
router.post("/", controller.post)
router.put("/:id", controller.put)
router.delete("/:id", controller.delete)

// Comments
router.get("/comments/:postId", controller.getComments)
router.post("/comments", controller.postComment)
router.put("/comments", controller.updateComment)
router.delete("/comments", controller.deleteComment)



export default router
