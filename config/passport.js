// File: ./config/passport
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt;
const fs = require('fs');
const path = require('path');
const db = require('../db_connection')

// const User = require('mongoose').model('User');

// Go up one directory, then look for file name
const pathToKey = path.join(__dirname, '..', '/lib/jwtRS256.pem.pub');

// The verifying public key
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

// At a minimum, you must pass the `jwtFromRequest` and `secretOrKey` properties
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ['RS256']
};

// app.js will pass the global passport object here, and this function will configure it
module.exports = (passport) => {
    console.log('in passport')
    // The JWT payload is passed into the verify callback
    passport.use(new JwtStrategy(options, function(jwt_payload, done) {
        console.log(jwt_payload.sub)
        const user = db.one(`SELECT * FROM users WHERE id=${jwt_payload.sub}`)
        console.log(user)
        if (user) {
            console.log(user,'passport')
            // Since we are here, the JWT is valid and our user is valid, so we are authorized!
            return done(null, user);
        } else {
            console.log('Else', 'passport')
            return done(null, false);
        }

        // Since we are here, the JWT is valid!

        // We will assign the `sub` property on the JWT to the database ID of user
        // User.findOne({_id: jwt_payload.sub}, function(err, user) {
            
        //     // This flow look familiar?  It is the same as when we implemented
        //     // the `passport-local` strategy
        //     if (err) {
        //         console.log(err, 'passport')
        //         return done(err, false);
        //     }
        //     if (user) {
        //         console.log(user,'passport')
        //         // Since we are here, the JWT is valid and our user is valid, so we are authorized!
        //         return done(null, user);
        //     } else {
        //         console.log('Else', 'passport')
        //         return done(null, false);
        //     }
            
        // });

    }));
}