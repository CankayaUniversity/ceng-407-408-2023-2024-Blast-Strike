import express from 'express';
import cors from 'cors';
import { getUsers,createUser,fetchCurrentUserData,sendFriendRequest,addFriends,deleteAcceptedRequest,displayFriends,fetchFriendRequests } from './DatabaseService/UsersService.js';
import { getLobby,createLobby,addPlayer,getLobbyData,getLobbyIdByLobbyName,startLobby, sendInvitation, deleteAcceptedInvitations, fetchInvitations } from './DatabaseService/LobbyService.js';
import { hitPlayer } from './DatabaseService/gameService.js';
import { getGpsLocation } from './DatabaseService/gpsService.js';
import { db } from './DatabaseService/firebaseConfig.js';

const app = express();

app.use(express.json());
app.use(cors());

//'http://10.0.2.2:8081','http://localhost:8081','exp://192.168.1.130:8081' thoose are the http req senders for possible axios-expo go network error.
app.use(cors({
    origin: ['*',], // Allow requests from this origin
    methods: ['GET', 'POST','PUT','DELETE'], // Allow specific HTTP method
    allowedHeaders: ['Content-Type', 'Authorization','Origin','X-Api-Key','X-Requested-With','Accept'], // Allow specific headers
}));

//Users

app.get('/getUsers',async (req,res)=> {
    const data=req.body;
    await  getUsers(db,req.body);
    res.send({msg:'Users Get'})
})

app.post('/createUser',async (req,res)=> {
    const data=req.body;
    await createUser(db,data);
    res.send({msg:'User Added'})
})

app.post('/fetchCurrentUserData', async (req, res) => {
    console.log("fetchCurrentUserData endpoint hit");
    try {
        const data = req.body; // Directly accessing the body as you're expecting a JSON payload
        const currentUserData = await fetchCurrentUserData(db, data);
        console.log("Fetched user username:", currentUserData.username);
        // Assuming currentUserData directly contains the username or relevant user info
        res.send({ username: currentUserData.username });
    } catch (error) {
        console.log('Server error fetching user data:', error);
        res.status(500).send({ msg: 'Server error fetching user data' });
    }
});

app.post('/sendFriendRequest', async (req, res) => {
    console.log("sendFriendRequest endpoint hit");

    const data = req.body; // Assuming `data` is the direct body content.
    console.log(data.data.to_username,data.data.from_username);

    // Simple validation
    if (!data || !data.data.to_username || !data.data.from_username || typeof data.data.status === 'undefined') {
        return res.status(400).send({ error: 'Missing required fields' });
    }

    try {
        await sendFriendRequest(db, data);
        res.send({ msg: 'Request sent' });
    } catch (error) {
        // Use specific status codes for different types of errors if possible
        let statusCode;
        statusCode = error.message === "User is not found." ? 404 : error.message === "Friendship request already exists between these users." ? 409 : 400;
        res.status(statusCode).send({ error: error.message });
    }
});

app.post('/addFriends',async(req,res)=>
{
    console.log("addFriends endpoint hit");
    const data=req.body;
 
    addFriends(db,data);
    res.send({msg:'Request sended'});
});
app.post('/fetchFriendRequests', async (req, res) => {
    console.log("fetchFriendRequest endpoint hit");
    try {
        const data = req.body;
        // Await the completion of the fetchFriendRequests function to get the data
        const friendRequests = await fetchFriendRequests(db, data);
        console.log("in post Friend Requests");
        //console.log(friendRequests);
        // Send the fetched data in the response
        res.send({ FriendRequests: friendRequests });
    } catch (error) {
        console.log('Server error fetching user data:', error);
        // It's a good practice to return a meaningful HTTP status code
        res.status(500).send({ msg: 'Server error fetching user data' });
    }
});
app.post('/deleteAcceptedRequests', async (req, res) => {
    console.log("deleteAcceptedRequests endpoint hit");
    try {
        const data = req.body;
        // Await the completion of the fetchFriendRequests function to get the data
        await deleteAcceptedRequest(db,data);
      
      
        res.send({ msg:"Successfully deleted" });
    } catch (error) {
        console.log('Delete accepted request error', error);
        // It's a good practice to return a meaningful HTTP status code
        res.status(500).send({ msg: 'delete accepted request error' });
    }
});
app.post('/displayFriends', async (req, res) => {
    console.log("Display friends endpoint");
    try {
        const data = req.body // Assuming the body contains a 'username'
        console.log("data is",data);
        const friendsList = await displayFriends(db,data); // Corrected data structure
        res.json(friendsList); // Respond with the friend list
    } catch (error) {
        console.log('Server error fetching user data:', error);
        res.status(500).send({ msg: 'Server error fetching user data' });
    }
});

