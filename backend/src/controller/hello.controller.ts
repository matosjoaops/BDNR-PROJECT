import { Request, Response } from "express"
import main from "../database"

async function get(req: Request, res: Response) {
    // Run the main function
    main()
        .then(() => res.send("Worked!"))
        .catch((err) => {
            console.log("ERR:", err)
            res.send("Did not work!")
        })
}

export default {
    get
}
