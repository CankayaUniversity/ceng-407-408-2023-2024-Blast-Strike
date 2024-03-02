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
            if(lobby.lobbyName==data.lobbyName)
            throw new Error('Lobby name ' + data.lobbyName+' must be unique,try to change name');
        });

         const docRef = await addDoc(collection(db, 'Lobby'), {
            lobbyName: data.lobbyName,
            teamRed:[],
            teamBlue:[]    
        });
        console.log('Lobby created successfully with ID:', docRef.id);

    } catch (error) {
        console.error('Error creating Lobby:', error);
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
        // burdaki player name yapısı şimdilik sadece userName olarak kullanılabilir ilerki güncellemelerde burada username üzerinden kullanıcnın player hesabını çektiğimiz yer olucak

        const playerName= await getUser(data.userName);
       // let playerName= data.userName;
       console.log("playerName",playerName);

       // enables to get and update lobby data fields
       const lobbyDocId =await getLobbyIdByLobbyName(db,data.lobbyName)

        // ref to doc with id
       const docRef = doc(db, 'Lobby', lobbyDocId);

        //our main control object    
        let lobby =await getLobbyData(db,await getLobbyIdByLobbyName(db,data.lobbyName));

        if(lobby!==undefined)
        {
            // console.log("lobby.teamBlue.length",lobby[data.selectedTeam].length);
            // console.log("lobby.teamRed.length",lobby.teamRed.length);

            //checking for team decided to join got space to 

            if(lobby[data.selectedTeam].length<6)
            {
                let newTeam = lobby[data.selectedTeam];
                newTeam.push(data.userName);
                //adding player
                await updateDoc(docRef, {
                    [data.selectedTeam]: newTeam
                });
            }
            else
                throw new error("Team is full!!!");

        }
        else
            throw new error("lobby cannot found!!!");

    } catch (error) {
        console.error('Error adding player : ', error);

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
            console.log('No lobby document found with the specified lobbyName');
            return null;
        }
    } catch (error) {
        console.error('Error getting lobby ID:', error);
        throw error;
    }
}

async function getLobbyData(db,documentId) {
    try {
        // Reference to the document using its ID
        const docRef = doc(db, 'Lobby', documentId);

        // Fetch the document
        const docSnapshot = await getDoc(docRef);

        // Check if the document exists
        if (docSnapshot.exists()) {
            // Access the field values from the document data
            const data = docSnapshot.data();
            //console.log('Document data:', data);
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



async function deleteLobby(db) {

    //TODO OYUN BİTTİKTEN SONRA LOBİNİN SİLİNMESİ

}





export { getLobby, createLobby,addPlayer };