import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import axios from 'axios';
import Constants from 'expo-constants';

const firestore = getFirestore();

const ActiveInvitationsView = ({ navigation, userData }) => {
  const [invitations, setInvitations] = useState([]);
  const [showButton, setShowButton] = useState(true);

  const URLaddPlayer = Constants?.expoConfig?.hostUri
    ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:4000/Lobby/addPlayer`
    : 'https://yourapi.com/fetchCurrentUserData';

    const URLdeleteAcceptedInvitations = Constants?.expoConfig?.hostUri
    ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:4000/deleteAcceptedInvitations`
    : 'https://yourapi.com/fetchCurrentUserData';

  useEffect(() => {
    let unsubscribe = () => {};
    if (userData && userData.username) {
      const q = query(
        collection(firestore, "ActiveInvitations"),
        where("to_username", "==", userData.username),
      );

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const updatedInvitations = querySnapshot.docs.map(doc => doc.data());
        setInvitations(updatedInvitations);
      }, (error) => {
        console.error("Error fetching friend Invitations: ", error);
      });
    }

    return () => unsubscribe(); //TO DO
  }, [userData]);

  const toggleButton = () => {
    setShowButton(false);
  };

  const acceptInvitation = async (fromUsername, lobbyName, selectedTeam) => {
    try {
      await axios.put(URLaddPlayer, {
        lobbyName:lobbyName,
        username:userData.username,
        selectedTeam:selectedTeam
      });

      await axios.post(URLdeleteAcceptedInvitations, {
        from_username: fromUsername,
        to_username: userData.username,
        lobbyName:lobbyName,
      });
      navigation.navigate('Lobby',{
        lobbyName:lobbyName,
        username:userData.username,
        selectedTeam:selectedTeam
        });
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style = {{paddingLeft: 10}}>Active Invitations</Text>
      <FlatList
        data={invitations}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.InvitationItem}>
            <Text>From: {item.from_username}</Text>
            <Text>Lobby Name: {item.lobbyName}</Text>
            {showButton ? (
              <Button title = "Join Lobby" onPress={toggleButton}/>
            ) : (
              <View style={{ flexDirection: 'row' }}>
                <View style={{ marginRight: 10 }}>
                  <Button title = "Join Team Blue" onPress={() => acceptInvitation(item.from_username, item.lobbyName, 'teamBlue')}/>
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Button title = "Join Team Red" onPress={() => acceptInvitation(item.from_username, item.lobbyName, 'teamRed')}/>
                </View>
              </View>
            )}
        </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22,
  },
  InvitationItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default ActiveInvitationsView;