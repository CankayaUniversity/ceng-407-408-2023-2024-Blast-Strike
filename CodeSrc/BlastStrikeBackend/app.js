import express from 'express';
import cors from 'cors';
import { getUsers,createUser,fetchCurrentUserData } from './DatabaseService/UsersService.js';
import { getLobby,createLobby,addPlayer,getLobbyData,getLobbyIdByLobbyName } from './DatabaseService/LobbyService.js';
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
        console.error('Server error fetching user data:', error);
        res.status(500).send({ msg: 'Server error fetching user data' });
    }
});

//Lobby

app.get('/getLobby',async (req,res)=> {
    await getLobby(db,req.body);
    res.send({msg:'Lobby get'})
})

app.post('/createLobby',async (req,res)=> {
    await createLobby(db,req.body.data);
    res.send({msg:'Lobby Added'})
})

app.put('/Lobby/addPlayer',async (req,res)=> {
    await addPlayer(db,req.body);
    res.send({msg:'Player joined'})
})

app.post('/Lobby/getLobbyData',async (req,res) => {
    let documentId = await getLobbyIdByLobbyName(db,req.body.data['lobbyName']);
    console.log("1231231 documentId", documentId);
    let data = await getLobbyData(db,documentId );
    console.log("1231231 data", data);
    res.json(data);
    
})

app.put('/Lobby/joinLobby',async (req,res) => {
    await addPlayer(db,req.body);
    res.send({msg:'Player joined'})
})

app.listen(4000,()=>console.log("backend running"))