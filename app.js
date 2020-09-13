const express = require('express')
const app = express()
const cors = require('cors')
const {secret} = require('./config')
const port = 3333
const session = require('express-session')
const eS = session(secret)
const db = require('./db_connection')
const multer = require('multer')
const fileUpload = require('express-fileupload')
require('./models/user');

const User = require('./models/users-db-logic')()
// const Policy = require('./models/policies-db-logic')()
const Post = require('./models/posts-db-logic')()
const Actions = require('./models/actions-db-logic')()


// All Passport-JWT Imports
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt;
const fs = require('fs');
const path = require('path');
const passport = require('passport')
const pathToKey = path.join(__dirname, './lib/jwtRS256.pem');
const utils = require('./lib/utils');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY,
    algorithms: ['RS256']
};

app.use(express.json())
app.use(express.static(__dirname+"/site"))
app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(fileUpload())

app.use(eS)

// Passport-JWT Logic
app.use(passport.initialize());
passport.use(new JwtStrategy(options, function(jwt_payload, done) {
    console.log(jwt_payload.sub)
    console.log(jwt_payload)
    console.log('using passport')
    db.one(`SELECT * FROM users WHERE id=${jwt_payload.sub}`)
    .then(user=>{
        if (user) {
            console.log(user,'passport')
            // Since we are here, the JWT is valid and our user is valid, so we are authorized!
            return done(null, user);
        } else {
            console.log('Else', 'passport')
            return done(null, false);
        }
    })
    .catch(()=>callback(null,false))
}))

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// LOGINS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

app.post('/users/login', function(req, res, next){

    db.one(`SELECT * FROM users WHERE username='${req.body.username}'`)
    .then((user) => {
            if (!user) {
                res.status(401).json({ success: false, msg: "could not find user" });
            }
            
            // Function defined at bottom of app.js
            const isValid = utils.validPassword(req.body.password, user.password, user.salt);
            
            if (isValid) {
                const tokenObject = utils.issueJWT(user);
                res.status(200).json({ success: true, token: tokenObject.token, expiresIn: tokenObject.expires });
            } else {
                res.status(401).json({ success: false, msg: "you entered the wrong password" });
            }
    
        })
        .catch((err) => {   
            next(err);
        });
});

app.post('/users/register', async function(req, res, next){

    const saltHash = utils.genPassword(req.body.password);    
    const salt = saltHash.salt;
    const hash = saltHash.hash;

    await db.none(`INSERT INTO users (username,password,salt,firstName,lastName,email,streetaddress,city,state,zipcode,race,gender,birthdate) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,[req.body.username,hash,salt,req.body.firstName,req.body.lastName,req.body.email,req.body.streetAddress,req.body.city,req.body.state,req.body.zipcode,req.body.race,req.body.gender,req.body.birthdate])

});

// app.post('/login/survey', async (req, res, next) => {
//     let isValid = await User.storeUsersCauses(req.body.cause1, req.body.cause2, req.body.cause3, req.user.username)
//     if(isValid){
//         res.send(isValid)
//     } else {
//         res.redirect('/#/Survey')
//     }
// })

app.get('/user', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.isAuthenticated()) {
        // Send the route data 
        res.status(200).send(req.user);
    } else {
        // Not authorized
        res.status(401).send('You are not authorized to view this');
    }
});

app.post('/user/profilePic/:username', async (req,res)=>{
    if(req.files === null) {
        return res.status(400).json({msg:'No file uploaded'})
    }
    const now = Date.now()
    const file = req.files.file
    file.mv(`/Users/dylan/dc_projects/actapp-protest/public/images/${now}_${file.name}`, err => {
        return res.status(500).send(err)
    })
    await User.updateProfilePic(`/images/${now}_${file.name}`,req.params.username)
    res.json({ fileName: file.name, filePath: `/images/${file.name}`})
})

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// POLICIES
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

app.get('/policies', async (req,res)=>{
    let policies = await Policy.getPolicyByEvent(1)
    res.send(policies)
})

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// POSTS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

app.get('/posts', async (req,res)=>{
    let posts = await Post.getAllPosts()
    res.send(posts)
})

// app.post('/addPost/:event_id', async (req,res)=>{
//     console.log(req.body,'218')
//     let post = await Post.addPost(req.body.picurl,req.body.body,req.user.username,req.params.event_id)
//     console.log(post,'220')
//     return res.send(post)
// })
  
  app.post('/upload', async (req,res)=>{
      console.log(req.body,'146')
      console.log(req.files,'147')
    if(req.files === null) {
        return res.status(400).json({msg:'No file uploaded'})
    }

    const now = Date.now()

    const file = req.files.file
    // console.log(req.body.postText,'234')
    file.mv(`/Users/dylan/dc_projects/actapp/public/images/${now}_${file.name}`, async err => {
        console.log(err)
        if(err){
            return res.status(500).send(err)
        }
        await Post.addPost(`/images/${now}_${file.name}`,req.body.postText,req.user.username)
        return res.json({ fileName: file.name, filePath: `/images/${file.name}`})
    })
})

// app.get('/usersPosts', async (req,res)=>{
//     let posts = await Post.getPostsByUser(req.user.username)
//     res.send(posts)
// })

app.get('/comments', async (req,res)=>{
    let comments = await Post.getAllComments()
    res.send(comments)
})


app.get('/comments/:post_id', async (req,res)=>{
    let comments = await Post.getCommentsByPost(req.params.post_id)
    res.send(comments)
})

app.post('/addComment/:comment/:postId/:userId/:username', async (req,res)=>{
    let comment = await Post.addComment(req.params.comment,req.params.userId,req.params.username,req.params.postId)
    return res.send(comment)
})

app.get('/likes/:post_id', async (req,res)=>{
    let likes = await Post.getLikesByPost(req.user.id,req.params.post_id)
    res.send(likes)
})

app.get('/likes', async (req,res)=>{
    let likes = await Post.getAllLikes()
    res.send(likes)
})

app.post('/addLike/:postId/:userId', async (req,res)=>{
    let addedLike = await Post.addLike(req.params.userId,req.params.postId)
    return res.send(addedLike)
})

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// ACTIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

app.get('/actions', async (req,res)=>{
    res.send(await Actions.getAllActions())
})

app.get('/actions/resources', async (req,res)=>{
    // res.send(await Actions.getAllActions())
})

app.get('/actions/resources/:actionId', async (req,res)=>{
    res.send(await Actions.findActionResources(req.params.actionId))
})

app.listen(port)