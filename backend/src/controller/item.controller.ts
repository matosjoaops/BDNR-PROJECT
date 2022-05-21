import { Request, Response } from "express"
import { Cluster } from "couchbase"

import connectToCluster from "../config/connect"


async function get(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const queryResult = await cluster.query("SELECT * FROM users WHERE id=$1", {
            parameters: ["009011c5-c27c-4ad1-b803-fd4c157866b4"]
        })

        res.status(200).json(queryResult)
    } catch (error) {
        res.status(500).json({ message: "Error getting user", error })
    }
}


export default {
    get
}
