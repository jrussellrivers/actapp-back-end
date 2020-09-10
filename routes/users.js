// File: ./routes/users.js
const mongoose = require('mongoose');
const router = require('express').Router();   
const User = mongoose.model('User');
const utils = require('../lib/utils');
const db = require('../db_connection')

const createUser = async (req,res,next) => {
    console.log(req.body)
    let newUser = await db.one(`INSERT INTO users (username,password,firstName,lastName,email,streetaddress,city,state,zipcode,race,gender,birthdate) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,[req.body.username,hash,req.body.firstName,req.body.lastName,req.body.email,req.body.streetaddress,req.body.city,req.body.state,req.body.zipcode,req.body.race,req.body.gender,req.body.birthdate])
    next()
    return newUser
}

// http://localhost:3000/users/login
// Validate an existing user and issue a JWT
router.post('/login', function(req, res, next){
    

    // User.findOne({ username: req.body.username })
    db.one(`SELECT * FROM users WHERE username='${req.body.username}'`)
      .then((user) => {
        console.log(user,'23')
              if (!user) {
                  res.status(401).json({ success: false, msg: "could not find user" });
              }
              
              // Function defined at bottom of app.js
              const isValid = utils.validPassword(req.body.password, user.password, user.salt);
              
              if (isValid) {
                  console.log(user,'32')
                  const tokenObject = utils.issueJWT(user);
                  console.log(user,'34')
                  res.status(200).json({ success: true, token: tokenObject.token, expiresIn: tokenObject.expires });
              } else {
                  res.status(401).json({ success: false, msg: "you entered the wrong password" });
              }
      
          })
          .catch((err) => {   
              next(err);
          });
  });

router.post('/register', async function(req, res, next){
    const saltHash = utils.genPassword(req.body.password);
    
    const salt = saltHash.salt;
    const hash = saltHash.hash;
  
    const newUser = new User({
        username: req.body.username,
        hash: hash,
        salt: salt,
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        email:req.body.email,
        streetaddress:req.body.streetaddress,
        city:req.body.city,
        state:req.body.state,
        zipcode:req.body.zipcode,
        race:req.body.race,
        gender:req.body.gender,
        birthdate:req.body.birthdate
    });

    await db.none(`INSERT INTO users (username,password,salt,firstName,lastName,email,streetaddress,city,state,zipcode,race,gender,birthdate) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,[req.body.username,hash,salt,req.body.firstName,req.body.lastName,req.body.email,req.body.streetaddress,req.body.city,req.body.state,req.body.zipcode,req.body.race,req.body.gender,req.body.birthdate])
    console.log(newUser,'65')
    
    newUser.save()
      .then((user) => {
        res.json({ success: true, user: user });
      })
      .catch(err => next(err));

});

module.exports = router;