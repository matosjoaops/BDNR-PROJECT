import { Request, Response } from "express"
import { Bucket, Cluster, Collection, connect, GetResult, MutationResult } from "couchbase"

async function get(req: Request, res: Response) {
    try {
        console.log("Connecting......")
        const cluster: Cluster = await connect("couchbase://couchbase", {
            username: "Administrator",
            password: "bdnr-12345",
            timeouts: {
                kvTimeout: 10000,
                kvDurableTimeout: 10000,
                viewTimeout: 10000,
                queryTimeout: 10000,
                analyticsTimeout: 10000,
                searchTimeout: 10000,
                managementTimeout: 10000
            }
        })
        console.log("Connected......")

        const queryResult = await cluster.query("SELECT * FROM users WHERE id=$1", {
            parameters: ["009011c5-c27c-4ad1-b803-fd4c157866b4"]
        })
        queryResult.rows.forEach((row) => {
            console.log(row)
        })

        res.status(200).json({ id: "123" })
    } catch (error) {
        res.status(500).json({ message: "Error getting user", error })
    }
}

export default {
    get
}
