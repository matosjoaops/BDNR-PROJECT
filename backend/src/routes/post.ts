import express from "express"
import controller from "../controller/post.controller"

const router = express.Router()

router.get("/:id", controller.get)
router.post("/", controller.post)
router.put("/:id", controller.put)
router.delete("/:id", controller.delete)
router.get("/ratio", controller.getRatio)

export default router
