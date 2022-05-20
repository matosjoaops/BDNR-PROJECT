import { Request, Response } from "express"
import { Cluster } from "couchbase"

import connectToCluster from "../config/connect"

async function get(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const userId = req.params.id

        const queryResult = await cluster.query("SELECT * FROM users WHERE id=$1", {
            parameters: [userId]
        })

        res.status(200).json(queryResult.rows[0].users)
    } catch (error) {
        res.status(500).json({ message: "Error getting user", error })
    }
}

export default {
    get
}
