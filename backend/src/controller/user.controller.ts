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

/* async function getUsersThatCommentedAndLikedPost(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const queryResult = await cluster.query("select users.id as id1, posts.id as id2 from users join posts\
            on posts.created_by = users.id\
            where users.id = '1fe143f2-7e13-483b-9c4e-ef9576f750b0';"
        )

        const result: JSON[] = []

        console.log(queryResult)

        queryResult.rows.forEach((row) => {
            delete row.posts.comments

            result.push({ id: row.id, ...row.posts })
        })

        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ message: "Error getting user", error })
    }
} */

async function post(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const bucket: Bucket = cluster.bucket("users")
        const collection: Collection = bucket.defaultCollection()

        const userId = req.body.id
        await collection.insert(userId, req.body)

        res.status(200).json({ message: `User with id '${userId}' successfully created` })
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error })
    }
}

async function put(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const bucket: Bucket = cluster.bucket("users")
        const collection: Collection = bucket.defaultCollection()

        const userId = req.params.id

        await collection
            .get(userId)
            .then(async ({ content }) => {
                if (req.body.id && req.body.id !== userId)
                    res.status(500).json({ message: "The 'id' parameter cannot be updated" })

                if (req.body.followers && req.body.followers.contains(userId))
                    res.status(500).json({ message: "The user cannot follow herself" })

                if (req.body.following && req.body.following.contains(userId))
                    res.status(500).json({ message: "The user cannot follow herself" })

                const updatedUser = {
                    bio: req.body.bio ? req.body.bio : content.bio,
                    city: req.body.city ? req.body.city : content.city,
                    contact: req.body.contact ? req.body.contact : content.contact,
                    followers: req.body.followers ? req.body.followers : content.followers,
                    following: req.body.following ? req.body.following : content.following,
                    id: userId,
                    name: req.body.name ? req.body.name : content.name,
                    username: req.body.username ? req.body.username : content.username
                }

                await collection.upsert(userId, updatedUser)
            })
            .catch((error) =>
                res.status(500).send({
                    message: `User with id '${userId}' not found`,
                    error
                })
            )

        res.status(200).json({ message: `User with id '${userId}' successfully updated` })
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error })
    }
}

async function _delete(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const bucket: Bucket = cluster.bucket("users")
        const collection: Collection = bucket.defaultCollection()

        const userId = req.params.id
        await collection.remove(userId)

        res.status(200).json({ message: `User with id '${userId}' successfully removed` })
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error })
    }
}

async function getUserPosts(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const userId = req.params.id

        const queryResult = await cluster.query(
            "select *, meta().id from posts where created_by like $1",
            {
                parameters: [userId]
            }
        )

        const result: JSON[] = []

        queryResult.rows.forEach((row) => {
            delete row.posts.comments

            result.push({ id: row.id, ...row.posts })
        })

        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ message: "Error getting user posts", error })
    }
}

export default {
    get,
    // getUsersThatCommentedAndLikedPost,
    post,
    put,
    delete: _delete,
    getUserPosts
}
