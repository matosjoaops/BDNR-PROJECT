import { Request, Response } from "express"
import { Cluster, Bucket, Collection } from "couchbase"

import connectToCluster from "../config/connect"

async function get(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()
        const bucket: Bucket = cluster.bucket("users")
        const collection: Collection = bucket.defaultCollection()

        const userId = req.params.id

        const result = await collection.get(userId)

        res.status(200).json(result.content)
    } catch (error) {
        res.status(500).json({ message: "Error getting user", error })
    }
}

async function post(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const bucket: Bucket = cluster.bucket("users")
        const collection: Collection = bucket.defaultCollection()

        await collection.insert(req.body.id, req.body)

        res.status(200).json({ message: `User with id '${req.body.id}' successfully created` })
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error })
    }
}

export default {
    get,
    post
}
