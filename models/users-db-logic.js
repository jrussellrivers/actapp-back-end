const express = require('express')
const bcrypt = require('bcrypt')
const SALT_ROUNDS = 10
const db = require('../db_connection')

let User = () => {

    const login = async (username,password) => {
        let user = await db.oneOrNone(`SELECT id FROM users WHERE username = '${username}'`)
        if(user){
            bcrypt.compare(password,user.password,function(error,result){
                if(result){
                    console.log('successful login')
                    return true
                } else {
                    console.log('try again')
                    return false
                }
            })
            return user
        } else {
            return false
        }
    }

    //isFirstTimeUser -> in [Header?]: if the db query of the isFirstTimeUser boolean returns true, then render the survey
    const isFirstTimeUser = async (username) => {
        return await db.one(`select (firstTimeUser) from users where username = '${username}'`)
    }

    const updateProfilePic = async (profile_pic_url,user_id) => {
        return await db.none(`UPDATE users SET profilePic = '${profile_pic_url}' WHERE id = '${user_id}'`)
    }
        
    const getUser = async (username) => {
        return await db.one(`SELECT * FROM users WHERE username = '${username}'`)
    }

    const getUserById = async (id) => {
        return await db.one(`SELECT * FROM users WHERE id = '${id}'`)
    }
    
    const getAllUsers = async () => {
        return await db.any(`SELECT * FROM users`)
    }

    const getAllUserPics = async () => {
        return await db.any(`SELECT id, profilePic FROM users`)
    }

    const searchUsers = async (searchText) => {
        return await db.any(`SELECT * FROM users where username like '${searchText}'`)
    }

    const addCause = async (name, user_id) => {
        return await db.one(`insert into causes (cause, user_id) values ('${name}','${user_id}') RETURNING *`)
    }

    const updatePoints = async (value, id) => {
        return await db.none(`UPDATE users SET points = '${value}' WHERE id = '${id}'`)
    }

    const changeNoteDate = (timestamp, id) => {
        return db.none(`UPDATE users SET notification_check = '${timestamp}' WHERE id = '${id}'`)
    }

    //getOtherUser

    return {
        // register,
        login,
        updateProfilePic,
        getUser,
        getUserById,
        getAllUsers,
        searchUsers,
        addCause,
        getAllUserPics,
        updatePoints,
        changeNoteDate
    }
}

module.exports = User