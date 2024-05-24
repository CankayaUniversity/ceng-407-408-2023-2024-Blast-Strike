import { collection, getDocs, getDoc,addDoc,query,where,doc,updateDoc} from 'firebase/firestore/lite';
import { getUser } from './UsersService.js';

const teamSize=5;


async function getLobby(db) {
    const lobbyColm = collection(db, 'Lobby');
    const LobbySnapshot = await getDocs(lobbyColm);
    const lobbyList = LobbySnapshot.docs.map(doc => doc.data()); 
    return lobbyList;
}

async function createLobby(db, data) {
    try {
        let lobbyList= await getLobby(db);
        // To use lobby names as a identifier of a database doc we checking if the our lobby doc has duplicate
        lobbyList.forEach(lobby => {
            if(lobby.lobbyName == data.lobbyName) {
                throw new Error("Lobby name must be unique, please change the name.");
            }
            if(data.selectedTeam == '') {
                throw new Error("Selected team cannot be empty.");
            }
        });

         const docRef = await addDoc(collection(db, 'Lobby'), {
            lobbyName: data.lobbyName,
            lobbyAdmin:data.username,
            inGame:false,
            scoreRed:0,
            scoreBlue:0,
            teamRed:[],
            teamBlue:[]    
        });
        console.log('Lobby created successfully with ID:', docRef.id);
        await addPlayer(db,data);

    } catch (error) {
        console.log('Error creating Lobby:', error.message);
        console.log(error.message);
        throw error;
    }
}


async function addPlayer(db, data) {
    /*
    data includes:

    {
        players name,
        attempting lobbyName,
        which team to join (red , blue)
    }
    
    */
    try {
        //Check if lobby exists
        const lobbyRef = collection(db, 'Lobby');
        const q = query(lobbyRef, where('lobbyName', '==', data.lobbyName));
        const querySnapshot = await getDocs(q);

        let usernameExistsInRed = false;
        let usernameExistsInBlue = false;

        if (!querySnapshot.empty) {
            querySnapshot.forEach((doc) => {
                const l_data = doc.data();

                //Check if the username exists in teamRed
                for (const playerKey in l_data.teamRed) {
                    if (l_data.teamRed[playerKey].username === data.username) {
                        usernameExistsInRed = true;
                        break;  // Exit the loop early if username is found
                    }
                }
                //Check if the username exists in teamBlue
                if (!usernameExistsInRed) {
                    for (const playerKey in l_data.teamBlue) {
                        if (l_data.teamBlue[playerKey].username === data.username) {
                            usernameExistsInBlue = true;
                            break;  // Exit the loop early if username is found
                        }
                    }
                }
            });
        }

        if ((data.selectedTeam === "teamRed" && usernameExistsInBlue) || (data.selectedTeam === "teamBlue" && usernameExistsInRed)) {
            throw new Error("You joined the opposite team before, cannot also join this team.");
        }
        else if ((data.selectedTeam === "teamRed" && usernameExistsInRed) || (data.selectedTeam === "teamBlue" && usernameExistsInBlue)) {
            return;
        }

        // burdaki player name yapısı şimdilik sadece username olarak kullanılabilir ilerki güncellemelerde burada username üzerinden kullanıcnın player hesabını çektiğimiz yer olucak

       // const playerName= await getUser(data.username);
        let playerName= data.username;
        console.log("playerName",playerName);
        console.log(data);

        let lobbyData = {
            "username" :playerName,
            "health" : 100
        }
        
       // enables to get and update lobby data fields
        const lobbyDocId =await getLobbyIdByLobbyName(db,data.lobbyName)

        console.log("lobbyydocccc add player",lobbyDocId);
        // ref to doc with id
        const docRef = doc(db, 'Lobby', lobbyDocId);

        //our main control object    
        let lobby =await getLobbyData(db,lobbyDocId);

        console.log("lobby",lobby);
        console.log("data",data);
        
        if(lobby!==undefined || lobby!==null)
        {
            console.log("lobby[data.selectedTeam]",lobby[data.selectedTeam]);
            // console.log("lobby.teamRed.length",lobby.teamRed.length);

            //checking for team decided to join got space to 

            if(lobby[data.selectedTeam].length<5)
            {
                let newTeam = lobby[data.selectedTeam];
                newTeam.push(lobbyData)
                console.log("newTeam",newTeam);
                //adding player
                await updateDoc(docRef, {
                    [data.selectedTeam]: newTeam
                });
            }
            else
                throw new Error("Team is full!");

                return lobbyDocId;
        }
        else
            throw new Error("Invalid Lobby name entered. Please check the lobby name.");

    } catch (error) {
        console.error('Error adding player : ', error);
        throw error;
    }
}


async function getLobbyIdByLobbyName(db,lobbyName) {
    try {
        // Reference to the "lobby" collection
        const lobbyCollectionRef = collection(db, 'Lobby');
        
        // Create a query to search for documents where the "lobbyName" field matches the desired value
        const q = query(lobbyCollectionRef, where('lobbyName', '==', lobbyName));
        
        // Execute the query
        const querySnapshot = await getDocs(q);

        // Check if any documents match the query
        if (!querySnapshot.empty) {
            // Get the document ID of the first matching document
            const lobbyDocId = querySnapshot.docs[0].id;
           // console.log('Lobby document ID:', lobbyDocId);
            return lobbyDocId;
        } else {
            console.log('No lobby document found with the specified lobbyName.');
            throw new Error ("No lobby document found with the specified lobbyName.");
        }
    } catch (error) {
        console.error('Error getting lobby ID:', error);
        throw error;
    }
}

async function getLobbyData(db,documentId) {
    console.log(" get lobby documentId",documentId);
    try {
        // Reference to the document using its ID
        const docRef = doc(db, 'Lobby', documentId);

        // Fetch the document
        const docSnapshot = await getDoc(docRef);

        // Check if the document exists
        if (docSnapshot.exists()) {
            // Access the field values from the document data
            const data = docSnapshot.data();
            //adding document Id for subscription (onSnapshot)
            data['documentId']=documentId;
            return data;
        } else {
            console.log('Document does not exist');
            return null;
        }
    } catch (error) {
        console.error('Error getting document data:', error);
        throw error;
    }
}

async function startLobby (db,data) {
    var documentId=data.lobbyDocId;
    try {
        // Reference to the document using its ID
        const docRef = doc(db, 'Lobby', documentId);
        if (docRef) {
            await updateDoc(docRef, 
                {inGame: true}
            );
        } else {
            console.log('Document does not exist');
            return null;
        }
    } catch (error) {
        console.error('Error getting document data:', error);
        throw error;
    }
}



async function deleteLobby(db) {

    //TODO OYUN BİTTİKTEN SONRA LOBİNİN SİLİNMESİ

}





export { getLobby, createLobby,addPlayer,getLobbyData,getLobbyIdByLobbyName,startLobby };