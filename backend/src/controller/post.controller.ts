import { Request, Response } from "express"
import {  Bucket, Cluster, Collection } from "couchbase"

import connectToCluster from "../config/connect"


// POSTS.

/**
 * Get specific post.
 */
async function get(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()
        const bucket: Bucket = cluster.bucket("posts")
        const collection: Collection = bucket.defaultCollection()

        const postId = req.params.id

        const result = await collection.get(postId)

        return res.status(200).json(result.content)
    } catch (error) {
        return res.status(500).json({ message: "Error getting post", error })
    }
}

/**
 * Get posts.
 */
async function getPosts(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const limit = req.body.limit
        const offset = req.body.offset

        const itemType = req.body.item_type
        const postType = req.body.post_type

        const queryResult = await cluster.query("SELECT *, meta().id FROM posts\
            where \
                item_type like $itemType and\
                post_type like $postType\
            order by timestamp desc\
            offset $offset\
            limit $limit;",
            { parameters: {itemType, postType, offset, limit} })

        const result: JSON[] = []

        queryResult.rows.forEach((row) => {
            delete row.posts.comments

            result.push({ id: row.id, ...row.posts })
        })

        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({ message: "Error getting posts", error })
    }
}

/**
 * Get posts liked by a user.
 */
async function getUserLikedPosts(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const userId = req.params.userId

        const queryResult = await cluster.query("SELECT *, meta().id FROM posts\
            where \
                $userId in liked_by\
            order by timestamp desc;",
            { parameters: {userId} })

        const result: JSON[] = []

        queryResult.rows.forEach((row) => {
            delete row.posts.comments

            result.push({ id: row.id, ...row.posts })
        })

        return res.status(200).json(result)
    } catch (error) {
        return res.status(500).json({ message: `Error getting posts liked by user ${req.params.userId}`, error })
    }
}

/**
 * Create a new post.
 */
async function post(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const bucket: Bucket = cluster.bucket("posts")
        const collection: Collection = bucket.defaultCollection()

        const postId = req.body.id
        await collection.insert(postId, req.body)

        return res.status(200).json({ message: `Post with id '${postId}' successfully created` })
    } catch (error) {
        return res.status(500).json({ message: "Error creating post", error })
    }
}

/**
 * Update an existing post.
 */
async function put(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const bucket: Bucket = cluster.bucket("posts")
        const collection: Collection = bucket.defaultCollection()

        const postId = req.params.id

        let shouldEnd = false

        await collection
            .get(postId)
            .then(async ({ content }) => {
                if (req.body.timestamp)
                {shouldEnd = true; return res.status(500).json({ message: "The 'timestamp' parameter cannot be updated" })}

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
                {shouldEnd = true; return res.status(500).send({
                    message: `Post with id '${postId}' not found`,
                    error
                })}
            )

            if (shouldEnd) return

            return res.status(200).json({ message: `Post with id '${postId}' successfully updated` })
    } catch (error) {
        return res.status(500).json({ message: "Error updating post", error })
    }
}

/**
 * Delete a post.
 */
async function _delete(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const bucket: Bucket = cluster.bucket("posts")
        const collection: Collection = bucket.defaultCollection()

        const postId = req.params.id
        await collection.remove(postId)

        return res.status(200).json({ message: `Post with id '${postId}' successfully removed` })
    } catch (error) {
        return res.status(500).json({ message: "Error deleting post", error })
    }
}


/**
 * Get list of posts with ratio of likes to comments higher than a specified threshold.
 */
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

/**
 * Get post type distribution.
 */
async function getPostTypeDistribution(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const queryResult = await cluster.query("\
            select\
                (count(*) / (select count(*) as total from posts posts1)[0].total) as ratio,\
                post_type\
            from posts\
            group by post_type;"
        )

        return res.status(200).json(queryResult.rows)
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Error getting post type distribution!", error })
    }
}

/**
 * Get item type distribution.
 */
async function getItemTypeDistribution(req: Request, res: Response) {
    try {
        const cluster: Cluster = await connectToCluster()

        const queryResult = await cluster.query("\
            select\
                (count(*) / (select count(*) as total from posts posts1)[0].total) as ratio,\
                item_type\
            from posts\
            group by item_type;"
        )

        return res.status(200).json(queryResult.rows)
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Error getting item type distribution!", error })
    }
}

/**
 * Like a post.
 */
async function likePost(req: Request, res: Response) {

    const { postId } = req.params
    const { userId } = req.body

    try {

        const cluster: Cluster = await connectToCluster()
        const bucket: Bucket = cluster.bucket("posts")
        const collection: Collection = bucket.defaultCollection()

        // Fetch all data for post.
        await collection
            .get(postId)
            .then(async ({ content }) => {

                if (content.liked_by.includes(userId)) {
                    return res.status(500).send({
                        message: `User with id ${userId} already have liked post with id ${postId}`,
                    })
                }

                await content.liked_by.push(userId)

                await collection.upsert(postId, content)

                return res.status(200).json(`The post with id ${postId} was liked by user with id ${userId}`)
            })
            .catch((error) =>
                {return res.status(500).send({
                    message: `Post with id '${postId}' not found`,
                    error
                })}
            )
        
    } catch (error) {

        return res.status(500).json({ message: "Error liking post", error })
   
    }
}

/**
 * Unlike a post.
 */
