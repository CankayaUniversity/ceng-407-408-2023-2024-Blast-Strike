import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet ,TouchableOpacity} from 'react-native';
import { FIRESTORE_DB} from '../../Database/Firebase';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDocs, onSnapshot } from 'firebase/firestore';
import axios from 'axios';



const auth = getAuth();

const Lobby = ({ route })  =>{
    const { username, lobbyName} = route.params;
    const [lobbyData, setLobbyData] = useState({});
    const db = FIRESTORE_DB;
    const [LobbyExist,setLobbyExist]=useState(false);
    console.log("routed username and lobbyname",username,lobbyName);
    const [documentData, setDocumentData] = useState(null);
    const Url='http://10.0.2.2:4000';
/*
    const fetchUserData = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.log('No user logged in');
            return; // Exit the function if there's no logged-in user
        }
        try {
            // Fetching user data from your backend
            const response = await axios.post('http://10.0.2.2:4000/fetchCurrentUserData', {
            email: currentUser.email, // Sending current user's email to your backend
            })
        // usernameFromResponse = response.data.username; // Assuming the backend responds with the username
        setCurrentUsername(response.data.username);
        } catch (error) {
            console.log('Error fetching user data:', error);
            return; // Exit the function if there was an error fetching user data
        }
    }
*/

useEffect(() => {
  if (LobbyExist && lobbyData.documentId) {
    const unsubscribe = onSnapshot(doc(db, "Lobby", lobbyData.documentId), (doc) => {
      if (doc.exists()) {
        setLobbyData({ ...doc.data(), id: doc.id });
        console.log("New Lobby:", doc.data());
      } else {
        // Document doesn't exist
        setLobbyData(null);
        console.log("Document does not exist.");
      }
    });

    return () => {
      // Unsubscribe from the snapshot listener when component unmounts
      unsubscribe();
    };
  }
}, []);

    ///////// TODO: LOBBY DOCUMENT ID create lobby pop updan alınabilir
    const fetchUserLobbyData = async () => {
      const currentUser = auth.currentUser;
      console.log('fetchUserLobbyData RUNNING');
      if (!currentUser) {
        console.log('No user logged in');
        return; // Exit the function if there's no logged-in user
      }
      try {
        // Fetching current lobby data to show 
        const response = await axios.post('http://10.0.2.2:4000/Lobby/getLobbyData', {
          data: {
            lobbyName: lobbyName
          }
        });
        console.log("response.data", response.data);
        setLobbyData(response.data);
        console.log("lobbyData", response.data); // Log lobbyData after setting it
        setLobbyExist(true);
      } catch (error) {
        console.error("Error fetching lobby data:", error);
      }
    }

    if(!LobbyExist){
      fetchUserLobbyData();
      setLobbyExist(true);
    }


    return (
      <View style={styles.container}>
        <View style={styles.rotatedContainer}>
          <Text style={styles.heading}>5v5 FPS Shooter Game Lobby</Text>
          <View style={styles.teamSelection}>
            <View style={styles.team}>
              <Text style={styles.teamHeading}>Team 1</Text>
              <View style={styles.playerList}>
                {/* Display list of players on Team 1 if documentData is not null and has teamBlue property */}
               {/*lobbyData.teamBlue.map(user => <Text>{user}</Text>)*/}
               {lobbyData && lobbyData.teamBlue && lobbyData.teamBlue.map((user, index) => (
        <Text key={index}>{user}</Text>
      ))}
              </View>
            </View>
            <View style={styles.team}>
              <Text style={styles.teamHeading}>Team 2</Text>
              <View style={styles.playerList}>
                {/* Display list of players on Team 2 if documentData is not null and has teamRed property */}
                {/*lobbyData.teamRed.map(user => <Text>{user}</Text>)*/}
                {lobbyData && lobbyData.teamRed && lobbyData.teamRed.map((user, index) => (
        <Text key={index}>{user}</Text>
      ))}
              </View>
            </View>
          </View>
          <View style={styles.startGameBtnContainer}>
            <TouchableOpacity style={styles.startGameBtn}>
              <Text style={styles.startGameBtnText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
    

};


const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rotatedContainer: {
      transform: [{ rotate: '90deg' }],
    },
    heading: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    teamSelection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    team: {
      flex: 1,
      marginHorizontal: 5,
    },
    teamHeading: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    playerList: {
      borderWidth: 1,
      padding: 10,
    },
    startGameBtnContainer: {
      alignItems: 'center',
      borderRadius: 5,
    },
    startGameBtn: {
      backgroundColor: 'blue',
      paddingVertical: 10,
      paddingHorizontal: 20,

    },
    startGameBtnText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
  
export default Lobby;