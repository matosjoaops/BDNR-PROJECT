import { Request, Response } from "express"
import { Cluster, SearchQuery } from "couchbase"

import connectToCluster from "../config/connect"


async function get(req: Request, res: Response) {
    try {

        const cluster: Cluster = await connectToCluster()

        const queryResult = await cluster.searchQuery(
            'posts-index',
            SearchQuery.match(req.query.text),
            { limit: parseInt(req.params.limit.toString()) })

        res.status(200).json(queryResult)

    } catch (error) {

        res.status(500).json({ message: "Error getting user", error })
        
    }
}


export default {
    get
}
