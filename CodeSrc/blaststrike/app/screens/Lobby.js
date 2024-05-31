import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import SendInvitationPopUp from './SendInvitationPopUp';
import { FIRESTORE_DB } from '../../Database/Firebase';
import axios from 'axios';
import TensorCamera from '../../src/TensorCamera';
import Constants from 'expo-constants'; // Ensure Constants is correctly imported
const auth = getAuth();

const Lobby = ({ navigation,route }) => {
  const { username, lobbyName, selectedTeam,lobbyDocId } = route.params;
  const [lobbyData, setLobbyData] = useState({});
  const db = FIRESTORE_DB;
  const [LobbyExist, setLobbyExist] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false); // State to control camera modal visibility

  const [invitePopUpVisible, setInvitePopUpVisible] = useState(false);
  
  const URLgetLobbyData = Constants?.expoConfig?.hostUri
? `http://${Constants.expoConfig.hostUri.split(':').shift()}:4000/Lobby/getLobbyData`
: 'https://yourapi.com/fetchCurrentUserData';

const URLlobbyStart = Constants?.expoConfig?.hostUri
? `http://${Constants.expoConfig.hostUri.split(':').shift()}:4000/Lobby/start`
: 'https://yourapi.com/fetchCurrentUserData';




  useEffect(() => {
    //console.log("111lobbyDocId",lobbyDocId);
    //console.log("selectedTeam",selectedTeam);
    //console.log("111lobbyData.documentId",lobbyData.documentId);
    if ((LobbyExist && lobbyData.documentId)||lobbyDocId ) {
      const unsubscribe = onSnapshot(doc(db, "Lobby", (lobbyData.documentId || lobbyDocId)), (doc) => {
        if (doc.exists()) {
         // console.log("doc",{ ...doc.data(), documentId: doc.id });
         // console.log("lob",lobbyData);
          setLobbyData({ ...doc.data(), documentId: doc.id });
        } else {
          console.log("Document does not exist.");
          setLobbyData(null);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [lobbyData]);

  useEffect(() => {

  if (!LobbyExist) {
    fetchUserLobbyData();
    setLobbyExist(true);
  }

  if(lobbyData.inGame)
  {
    navigation.replace('TensorCamera', {
      lobbyData: lobbyData,
      selectedTeam: selectedTeam,
      username:username
    })
  }
  },);

  const fetchUserLobbyData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No user logged in');
      return;
    }
    try {
      console.log("lobbyName",lobbyName);
      const response = await axios.post(URLgetLobbyData, {
        data: {
          lobbyName: lobbyName
        }
      });
      setLobbyData(response.data);
      setLobbyExist(true);

    } catch (error) {
      console.log("Error fetching lobby data:", error);
    }
  }

  const startLobby = async  () => {
    try {
      const response = await axios.put(URLlobbyStart,{
      data: {
        lobbyDocId: lobbyData.documentId
      }
    });
    } catch (error) {
      console.log("Error starting lobby data:", error);
    }
  }



  return (
    <View style={styles.container}>
      <View style={styles.rotatedContainer}>
        <Text style={styles.heading}>Blast Strike Game Lobby</Text>
        <View style={styles.teamSelection}>
          <View style={styles.team}>
            <Text style={[styles.teamHeading, {color: 'deepskyblue'}]}>Team Blue</Text>
            <View style={[styles.playerList, {borderColor: 'deepskyblue'}]}>
              {lobbyData && lobbyData.teamBlue && lobbyData.teamBlue.map((user, index) => (
                <View style={styles.bulletContainer} key={index}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={{color: 'white'}}>{user.username}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.team}>
            <Text style={[styles.teamHeading, {color: 'red'}]}>Team Red</Text>
            <View style={[styles.playerList, {borderColor: 'red'}]}>
              {lobbyData && lobbyData.teamRed && lobbyData.teamRed.map((user, index) => (
                <View style={styles.bulletContainer} key={index}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={{color: 'white'}}>{user.username}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        {invitePopUpVisible && (
          <SendInvitationPopUp
            lobbyName={lobbyName}
            visible={invitePopUpVisible}
            onClose={() => setInvitePopUpVisible(false)}
          />
        )}
        <View style = {styles.buttonContainer}>
          <View style={styles.startGameBtnContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setInvitePopUpVisible(true)}
            >
              <Text style={styles.buttonText}>Invite Friend</Text>
            </TouchableOpacity>
          </View>
          { lobbyData.lobbyAdmin == username &&
            <View style={styles.startGameBtnContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={ startLobby }>
                <Text style={styles.buttonText}>Start Game</Text>
              </TouchableOpacity>
            </View> 
          } 
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
    backgroundColor: 'dimgray'
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
    margin:5,
  },
  button: {
    backgroundColor: 'darkorange',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderTopColor: 'white',
    borderTopWidth: 3,
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bulletPoint: {
    color: 'white',
    fontSize: 20,
    marginRight: 5,
  },
});

export default Lobby;
