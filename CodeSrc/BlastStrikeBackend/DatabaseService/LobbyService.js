import { collection, getDocs, getDoc,addDoc,query,where,doc,updateDoc, deleteDoc} from 'firebase/firestore/lite';
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
            if(lobby.lobbyName==data.lobbyName )
            throw new Error('Lobby name ' + data.lobbyName+' must be unique,try to change name');
            if(data.selectedTeam=='')
            throw new Error('Selected team cannot be empty');

        });

         const docRef = await addDoc(collection(db, 'Lobby'), {
            lobbyName: data.lobbyName,
            teamRed:[],
            teamBlue:[]    
        });
        console.log('Lobby created successfully with ID:', docRef.id);
        await addPlayer(db,data);

    } catch (error) {
        console.error('Error creating Lobby:', error);
    }
}

async function sendInvitation(db, data) {
    const invitationExists = await checkInvitationExist(db, data);
    if (invitationExists) {
      throw new Error("Invitation already exists.");
    }
    if (data) {
      try {
        const usersRef = collection(db, 'Users');
        const q = query(usersRef, where("username", "==", data.data.to_username));
        const querySnapshot = await getDocs(q);
        console.log("Query snapshot size:", querySnapshot.size); // Check how many documents were found
        if (!querySnapshot.empty) {
          const docRef = await addDoc(collection(db, "ActiveInvitations"), {
            from_username: data.data.from_username,
            lobbyName: data.data.lobbyName,
            to_username: data.data.to_username,
          });
          console.log("Document written with ID: ", docRef.id);
        } else {
          console.log("User not found with username:", data.data.to_username);
          throw new Error("User is not found");
        }
      } catch (error) {
        console.error('Error sending friend request:', error);
        throw error;
      }
    }
}

async function checkInvitationExist(db, data) {
    let invitationExists = false;
    if(data) {
      const usersRef = collection(db, 'ActiveInvitations');
      const q = query(usersRef, 
                      where("from_username", "==", data.data.from_username),
                      where("to_username", "==", data.data.to_username),
                      where("lobbyName", "==", data.data.lobbyName));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // If the querySnapshot is not empty, it means invitation already exists
        invitationExists = true;
      }
    }
    return invitationExists;
}

async function fetchInvitations(db,data)
 {
  try {
    const q = query(collection(db, "ActiveInvitations"), where("to_username", "==", data.to_username), where("lobbyName", "==", data.lobbyName));
    const querySnapshot = await getDocs(q);
    const requestsArray = [];
    querySnapshot.forEach((doc) => {
      requestsArray.push(doc.data());
    });
   // console.log(requestsArray)
    return requestsArray;
  } catch (error) {
    console.log("Error on fetching data",error);
  }
}

async function deleteAcceptedInvitations(db, data) {
    if (!data.to_username || !data.from_username || !data.lobbyName) {
      console.error("Error: Missing or undefined to_username or from_username.");
      return;
    }
    try {
      const q = query(
        collection(db, "ActiveInvitations"),
        where("to_username", "==", data.to_username),
        where("from_username", "==", data.from_username),
        where("lobbyName", "==", data.lobbyName)
      );
  
      // Execute the query.
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        console.log("No matching documents found to delete.");
        return;
      }
  
      // Loop over the documents returned by the query.
      for (const docSnapshot of querySnapshot.docs) {
        // For each document, delete it.
        await deleteDoc(doc(db, "ActiveInvitations", docSnapshot.id));
      }
  
      console.log("Document(s) deleted successfully.");
    } catch (error) {
      console.error("Error deleting document:", error);
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
        
        if(lobby!==undefined)
        {
            console.log("lobby[data.selectedTeam]",lobby[data.selectedTeam]);
            // console.log("lobby.teamRed.length",lobby.teamRed.length);

            //checking for team decided to join got space to 

            if(lobby[data.selectedTeam].length<6)
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
                throw new error("Team is full!!!");

                return lobbyDocId;
        }
        else
            throw new error("Lobby cannot found!!!");

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



async function deleteLobby(db) {

    //TODO OYUN BİTTİKTEN SONRA LOBİNİN SİLİNMESİ

}





export { getLobby, createLobby,addPlayer,getLobbyData,getLobbyIdByLobbyName, sendInvitation, fetchInvitations, deleteAcceptedInvitations};