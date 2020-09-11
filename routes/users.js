// File: ./routes/users.js
const mongoose = require('mongoose');
const router = require('express').Router();   
const User = mongoose.model('User');
const utils = require('../lib/utils');
const db = require('../db_connection')
// const pass = require('passport')
// const passport = require('../config/passport')(pass)

// PASSPORT STUFF
const passport = require('passport')
require('../config/passport')(passport)
// const Strategy = require('passport-local').Strategy
// const bcrypt = require('bcrypt')
// const SALT_ROUNDS = 10
// router.use(passport.initialize());
// router.use(passport.session());

// passport.use(new Strategy((username,password,callback)=>{
//     db.one(`SELECT * FROM users WHERE username='${username}'`)
//     .then(u=>{
//         bcrypt.compare(password, u.password)
//         .then(result=>{
//             if(!result) return callback(null,false)
//             return callback(null, u)
//         })
//     })
//     .catch(()=>callback(null,false))
// }))
// passport.serializeUser((user,callback)=>callback(null, user.id))
// passport.deserializeUser((id,callback)=>{
//     db.one(`SELECT * FROM users WHERE id='${id}'`)
//     .then(u=>{
//         return callback(null,u)
//     })
//     .catch(()=>callback({'not-found':'No User With That ID Is Found'}))
// })

// router.use(passport)

// http://localhost:3000/users/login
// Validate an existing user and issue a JWT
router.post('/login', function(req, res, next){
    console.log('yo')

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
    console.log(req.body)
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
        streetAddress:req.body.streetAddress,
        city:req.body.city,
        state:req.body.state,
        zipcode:req.body.zipcode,
        race:req.body.race,
        gender:req.body.gender,
        birthdate:req.body.birthdate
    });

    await db.none(`INSERT INTO users (username,password,salt,firstName,lastName,email,streetaddress,city,state,zipcode,race,gender,birthdate) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,[req.body.username,hash,salt,req.body.firstName,req.body.lastName,req.body.email,req.body.streetAddress,req.body.city,req.body.state,req.body.zipcode,req.body.race,req.body.gender,req.body.birthdate])
    console.log(newUser,'65')
    
    newUser.save()
      .then((user) => {
        res.json({ success: true, user: user });
      })
      .catch(err => next(err));

});
// passport.authenticate('jwt', { session: false }),
router.get('/user', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log('omg')
    console.log(req.user, '104')
    if (req.isAuthenticated()) {
        // Send the route data 
        console.log('wow')
        res.status(200).send(req.user);
    } else {
        // Not authorized
        console.log('fuck')
        res.status(401).send('You are not authorized to view this');
    }
});

module.exports = router;