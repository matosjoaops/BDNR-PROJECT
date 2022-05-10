import express from "express"
import controller from "../controller/user.controller"

const router = express.Router()

router.get("/", controller.get)

export default router
