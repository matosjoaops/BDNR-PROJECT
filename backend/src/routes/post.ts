import express from "express"
import controller from "../controller/post.controller"

const router = express.Router()

router.get("/:limit", controller.get)

export default router
