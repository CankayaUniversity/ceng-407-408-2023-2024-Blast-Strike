import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import SendingRequestPopup from './SendingRequestPopup';
import FriendRequestsView from './FriendRequestView';
import CreateLobbyPopup from './CreateLobbyPopup';
import JoinLobbyPopup from './JoinLobbyPopUp';
import DisplayFriendListPopUp from './DisplayFriendListPopUp';
import ActiveInvitationsView from './ActiveInvitationsView';
import { useFetchUserData } from '../../Hooks/useFetchUserData';

const HomeScreen = ({ navigation }) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [createLobbyPopupVisible, setCreateLobbyPopupVisible] = useState(false);
  const [joinLobbyPopupVisible, setJoinLobbyPopupVisible] = useState(false);
  const [friendRequestPopupVisible, setFriendRequestPopupVisible] = useState(false);
  const [invitationPopupVisible, setInvitationPopupVisible] = useState(false);
  const [displayFriendsPopUpVisible, setDisplayFriendsPopUpVisible] = useState(false);

  const userData = useFetchUserData();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {userData ? userData.username : ''}!</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style = {styles.button} onPress={() => setPopupVisible(true)}>
          <Text style = {styles.buttonText}>Send Friendship Request</Text>
        </TouchableOpacity>
        <TouchableOpacity style = {styles.button} onPress={() => setCreateLobbyPopupVisible(true)}>
          <Text style = {styles.buttonText}>Create a Lobby</Text>
        </TouchableOpacity>
        <TouchableOpacity style = {styles.button} onPress={() => navigation.navigate('Lobby')}>
          <Text style = {styles.buttonText}>Lobby Navigate</Text>
        </TouchableOpacity>
        <TouchableOpacity style = {styles.button} onPress={() => setJoinLobbyPopupVisible(true)}>
          <Text style = {styles.buttonText}>Join Lobby</Text>
        </TouchableOpacity>
        <TouchableOpacity style = {styles.button} onPress={() => setDisplayFriendsPopUpVisible(true)}>
          <Text style = {styles.buttonText}>Friend List</Text>
        </TouchableOpacity>
        <TouchableOpacity style = {styles.button} onPress={() => setFriendRequestPopupVisible(!friendRequestPopupVisible)}>
          <Text style = {styles.buttonText}>View Friend Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity style = {styles.button} onPress={() => setInvitationPopupVisible(!invitationPopupVisible)}>
          <Text style = {styles.buttonText}>View Invitations</Text>
        </TouchableOpacity>
      </View>

      {friendRequestPopupVisible && <FriendRequestsView userData={userData} />}
      {invitationPopupVisible && <ActiveInvitationsView navigation={navigation} userData={userData} />}

      <SendingRequestPopup
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
      />
      <CreateLobbyPopup
        visible={createLobbyPopupVisible}
        onClose={() => setCreateLobbyPopupVisible(false)}
        navigation={navigation}
      />
      <JoinLobbyPopup
        visible={joinLobbyPopupVisible}
        onClose={() => setJoinLobbyPopupVisible(false)}
        navigation={navigation}
      />
      {displayFriendsPopUpVisible && (
        <DisplayFriendListPopUp
          visible={displayFriendsPopUpVisible}
          onClose={() => setDisplayFriendsPopUpVisible(false)}
          username={userData?.username}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff3e6',
    padding:20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'brown'
  },
  buttonContainer: {
    flexDirection: 'vertical',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '48%',
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: 'maroon',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white'
  },
});

export default HomeScreen;
