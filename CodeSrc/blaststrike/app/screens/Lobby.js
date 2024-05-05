import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import { doc, onSnapshot} from 'firebase/firestore';
import { FIRESTORE_DB } from '../../Database/Firebase';
import axios from 'axios';
import SendInvitationPopUp from './SendInvitationPopUp';
import TensorCamera from '../../src/TensorCamera';

const auth = getAuth();

const Lobby = ({ navigation,route }) => {
  const { username, lobbyName, selectedTeam,lobbyDocId } = route.params;
  const [lobbyData, setLobbyData] = useState({});
  const db = FIRESTORE_DB;
  const [LobbyExist, setLobbyExist] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false); // State to control camera modal visibility

  const [invitePopUpVisible, setInvitePopUpVisible] = useState(false);

  useEffect(() => {
    console.log("111lobbyDocId",lobbyDocId);
    console.log("selectedTeam",selectedTeam);
    console.log("111lobbyData.documentId",lobbyData.documentId);
    if ((LobbyExist && lobbyData.documentId)||lobbyDocId ) {
      const unsubscribe = onSnapshot(doc(db, "Lobby", (lobbyData.documentId || lobbyDocId)), (doc) => {
        if (doc.exists()) {
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

  const fetchUserLobbyData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No user logged in');
      return;
    }
    try {
      console.log("lobbyName",lobbyName);
      const response = await axios.post('http://192.168.1.107:4000/Lobby/getLobbyData', {
        data: {
          lobbyName: lobbyName
        }
      });
      setLobbyData(response.data);
      setLobbyExist(true);

    } catch (error) {
      console.error("Error fetching lobby data:", error);
    }
  }


  if (!LobbyExist) {
    fetchUserLobbyData();
    setLobbyExist(true);
  }
  return (
    <View style={styles.container}>
      <View style={styles.rotatedContainer}>
        <Text style={styles.heading}>5v5 FPS Shooter Game Lobby</Text>
        <View style={styles.teamSelection}>
          <View style={styles.team}>
            <Text style={styles.teamHeading}>Team Blue</Text>
            <View style={styles.playerList}>
              {lobbyData && lobbyData.teamBlue && lobbyData.teamBlue.map((user, index) => (
                <Text key={index}>{user.username}</Text>
              ))}
            </View>
          </View>
          <View style={styles.team}>
            <Text style={styles.teamHeading}>Team Red</Text>
            <View style={styles.playerList}>
              {lobbyData && lobbyData.teamRed && lobbyData.teamRed.map((user, index) => (
                <Text key={index}>{user.username}</Text>
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
        <View style={styles.startGameBtnContainer}>
          <TouchableOpacity
            style={styles.startGameBtn}
            onPress={() => setInvitePopUpVisible(true)}
          >
            <Text style={styles.startGameBtnText}>Invite Friend</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.startGameBtnContainer}>
        <TouchableOpacity
        style={styles.startGameBtn}
        onPress={() =>
          navigation.replace('TensorCamera', {
            lobbyData: lobbyData,
            selectedTeam: selectedTeam
          })
        }>
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
    margin: 5,
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
