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

    const updateUserInfo = async (streetaddress,city,state,zipcode,user_id) => {
        return await db.one(`UPDATE users SET streetaddress = '${streetaddress}', city = '${city}', state = '${state}', zipcode = '${zipcode}' WHERE id = '${user_id}' returning (streetaddress,city,state,zipcode)`)
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

    const getUserPic = async user_id => {
        return await db.one(`SELECT profilePic FROM users where id = '${user_id}'`)
    }

    const searchUsers = async (searchText) => {
        return await db.any(`SELECT * FROM users where username like '${searchText}'`)
    }

    const addCause = async (cause, user_id) => {
        let causeExists = await getCause(cause,user_id)
        console.log(causeExists,'65')
        if(causeExists === true){
            return false
        } else {
            console.log('here')
            return await db.one(`insert into causes (cause, user_id) values ('${cause}','${user_id}') RETURNING *`)
        }
    }

    const getCause = async (cause,user_id) => {
        let causeExists = await db.oneOrNone(`SELECT * FROM causes where cause = '${cause}' AND user_id = '${user_id}'`)
        console.log(causeExists,'76')
        if(causeExists) {
            return true
        } else {
            return false
        }
    }

    const deleteCause = async (cause, user_id) => {
        let causeExists = await getCause(cause,user_id)
        if(causeExists){
            return await db.one(`delete from causes where cause = '${cause}' AND user_id = '${user_id}' RETURNING *`)
        } else {
            return true
        }
    }

    const updatePoints = async (value, id) => {
        return await db.none(`UPDATE users SET points = '${value}' WHERE id = '${id}'`)
    }

    const changeNoteDate = (timestamp, id) => {
        return db.none(`UPDATE users SET notification_check = '${timestamp}' WHERE id = '${id}'`)
    }

    const myCommunity = async () =>{
        return db.any(`SELECT * FROM my_community`)
    }

    const addMyCommunity = async (id, username, addId) =>{
        let currentTime = new Date().toUTCString()
        return await db.one(`insert into my_community (user_id, username,created_at,adder_id) values (${id},'${username}','${currentTime}',${addId}) RETURNING *`)
    }

    const removeMyCommunity = async (id, addId) =>{
        return await db.none(`DELETE FROM my_community WHERE user_id=${id} AND adder_id=${addId}`)
    }

    const communityById = async (id) =>{
        return db.any(`SELECT * FROM my_community WHERE adder_id='${id}'`)
    }

    //getOtherUser

    return {
        // register,
        login,
        updateProfilePic,
        updateUserInfo,
        getUser,
        getUserById,
        getAllUsers,
        searchUsers,
        addCause,
        deleteCause,
        getAllUserPics,
        getUserPic,
        updatePoints,
        changeNoteDate,
        myCommunity,
        addMyCommunity,
        removeMyCommunity,
        communityById
    }
}

module.exports = User