import express from 'express';
import cors from 'cors';
import { getUsers,createUser } from './Database/dbUsers.js';
import { getLobby,createLobby,addPlayer } from './Database/dbLobby.js';
import { db } from './Database/firebaseConfig.js';

const app = express();

app.use(express.json());
app.use(cors());

app.use(cors({
    origin: ['*'], // Allow requests from this origin
    methods: ['GET', 'POST','PUT','DELETE'], // Allow specific HTTP method
    allowedHeaders: ['Content-Type', 'Authorization','Origin','X-Api-Key','X-Requested-With','Accept'], // Allow specific headers
    //allowedHeaders: ['*'], // Allow specific headers
    
}));

//Users

app.get('/getUsers',async (req,res)=> {
    const data=req.body;
    getUsers(db,req.body);
    res.send({msg:'Users Get'})
})

app.post('/createUser',async (req,res)=> {
    const data=req.body;
    createUser(db,data);
    res.send({msg:'User Added'})
})

//Lobby

app.get('/getLobby',async (req,res)=> {
    getLobby(db,req.body);
    res.send({msg:'Lobby get'})
})

app.post('/createLobby',async (req,res)=> {
    console.log("req.body.data",req.body.data);
    createLobby(db,req.body.data);
    res.send({msg:'Lobby Added'})
})

app.put('/Lobby/addPlayer',async (req,res)=> {
    addPlayer(db,req.body);
    res.send({msg:'Player joined'})
})



app.listen(4000,()=>console.log("backend running"))