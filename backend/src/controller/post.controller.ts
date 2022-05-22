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

async function getRatio(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const { minRatio } = req.body

        const queryResult = await cluster.query(
            "select * \
            from ( \
                    select array_count(p.comments) as num_comments,  \
                    array_count(p.liked_by) as num_likes, \
                    * \
                    from `posts` as p \
                ) as data \
            where (data.num_likes / data.num_comments) > " + minRatio,
        )

        return res.status(200).json({ message: "Query was successful!", results: queryResult })
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Error getting posts with the provided ratio!", error })
    }
}

export default {
    get,
    getRatio
}