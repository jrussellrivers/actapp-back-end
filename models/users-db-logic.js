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

    const storeUsersCauses = async (cause1,cause2,cause3,username) => {
        let causes = await db.one(`UPDATE users SET cause_one = '${cause1}', cause_two = '${cause2}', cause_three = '${cause3}' WHERE username = '${username}' RETURNING *`)
        console.log(causes)
        return causes
    }

    const updateProfilePic = async (profile_pic_url,username) => {
        return await db.one(`UPDATE users SET profilePic = '${profile_pic_url}' WHERE username = '${username}' RETURNING *`)
    }
        
    const getUser = async (username) => {
        return await db.one(`SELECT * FROM users WHERE username = '${username}'`)
    }

    //getOtherUser

    return {
        // register,
        login,
        storeUsersCauses,
        updateProfilePic,
        getUser
    }
}

module.exports = User