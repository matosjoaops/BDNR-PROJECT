import express from "express"
import controller from "../controller/post.controller"

const router = express.Router()

router.get("/", controller.get)
router.get("/ratio", controller.getRatio)

export default router
