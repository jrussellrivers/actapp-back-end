const express = require('express')
const app = express()
const cors = require('cors')
const {secret} = require('./config')
const port = 3333
const session = require('express-session')
const eS = session(secret)
// const passport = require('passport')
// const Strategy = require('passport-local').Strategy
// const bcrypt = require('bcrypt')
// const SALT_ROUNDS = 10
const db = require('./db_connection')
const multer = require('multer')
const fileUpload = require('express-fileupload')
require('./models/user');

const User = require('./models/users-db-logic')()
// const Policy = require('./models/policies-db-logic')()
const Post = require('./models/posts-db-logic')()
// const Actions = require('./models/actions-db-logic')()

const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt;
const fs = require('fs');
const path = require('path');
const passport = require('passport')
const pathToKey = path.join(__dirname, './lib/jwtRS256.pem');
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
// app.use(passport.initialize());
// app.use(passport.session());
app.use(require('./routes'));

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
}))
app.get('/user', passport.authenticate('jwt', { session: false }), (req, res, next) => {
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

const checkIsLoggedIn = (req,res,next) =>{
    if(req.isAuthenticated()) return next()
    return res.send('error')
}

const createUser = async (req,res,next) => {
    console.log(req.body)
    let hash = await bcrypt.hash(req.body.password, SALT_ROUNDS)
    let newUser = await db.one(`INSERT INTO users (username,password,firstName,lastName,email,streetaddress,city,state,zipcode,race,gender,birthdate) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,[req.body.username,hash,req.body.firstName,req.body.lastName,req.body.email,req.body.streetaddress,req.body.city,req.body.state,req.body.zipcode,req.body.race,req.body.gender,req.body.birthdate])
    next()
    return newUser
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// LOGINS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// app.post('/login', passport.authenticate('local'), (req,res) => {
//     console.log('othrer routes')
//     res.send(req.user)
// })

//XXXXXXXXXXX figure out how to send the right thing and automatically redirect to login from the frontend
app.post('/login/register', createUser, async (req,res,next) => {
    res.send(req.user)
})

// app.post('/login/survey', async (req, res, next) => {
//     let isValid = await User.storeUsersCauses(req.body.cause1, req.body.cause2, req.body.cause3, req.user.username)
//     if(isValid){
//         res.send(isValid)
//     } else {
//         res.redirect('/#/Survey')
//     }
// })

// app.get('/user', (req,res)=>{
//     console.log('start')
//     console.log(req.user)
//     // let user = await User.getUser(req.user.username)
//     res.send(req.user)
// })

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

// app.get('/posts/:event_id', async (req,res)=>{
//     let posts = await Post.getPostsByEvent(req.params.event_id)
//     res.send(posts)
// })

// app.post('/addPost/:event_id', async (req,res)=>{
//     console.log(req.body,'218')
//     let post = await Post.addPost(req.body.picurl,req.body.body,req.user.username,req.params.event_id)
//     console.log(post,'220')
//     return res.send(post)
// })

const Storage = multer.diskStorage({
    destination(req, file, callback) {
      callback(null, './images')
    },
    filename(req, file, callback) {
      callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`)
    },
  })
  
const upload = multer({ storage: Storage })

app.post('/upload', upload.array('photo', 3), async (req, res) => {
    console.log('file', req.files)
    console.log('body', req.body)
    //NEED TO EDIT ADDPOST DB QUERY LOGIC
    await Post.addPost(req.body.picurl,req.body.body,'dstonem')
    res.status(200).json({
      message: 'success!',
    })
})
///////////////////////////////////////////////////////////////////////IMAGE UPLOAD LOGIC WE TRIED
var fs = require('fs');
// var upload = multer({ dest: 'uploads/' }); //setting the default folder for multer

// app.post('/upload',upload.single('photo'), (req, res,next) => {
//     // console.log(req,'169')
//     console.log(req.file,'170');//this will be automatically set by multer
//     console.log(req.body,'171');
//     //below code will read the data from the upload folder. Multer     will automatically upload the file in that folder with an  autogenerated name
//     fs.readFile(req.file.path,(err, contents)=> {
//     if (err) {
//         console.log('Error: ', err);
//     }else{
//         console.log('File contents ',contents);
//     }
//     });
// });

/////////////////////////////////////////////////////////////////////// END OF IMAGE UPLOAD LOGIC WE TRIED

app.get('/usersPosts', async (req,res)=>{
    let posts = await Post.getPostsByUser(req.user.username)
    res.send(posts)
})

app.post('/upload/:event_id', async (req,res)=>{
    if(req.files === null) {
        return res.status(400).json({msg:'No file uploaded'})
    }

    const now = Date.now()

    const file = req.files.file
    console.log(req.body.postText,'234')
    file.mv(`/Users/dylan/dc_projects/actapp-protest/public/images/${now}_${file.name}`, async err => {
        console.log(err)
        if(err){
            return res.status(500).send(err)
        }
        await Post.addPost(`/images/${now}_${file.name}`,req.body.postText,req.user.username,req.params.event_id)
        return res.json({ fileName: file.name, filePath: `/images/${file.name}`})
    })
})

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

app.get('/actions/resources', async (req,res)=>{
    res.send(await Actions.getAllActions())
})

app.get('/actions/resources/:action', async (req,res)=>{
    res.send(await Actions.findActionResources(req.params.action))
})

app.listen(port)