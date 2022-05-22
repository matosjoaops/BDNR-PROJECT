import { Request, Response } from "express"
import { Cluster, SearchQuery } from "couchbase"

import connectToCluster from "../config/connect"


async function get(req: Request, res: Response) {
    try {

        const cluster: Cluster = await connectToCluster()

        const { limit, searchText } = req.query

        var limitPagination = 15

        if (limit !== undefined) {
            limitPagination = parseInt(req.params.limit.toString())
        }

        if (searchText !== undefined) {

            const queryResult = await cluster.searchQuery(
                "posts-index",
                SearchQuery.queryString(searchText.toString()),
                { timeout:2000, limit: limitPagination }
            )

            res.status(200).json(queryResult)

        } 

        const queryResult = await cluster.query(
            "SELECT * from `posts` LIMIT " + limitPagination
        )

        res.status(200).json(queryResult)

    } catch (error) {

        res.status(500).json({ message: "Error getting posts", error })
        
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