app.post('/sendInvitation', async (req, res) => {
    console.log("sendInvitation endpoint hit");

    const data = req.body;
    console.log(data.data.to_username,data.data.from_username);

    if (!data || !data.data.to_username || !data.data.from_username || !data.data.lobbyName) {
        return res.status(400).send({ error: 'Missing required fields' });
    }

    try {
        await sendInvitation(db, data);
        res.send({ msg: 'Request sent' });
    } catch (error) {
        let statusCode;
        statusCode = error.message === "User is not found." ? 404 : error.message === "Invitation already exists." ? 409 : 400;
        res.status(statusCode).send({ error: error.message });
    }
});

app.post('/fetchInvitations', async (req, res) => {
    console.log("fetchInvitations endpoint hit");
    try {
        const data = req.body;
        const activeInvitations = await fetchInvitations(db, data);
        console.log("in post Invitations");
        res.send({ ActiveInvitations: activeInvitations });
    } catch (error) {
        console.log('Server error fetching user data:', error);
        res.status(500).send({ msg: 'Server error fetching user data' });
    }
});

app.post('/deleteAcceptedInvitations', async (req, res) => {
    console.log("deleteAcceptedInvitations endpoint hit");
    try {
        const data = req.body;
        await deleteAcceptedInvitations(db,data);


        res.send({ msg:"Successfully deleted" });
    } catch (error) {
        console.log('Delete accepted invitation error', error);
        res.status(500).send({ msg: 'Delete accepted invitation error' });
    }
});


//Lobby

app.get('/getLobby',async (req,res)=> {
    await getLobby(db,req.body);
    res.send({msg:'Lobby get'})
})

app.post('/createLobby',async (req,res)=> {
    try {
        await createLobby(db,req.body);
        res.send({msg:'Lobby Added'})
    } catch (error) {
        // Use specific status codes for different types of errors if possible
        let statusCode;
        statusCode = error.message === "Lobby name must be unique, please change the name." ? 409 : error.message === "Selected team cannot be empty." ? 404: 400;
        console.log(statusCode);
        res.status(statusCode).send({ error: error.message });
    }
})

app.put('/Lobby/addPlayer',async (req,res)=> {
    try {
        let lobbyDocId =await addPlayer(db,req.body);
        res.send({lobbyDocId})
    } catch (error) {
        // Use specific status codes for different types of errors if possible
        let statusCode;
        statusCode = error.message === "Team is full!" ? 422 : "You joined the opposite team before, cannot also join this team." ? 409 : 
        error.message === "No lobby document found with the specified lobbyName." ? 404: 400;
        res.status(statusCode).send({ error: error.message });
    }
})

app.post('/Lobby/getLobbyData',async (req,res) => {
    let documentId = await getLobbyIdByLobbyName(db,req.body.data['lobbyName']);
    //console.log("documentId", documentId);
    let data = await getLobbyData(db,documentId );
   //console.log("1231231 data", data);
    res.json(data);
    
})

app.put('/Lobby/start',async (req,res)=> {
    console.log("req.body.data",req.body.data);
    await startLobby(db,req.body.data);
    res.send({msg:'Lobby Started'})
})

//Game
app.put('/Game/hit',async (req,res) => {

    //let documentId = req.body.data['documentId'];
    let hitCheck = await hitPlayer(db,req.body.data);
    res.send({'result':hitCheck});
})

app.put('/Game/Gps',async (req,res) => {

    await getGpsLocation(db,req.body.data);
    res.json(true);
})


app.listen(4000,()=>console.log("backend running"))