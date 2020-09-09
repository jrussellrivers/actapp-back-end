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

    const addPost = async (image,text,username,event_id) => {
        console.log(image,text,username,event_id,'11 of posts-db-logic')
        return await db.none(`insert into posts (picurl,body,username,event_id) values ('${image}','${text}','${username}',${event_id})`)
    }

    const getAllComments = async() => {
        return await db.any(`select * from comments`)
    }

    const getCommentsByPost = async post_id => {
        return await db.any(`select * from comments where post_id = ${post_id}`)
    }

    const addComment = async (comment,user_id,username,post_id) => {
        return await db.any(`insert into comments (comment,user_id,username,post_id) values ('${comment}','${user_id}','${username}',${post_id}) returning *`)
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

    const addLike = async (user_id,post_id) => {
        let alreadyLikes = await checkIfUserAlreadyLikedPost(user_id,post_id)
        if(!alreadyLikes) {
            return await db.one(`insert into likes (user_id,post_id) values (${user_id},${post_id}) returning *`)
        }
        return false
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
        getAllComments
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