async function removeLikePost(req: Request, res: Response) {

    const { postId } = req.params
    const { userId } = req.body

    try {

        const cluster: Cluster = await connectToCluster()
        const bucket: Bucket = cluster.bucket("posts")
        const collection: Collection = bucket.defaultCollection()

        // Fetch all data for post.
        await collection
            .get(postId)
            .then(async ({ content }) => {

                console.log(content)

                if (!content.liked_by.includes(userId)) {
                    return res.status(500).send({
                        message: `User with id ${userId} does not have liked post with id ${postId}`,
                    })
                }

                const arr = content.liked_by.filter((item: { id: string }) => item.id !== String(userId));

                content.liked_by = arr

                await collection.upsert(postId, content)

                return res.status(200).json(`The post with id ${postId} was unliked by user with id ${userId}`)
            })
            .catch((error) =>
                {
                    console.log(error)
                    return res.status(500).send({
                    message: `Post with id '${postId}' not found`,
                    error
                })}
            )
        
    } catch (error) {

        return res.status(500).json({ message: "Error unliking post", error })
   
    }
}


// COMMENTS

/** 
 * Returns comments for a specific post. 
 */
async function getComments(req: Request, res: Response) { 
    
    const { postId } = req.params

    try {
        
        const cluster: Cluster = await connectToCluster()

        const queryResult = await cluster.query("SELECT comments FROM posts WHERE meta().id like $1", {
            parameters: [postId]
        })

        return res.status(200).json(queryResult)

    } catch (error) {

        return res.status(500).json({ message: "Error getting comments", error })
    
    }

}

/**
 * Creates a new comment for a specific post.
 */
async function postComment(req: Request, res: Response) {

    const { postId } = req.params
    const { created_by, text} = req.body

    try {

        const cluster: Cluster = await connectToCluster()

        const bucket: Bucket = cluster.bucket("posts")

        const collection: Collection = bucket.defaultCollection()

        // Create new comment object.
        const comment = {
            id: String(Math.floor((Date.now() * Math.random()) / 1000)),
            text: text,
            created_by: created_by,
            liked_by: []
        };

        let shouldEnd = false

        // Fetch all data for post.
        await collection
            .get(postId)
            .then(async ({ content }) => {

                // Append new comment.
                await content.comments.push(comment)

                // Build new post object.
                const updatedPost = {
                    post_title: content.post_title,
                    post_type: content.post_type,
                    item_type: content.item_type,
                    description: content.description,
                    pictures: content.pictures,
                    price_range: content.price_range,
                    created_by: content.created_by,
                    liked_by:  content.liked_by,
                    comments: content.comments
                }

                // Update post object.
                await collection.upsert(postId, updatedPost)

                return res.status(200).json(comment)

            })
            .catch((error) =>
            {shouldEnd = true; return res.status(500).send({
                    message: `Post with id '${postId}' not found`,
                    error
                })}
            )
        
    } catch (error) {

        return res.status(500).json({ message: "Error creating comment", error })
   
    }

}

/**
 * Edit data from an existing comment.
 */
async function updateComment(req: Request, res: Response) {

    const { postId, commentId} = req.params
    const { text} = req.body

    try {

        const cluster: Cluster = await connectToCluster()

        const bucket: Bucket = cluster.bucket("posts")

        const collection: Collection = bucket.defaultCollection()

        let shouldEnd = false

        // Fetch all data for post.
        await collection
            .get(postId)
            .then(async ({ content }) => {

                // Get comment to edit.
                const commentToEdit = content.comments.find((item: { id: string }) => {
                    return item.id == commentId;
                });

                // Update comment.
                commentToEdit.text = text

                // Create new array of comments without the edited comment.
                const arr = content.comments.filter((item: { id: string }) => item.id !== String(commentId));

                // Add updated comment again
                await content.comments.push(commentToEdit)

                // Build new post object.
                const updatedPost = {
                    post_title: content.post_title,
                    post_type: content.post_type,
                    item_type: content.item_type,
                    description: content.description,
                    pictures: content.pictures,
                    price_range: content.price_range,
                    created_by: content.created_by,
                    liked_by:  content.liked_by,
                    comments: content.comments
                }

                // Update post object.
                await collection.upsert(postId, updatedPost)

                return res.status(200).json({ message: `Comment for post with id '${postId}' was successfully updated` })

            })
            .catch((error) =>
                {shouldEnd = true; return res.status(500).send({
                    message: `Post with id '${postId}' not found`,
                    error
                })}
            )
        
    } catch (error) {

        return res.status(500).json({ message: "Error updating comment", error })
   
    }
}

/**
 * Delete a comment.
 */
async function deleteComment(req: Request, res: Response) {

    const { postId, commentId} = req.params

    try {

        const cluster: Cluster = await connectToCluster()

        const bucket: Bucket = cluster.bucket("posts")

        const collection: Collection = bucket.defaultCollection()

        let shouldEnd = false

        // Fetch all data for post.
        await collection
            .get(postId)
            .then(async ({ content }) => {

                // Create new array of comments without the specified comment.
                const arr = content.comments.filter((item: { id: string }) => item.id !== String(commentId));

                // Build new post object.
                const updatedPost = {
                    post_title: content.post_title,
                    post_type: content.post_type,
                    item_type: content.item_type,
                    description: content.description,
                    pictures: content.pictures,
                    price_range: content.price_range,
                    created_by: content.created_by,
                    liked_by:  content.liked_by,
                    comments: arr
                }

                // Update post object.
                await collection.upsert(postId, updatedPost)

                res.status(200).json({ message: `Comment '${commentId}' for post '${postId}' was successfully deleted` })

            })
            .catch((error) =>
            {shouldEnd = true; return res.status(500).send({
                    message: `Unexpected error ocurred.`,
                    error
                })}
            )
        
        
    } catch (error) {

        return res.status(500).json({ message: "Error while deleting comment", error })
   
    }
}






export default {
    get,
    getPosts,
    getUserLikedPosts,
    post,
    put,
    delete: _delete,
    likePost,
    removeLikePost,
    getRatio,
    getPostTypeDistribution,
    getItemTypeDistribution,
    getComments,
    postComment,
    updateComment,
    deleteComment
}
