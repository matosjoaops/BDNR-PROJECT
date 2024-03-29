import express from "express"
import dotenv from "dotenv"
import routes from "./routes"

dotenv.config()

const app = express()
const port = process.env.PORT

app.listen(port, () => {
    console.log(`Application running in port ${port}.`)
})

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use("/user", routes.user)
app.use("/post", routes.post)
