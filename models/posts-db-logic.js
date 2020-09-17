const db = require('../db_connection')

const Post = () => {

    const getAllPosts = async () => {
        return await db.any(`select * from posts`)
    }
    
    const getPostsByEvent = async event_id => {
        return await db.any(`select * from posts where event_id = ${event_id}`)
    }

    const getPostsByUser = async username => {
        return await db.any(`select * from posts where username = '${username}'`)
    }

    const addPost = async (image,text,username,user_id,cause,action,points) => {
        console.log(user_id,'18')
        return await db.none(`insert into posts (picurl,body,username,user_id,cause,action_title,points) values ('${image}','${text}','${username}','${user_id}','${cause}','${action}','${points}')`)
    }

    const getAllComments = async() => {
        return await db.any(`select * from comments`)
    }

    const getCommentsByPost = async post_id => {
        return await db.any(`select * from comments where post_id = ${post_id}`)
    }

    const addComment = async (comment,user_id,username,post_id,post_username) => {
        let currentTime = new Date().toUTCString()
        return await db.any(`insert into comments (comment,user_id,username,post_id,post_username,created_at) values ('${comment}','${user_id}','${username}',${post_id},'${post_username}','${currentTime}') returning *`)
    }

    const getLikesByPost = async (user_id,post_id) => {
        let checkIfLiked = await checkIfUserAlreadyLikedPost(user_id,post_id)
        let likesCount = await db.one(`select count(*) from likes where post_id = ${post_id}`)
        return [checkIfLiked,likesCount]
    }

    const checkIfUserAlreadyLikedPost = async (user_id,post_id)=> {
        let getLikes = await db.oneOrNone(`select (user_id) from likes where post_id = ${post_id}`)
        let alreadyLikes = false
        for(let i = 0; i < getLikes.length; i++){
            if(getLikes[i].user_id === user_id){
                alreadyLikes = true
            }
        }
        return alreadyLikes
    }

    const addLike = async (user_id,post_id,post_username,username) => {
        let currentTime = new Date().toUTCString()
        return await db.one(`insert into likes (user_id,post_id,post_username,created_at,username) values (${user_id},${post_id},'${post_username}','${currentTime}','${username}') returning *`)
    }

    const getAllLikes = async () => {
        return await db.any(`select * from likes`)
    }

    const getPostById = async (postId) =>{
        return await db.one(`SELECT * FROM posts WHERE id='${postId}'`)
    }

    const updatePointStatus = async (id) => {
        return await db.none(`UPDATE posts SET points_awarded = 'true' WHERE id = '${id}'`)
    }
    
    return {
        getAllPosts,
        getPostsByEvent,
        getPostsByUser,
        addPost,
        getCommentsByPost,
        addComment,
        getLikesByPost,
        addLike,
        checkIfUserAlreadyLikedPost,
        getAllComments,
        getAllLikes,
        getPostById,
        updatePointStatus
    }
}

module.exports = Post

// const storeImageBinary = async (imageName,img) => {
//     return await db.any(`File file = new File('${imageName}');
//     FileInputStream fis = new FileInputStream(file);
//     PreparedStatement ps = conn.prepareStatement('INSERT INTO images VALUES (${imageName}, ${img})');
//     ps.setString(1, file.getName());
//     ps.setBinaryStream(2, fis, file.length());
//     ps.executeUpdate();
//     ps.close();
//     fis.close();`)
// }