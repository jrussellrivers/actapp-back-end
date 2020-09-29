# Welcome To actapp
![rmbanner](https://github.com/dstonem/actapp_capstone_react_native/blob/master/images/actcoin_logo.png)
## Link to live site: https://actapp.us/

## Link to front-end code: https://github.com/jrussellrivers/actapp

## Overview: 
Actapp is a social media experience with tailored resources to help people take action, communities of people who care about the same issues, and an online culture of hope and real, measurable action.

## The Team:
### Dylan Stone-Miller: https://github.com/dstonem
**Primary team role:** Team Lead; Front-End markup and styling, Javascript Function writer

**Contributions:** Conceived the idea of actapp and the general layout of the app. Brought in the backend routing from previous version of actapp. Developed most of the functionality for Login, Register, Action, ActionsResources, Search, and Navbar components. Helped create dynamic Feed to render posts, comments, and likes. Implemented React-Native styling to make responsive app for use on any mobile device.

### Jordan Rivers: https://github.com/jrussellrivers
**Primary team role:** Javascript Function writer

**Contributions:** Wrote the format to create and manage states in Redux. Developed most of the functionality for Survey, Likes, Comments, Profile, Post, MyCommunity, and Notifications components. Helped create dynamic Feed to render posts, comments, and likes.

## What we used:
### Languages:
- React
- React Native
- Redux
- JavaScript
- Node
- Express
- SQL

### Other:
- Passport
- JWT
- Expo
- AWS

## MVP (Minimum Viable Product):
- User profiles that can create posts
- Initial design and layout
- Likes and Comments on posts

## Stretch Goals Completed
- Filtered feed based on user preferences
- User search functionality
- Storing images
- Notifications
- User connections via 'My Community'
- Dynamic user profiles based on logged user
- Point system intended to reward users
- Action resources to provide information to users
- Profile editing

## Stretch Goals Future
- Fully deploy a mobile app for Android and iOS
- Uploading video
- Targeted ads
- Photo Editing
- Means to contact local Representatives based on location

## Challenges & Solutions:
### ***Challenge:*** User authentication between front-end and back-end

### ***Solution:*** Set up JWT in order to send the token to the front-end to verify authentication.
___
### ***Challenge:*** Storing information across components.

### ***Solution:*** Implemented redux to be able to access and change the state from within any component.
___
### ***Challenge:*** Many resources and documentation for React-Native use class components.

### ***Solution:*** Came up with functional components that used hooks to run our code.
___
### ***Challenge:*** Correctly storing image files in order to load them on user pages

### ***Solution:*** Stored images as Base64 so that they can be rendered on the front end without saving image files themselves. 

## Code Snippets:
### This code is the basic format we used to create Redux slices to be used in our store.js.
``` javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import url from '../../url'

export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
    const response = await fetch(`${url}/posts`)
    .then(response=>response.json())
    .then(data=>data)
    return response
})

const initialState = {
    posts: [],
    status: 'idle',
    error: null
  }

const postsSlice = createSlice({
name: 'posts',
initialState,
reducers: {
  changeStatus(state, action) {
    state.status = action.payload
  }
},
extraReducers: {
    [fetchPosts.pending]: (state, action) => {
        state.status = 'loading'
      },
    [fetchPosts.fulfilled]: (state, action) => {
    state.status = 'succeeded'
    // Add any fetched posts to the array
    state.posts = action.payload
    },
    [fetchPosts.rejected]: (state, action) => {
    state.status = 'failed'
    state.error = action.error.message
    }
}
})

export const { changeStatus } = postsSlice.actions

export default postsSlice.reducer
```
### This code takes in the comments, likes, and community requests associated with the logged user and displays them base on if they have occured after the last time the user 'cleared notifications'
``` javascript
 const Notifications = () =>{
    const dispatch = useDispatch()

    const user = useSelector(state => state.user.user)
    const comments = useSelector(state => state.comments.comments)
    const likes = useSelector(state => state.likes.likes)
    const community = useSelector(state => state.myCommunity.myCommunity)

    const [userpics,setUserPics] = useState([])

    useEffect(() => {
        fetch(`${url}/userpics/`)
        .then(r=>r.json())
        .then(data=>data)
        .then(d=>setUserPics(d))
    },[])

    let content = null

    if(userpics.length > 0){
        let checkedDate = user.notification_check
        let myComments = comments.filter(comment=>comment.post_username === user.username && comment.user_id !== user.id ? true : false)
        let newComments = myComments.map(comment=>{
            let commenterPic = userpics.find(person => person.id === comment.user_id ? true : false)
            let {profilepic} = commenterPic
            let newComment = {
                type: 'comment',
                content: comment,
                pic: profilepic
            }
            return newComment
        })

        let myLikes = likes.filter(like=>like.post_username === user.username && like.user_id !== user.id ? true : false)
        let newLikes = myLikes.map(like=>{
            let likerPic = userpics.find(person => person.id === like.user_id ? true : false)
            let {profilepic} = likerPic
            let newLike = {
                type: 'like',
                content: like,
                pic:profilepic
            }
            return newLike
        })

        let myCommunity = community.filter(com=>com.user_id === user.id ? true : false)
        let newCommunity = myCommunity.map(com=>{
            let adderPic = userpics.find(person => person.id === com.user_id ? true : false)
            let {profilepic} = adderPic
            let newCom = {
                type: 'community',
                content: com,
                pic:profilepic
            }
            return newCom
        })

        let combined = newComments.concat(newLikes, newCommunity)

        let orderedNotifications = combined
        .slice()
        .sort((a, b) => b.content.created_at.localeCompare(a.content.created_at))

        let filteredDates = orderedNotifications.filter(notification=>notification.content.created_at < checkedDate ? true : false)

        content = filteredDates.map((notification, idx) => {
            if(notification.type === 'comment'){
                return(
                    <View key={idx} style={styles.notificationContainer}>
                        <TouchableOpacity onPress={() => {
                            dispatch(fetchProfileById(notification.content.user_id))
                            dispatch(changePage('profile'))
                        }}><Image source={{uri:notification.pic}} style={styles.img} /></TouchableOpacity>
                        <View style={styles.column}>
                            <Text style={styles.marginLeft}><Text style={styles.bold}>{notification.content.username}</Text> <Text onPress={() => {
                                dispatch(fetchPostById(notification.content.post_id))
                                dispatch(changePage('post'))
                            }}>commented on your post</Text></Text>                            
                            <Text style={styles.gray}>{notification.content.created_at.slice(0,16)}</Text>
                        </View>
                    </View>
                )
            } else if (notification.type === 'community'){
                return(
                    <View key={idx} style={styles.notificationContainer}>
                        <TouchableOpacity onPress={() => {
                            dispatch(fetchProfileById(notification.content.user_id))
                            dispatch(changePage('profile'))
                        }}><Image source={{uri:notification.pic}} style={styles.img} /></TouchableOpacity>
                        <View style={styles.column}>
                            <Text style={styles.marginLeft}><Text style={styles.bold}>{notification.content.username}</Text> <Text onPress={() => {
                                dispatch(fetchProfileById(notification.content.post_id))
                                dispatch(changePage('profile'))
                            }}>added you to their community</Text></Text>
                            <Text style={styles.gray}>{notification.content.created_at.slice(0,16)}</Text>
                        </View>
                    </View>
                )
            } else {
                return(
                    <View key={idx} style={styles.notificationContainer}>
                        <TouchableOpacity onPress={() => {
                            dispatch(fetchProfileById(notification.content.user_id))
                            dispatch(changePage('profile'))
                        }}><Image source={{uri:notification.pic}} style={styles.img} /></TouchableOpacity>
                        <View style={styles.column}>
                            <Text><Text style={styles.bold}>{notification.content.username}</Text> <Text onPress={() => {
                                dispatch(fetchPostById(notification.content.post_id))
                                dispatch(changePage('post'))
                            }}>liked your post</Text></Text>
                            <Text style={styles.gray}>{notification.content.created_at.slice(0,16)}</Text>
                        </View>
                    </View>
                )
            }
        }) 
    } else {
        content = <Text>Loading...</Text>
    }
    return(
        <View style={styles.main}>
            {content}
            <TouchableOpacity onPress={()=>{
                let currentTime = new Date().toUTCString()
                changeNoteDateDB(currentTime, user.id)
                dispatch(changeNotificationDate(currentTime))
            }} style={styles.button}><Text style={styles.gray}>CLEAR NOTIFICATIONS</Text></TouchableOpacity>
        </View>
    )

}
```
### This snippet represents the logic behind searching for other users on the site
```javascript
const Search = () => {
    const dispatch = useDispatch()

    const page = useSelector(state => state.page.pageName)

    const [users,setUsers] = useState()
    const [searchTerm,setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState([]);

    const onChange = text => {
        setSearchTerm(text)
    }

    useEffect(() => {
        fetch(`${url}/searchUsers/`)
        .then(r=>r.json())
        .then(data=>setUsers(data))
    },[])

    useEffect(() => {
        let results
        if(searchTerm){
            results = users.filter(person =>
                person.username.toLowerCase().includes(searchTerm)
            );
        }
        setSearchResults(results);
    }, [searchTerm]);

    return (
        <View style={{marginTop:15}}>
            <TextInput placeholder=" 🔍 Search" onChangeText={text=>onChange(text)} style={{height:36,width:width-50}} />
            {searchResults ? searchResults.map((user,idx)=><TouchableOpacity key={idx} onPress={() => {dispatch(fetchProfileById(user.id));dispatch(changePage('profile'));}} style={{flex:1, flexDirection:'row',alignItems:'center'}}><Image source={{uri: user.profilepic}} style={{height: 40, width: 40,borderRadius:50,marginRight:7}}/><Text>{user.username}</Text></TouchableOpacity>) : null}
        </View>
    )
}
```
### This code allowed us to use a funtional component to upload and store an image
``` javascript
export default function ProfilePic() {

    const dispatch = useDispatch()

    const registeredUser = useSelector(state => state.registeredUser.registeredUser)

    const [image,setImage] = useState(null)

    useEffect(() => {
        getPermissionAsync();
    }, [])

    const getPermissionAsync = async () => {
        if (Platform.OS !== 'web') {
          const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
          if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
          }
        }
      };

    const  _pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0,
            });
            if (!result.cancelled) {
                let localUri = result.uri;
                let filename = localUri.split('/').pop();
                // Infer the type of the image
                let match = /\.(\w+)$/.exec(filename);
                let type = match ? `image/${match[1]}` : `image`;
                result.filename = filename
                result.type = type
                setImage(result);
            }
            return result
        } catch (E) {
            console.log(E);
        }
    };

    const _uploadToDB = async () => {
            
            const img = JSON.stringify({ uri: image.uri, name: image.filename, type: image.type})    

            return await fetch(`${url}/user/profilePic/${registeredUser.id}`, {
                method: 'POST',
                body: img,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

    return (
        <View style={styles.container}>
            <View style={styles.imageBackground}>
                <Image source={{uri:assets.fist.uri}} style={{height:100,width:100,margin:'auto'}} />
            </View>
            <TouchableOpacity onPress={_pickImage} style={styles.button}>
                <Text style={styles.green}>SELECT A PROFILE PICTURE</Text>
            </TouchableOpacity>
            {image && <Image source={{ uri: image.uri }} style={{ width: width, height: width, borderRadius:400 }} />}
            {image && <TouchableOpacity onPress={
                async ()=>{
                    await _uploadToDB()
                    dispatch(changePage('login'))
                }
            } style={styles.button}>
                <Text style={styles.green}>UPLOAD</Text>
            </TouchableOpacity>}
        </View>
    )
}
```


