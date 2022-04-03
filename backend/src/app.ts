import express from "express"
import dotenv from "dotenv"
import routes from "./routes"

dotenv.config()

const app = express()
const port = process.env.PORT

app.listen(port, () => {
    console.log(`Application running in port ${port}.`)
})

app.use("/hello", routes.hello)
