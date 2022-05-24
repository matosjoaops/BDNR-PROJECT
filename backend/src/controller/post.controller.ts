import { Request, Response } from "express"
import { Cluster, Bucket, Collection } from "couchbase"

import connectToCluster from "../config/connect"

async function get(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()
        const bucket: Bucket = cluster.bucket("posts")
        const collection: Collection = bucket.defaultCollection()

        const postId = req.params.id

        const result = await collection.get(postId)

        res.status(200).json(result.content)
    } catch (error) {
        res.status(500).json({ message: "Error getting post", error })
    }
}

async function post(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const bucket: Bucket = cluster.bucket("posts")
        const collection: Collection = bucket.defaultCollection()

        const postId = req.body.id
        await collection.insert(postId, req.body)

        res.status(200).json({ message: `Post with id '${postId}' successfully created` })
    } catch (error) {
        res.status(500).json({ message: "Error creating post", error })
    }
}

async function put(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const bucket: Bucket = cluster.bucket("posts")
        const collection: Collection = bucket.defaultCollection()

        const postId = req.params.id

        await collection
            .get(postId)
            .then(async ({ content }) => {
                if (req.body.timestamp)
                    res.status(500).json({ message: "The 'timestamp' parameter cannot be updated" })

                const updatedPost = {
                    post_title: req.body.post_title ? req.body.post_title : content.post_title,
                    post_type: req.body.post_type ? req.body.post_type : content.post_type,
                    item_type: req.body.item_type ? req.body.item_type : content.item_type,
                    description: req.body.description ? req.body.description : content.description,
                    pictures: req.body.pictures ? req.body.pictures : content.pictures,
                    price_range: req.body.price_range ? req.body.price_range : content.price_range,
                    created_by: req.body.created_by ? req.body.created_by : content.created_by,
                    liked_by: req.body.liked_by ? req.body.liked_by : content.liked_by,
                    comments: req.body.comments ? req.body.comments : content.comments
                }

                await collection.upsert(postId, updatedPost)
            })
            .catch((error) =>
                res.status(500).send({
                    message: `Post with id '${postId}' not found`,
                    error
                })
            )

        res.status(200).json({ message: `Post with id '${postId}' successfully updated` })
    } catch (error) {
        res.status(500).json({ message: "Error updating post", error })
    }
}

async function _delete(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const bucket: Bucket = cluster.bucket("posts")
        const collection: Collection = bucket.defaultCollection()

        const postId = req.params.id
        await collection.remove(postId)

        res.status(200).json({ message: `Post with id '${postId}' successfully removed` })
    } catch (error) {
        res.status(500).json({ message: "Error deleting post", error })
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
                    timestamp, \
                    post_title, \
                    post_type, \
                    item_type, \
                    description, \
                    price, \
                    price_range, \
                    meta().id, \
                    created_by \
                    from `posts` as p \
                ) as data \
            where (data.num_likes / data.num_comments) > $1",
            { parameters: [minRatio] }
        )

        const results = queryResult.rows.map((row) => row.data)

        return res.status(200).json({ results })
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Error getting posts with the provided ratio!", error })
    }
}

export default {
    get,
    post,
    put,
    delete: _delete,
    getRatio
}
