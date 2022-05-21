import express from "express"
import controller from "../controller/user.controller"

const router = express.Router()

router.get("/:id", controller.get)
router.post("/", controller.post)

export default router
