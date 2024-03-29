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

        return res.status(200).json(result.content)
    } catch (error) {
        return res.status(500).json({ message: "Error getting user", error })
    }
}

async function post(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const bucket: Bucket = cluster.bucket("users")
        const collection: Collection = bucket.defaultCollection()

        const userId = req.body.id
        await collection.insert(userId, req.body)

        return res.status(200).json({ message: `User with id '${userId}' successfully created` })
    } catch (error) {
        return res.status(500).json({ message: "Error creating user", error })
    }
}

async function put(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const bucket: Bucket = cluster.bucket("users")
        const collection: Collection = bucket.defaultCollection()

        const userId = req.params.id

        let shouldEnd = false

        await collection
            .get(userId)
            .then(async ({ content }) => {
                if (req.body.id && req.body.id !== userId)
               {shouldEnd = true; return res.status(500).json({ message: "The 'id' parameter cannot be updated" })}

                if (req.body.followers && req.body.followers.contains(userId))
                {shouldEnd = true; return res.status(500).json({ message: "The user cannot follow herself" })
}
                if (req.body.following && req.body.following.contains(userId))
                {shouldEnd = true; return res.status(500).json({ message: "The user cannot follow herself" })}

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
            .catch((error) =>{
                shouldEnd = true;
                return res.status(500).send({
                    message: `User with id '${userId}' not found`,
                    error
                })}
            )
        if (shouldEnd) return

        return res.status(200).json({ message: `User with id '${userId}' successfully updated` })
    } catch (error) {
        return res.status(500).json({ message: "Error updating user", error })
    }
}

async function _delete(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const userId = req.params.id

        await cluster.transactions().run(async (ctx) => {
            ctx.query("delete from `users` where id = $1", { parameters: [userId] })

            ctx.query("delete from `posts` where created_by = $1", { parameters: [userId] })

            ctx.query(
                "\
                update `users`\
                set `users`.`following` = array_remove(`users`.`following`, $1) \
                where array_contains(`users`.`following`, $1)",
                { parameters: [userId] }
            )

            ctx.query(
                "\
                update `users`\
                set `users`.followers = array_remove(`users`.followers, $1) \
                where array_contains(`users`.followers, $1)",
                { parameters: [userId] }
            )

            const nestedCreatedComments = await ctx.query(
                "select distinct *\
                from  (select all_comms.*\
                from `posts`\
                unnest `posts`.comments as all_comms\
                ) as all_comments\
                where created_by = $1",
                { parameters: [userId] }
            )

            const createdComments = nestedCreatedComments.rows.map((row) => row.all_comments)

            createdComments.forEach((comment) => {
                ctx.query(
                    "\
                    update `posts`\
                    set `posts`.comments = array_remove(`posts`.comments, $1) \
                    where array_contains(comments, $1)",
                    { parameters: [comment] }
                )
            })

            ctx.query(
                "\
                update `posts`\
                set `posts`.liked_by = array_remove(`posts`.liked_by, $1)\
                where array_contains(liked_by, $1)",
                { parameters: [userId] }
            )

            const nestedLikedComments = await ctx.query(
                "select distinct *\
                from (select all_comms.*\
                from `posts`\
                unnest `posts`.comments as all_comms) as all_comments\
                where array_contains(liked_by, $1)",
                { parameters: [userId] }
            )

            const likedComments = nestedLikedComments.rows.map((row) => row.all_comments)

            likedComments.forEach((comment) => {
                ctx.query(
                    "\
                update `posts` \
                set `posts`.comments[array_position(`posts`.comments, $1)].liked_by = array_remove(`posts`.comments[array_position(`posts`.comments, $1)].liked_by, $2)\
                where array_contains(comments, $1)",
                    { parameters: [comment, userId] }
                )
            })
        })

        return res.status(200).json({ message: `User with id '${userId}' successfully removed` })
    } catch (error) {
        return res.status(500).json({ message: "Error deleting user", error })
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

        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({ message: "Error getting user posts", error })
    }
}

async function follow(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()
        const userThatWillFollow = req.params.id
        const { userThatWillBeFollowed } = req.body

        await cluster.transactions().run(async (ctx) => {
            ctx.query(
                " \
            update `users` \
            set `users`.`following` = array_append(`users`.`following`, $1) \
            where id = $2 \
            ",
                { parameters: [userThatWillBeFollowed, userThatWillFollow] }
            )

            ctx.query(
                " \
            update `users` \
            set `users`.followers = array_append(`users`.followers, $1) \
            where id = $2 \
            ",
                { parameters: [userThatWillFollow, userThatWillBeFollowed] }
            )
        })

        return res.status(200).json({ message: "Follow request was processed successfully!" })
    } catch (error) {
        return res.status(500).json({ message: "Error processing follow request!", error })
    }
}

export default {
    get,
    post,
    put,
    delete: _delete,
    getUserPosts,
    follow
}
