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
// const bodyParser = require('body-parser')

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

app.use(express.json({limit: '5mb', extended: true}))
app.use(express.static(__dirname+"/site"))
app.use(cors())
app.use(express.urlencoded({extended: true, limit: '5mb'}))
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
            // Since we are here, the JWT is valid and our user is valid, so we are authorized!
            return done(null, user);
        } else {
            return done(null, false);
        }
    })
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

    const registeredUser = await db.one(`INSERT INTO users (username,password,salt,firstName,lastName,email,streetaddress,city,state,zipcode,race,gender,birthdate) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,[req.body.username,hash,salt,req.body.firstName,req.body.lastName,req.body.email,req.body.streetAddress,req.body.city,req.body.state,req.body.zipcode,req.body.race,req.body.gender,req.body.birthdate])
    res.send(registeredUser)
});

app.post('/register/survey/:cause/:user_id', async (req, res, next) => {
    let result = await User.addCause(req.params.cause, req.params.user_id)
    res.send(result)
})

app.get('/user', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.isAuthenticated()) {
        // Send the route data 
        res.status(200).send(req.user);
    } else {
        // Not authorized
        res.status(401).send('You are not authorized to view this');
    }
});

app.post('/user/profilePic/:user_id', async (req,res)=>{
    await User.updateProfilePic(req.body.uri, req.params.user_id)
    res.send('file uplaoded')
})

app.get('/user/:id', async (req,res)=>{
    let user = await User.getUserById(req.params.id)
    res.send(user)
})

app.get('/searchUsers/', async (req, res, next) => {
    // if (req.isAuthenticated()) {
        console.log('136')
        const users = await User.getAllUsers()
        console.log(users,'138')
        res.send(users);
    // } else {
    //     // Not authorized
    //     res.status(401).send('You are not authorized to view this');
    // }
});

app.get('/userpics', async (req,res)=>{
    let pics = await User.getAllUserPics()
    res.send(pics)
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

app.get('/post/:id', async (req,res)=>{
    let post = await Post.getPostById(req.params.id)
    console.log(post, 'line 157')
    res.send(post)
})

// app.post('/addPost/:event_id', async (req,res)=>{
//     console.log(req.body,'218')
//     let post = await Post.addPost(req.body.picurl,req.body.body,req.user.username,req.params.event_id)
//     console.log(post,'220')
//     return res.send(post)
// })

/////////////////////////////// Code for saving an image to backend Folder and DB
//   app.post('/upload/:username/:user_id', async (req,res)=>{
//       console.log(req.body,'182')
//     //   console.log(req.files,'147')
//     // if(req.body === null) {
//     //     return res.status(400).json({msg:'No file uploaded'})
//     // }

//     const now = Date.now()
//     console.log('189')//replace png below with the filetype from the beginning of the uri
//     let results = fs.writeFile(__dirname + '/images/' + `${now}_${req.body.name}.${req.body.uri.split('data:image/').pop().split(';base64,').shift()}`, req.body.uri.split(';base64,').pop(),{encoding: 'base64'},async ()=>{await Post.addPost(`/images/${now}_${req.body.name}.${req.body.uri.split('data:image/').pop().split(';base64,').shift()}`,req.body.text,req.params.username,req.params.user_id)})

//     console.log(req.body.uri.split('data:image/').pop().split(';base64,').shift(),'192')
//     console.log(results)

//     res.send('file uplaoded')

// })

app.post('/upload/:username/:user_id', async (req,res)=>{
    await Post.addPost(req.body.uri,req.body.text,req.params.username,req.params.user_id,req.body.cause,req.body.action,req.body.points)
    res.send('file uplaoded')
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

app.get('/images/:url', async (req,res)=>{
    let img = require(`http://localhost:3333${req.params.url}`)
    return res.send(img)
})

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// ACTIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

app.get('/causes', async (req,res)=>{
    res.send(await Actions.getAllCauses())
})

app.get('/actions/:cause', async (req,res)=>{
    res.send(await Actions.getActionsByCause(req.params.cause))
})

app.get('/actions/id/:action_id', async (req,res)=>{
    console.log(req.params.action_id,'258')
    res.send(await Actions.getActionById(req.params.action_id))
})

app.get('/actions', async (req,res)=>{
    res.send(await Actions.getAllActions())
})

app.get('/actions/resources', async (req,res)=>{
    // res.send(await Actions.getAllActions())
})

app.get('/actions/resources/:actionId', async (req,res)=>{
    res.send(await Actions.findActionResources(req.params.actionId))
})

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// Points
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

app.post('/updatePoints/:value/:userId', async (req,res)=>{
    await User.updatePoints(req.params.value, req.params.userId)
    return res.send('Added')
})

app.post('/updatePointsStatus/:postId', async (req,res)=>{
    await Post.updatePointStatus(req.params.postId)
    return res.send('changed')
})

app.listen(port)