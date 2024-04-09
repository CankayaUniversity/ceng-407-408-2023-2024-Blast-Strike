import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import SendingRequestPopup from './SendingRequestPopup';
import FriendRequestsView from './FriendRequestView';
import CreateLobbyPopup from './CreateLobbyPopup';
import JoinLobbyPopup from './JoinLobbyPopUp';
import DisplayFriendListPopUp from './DisplayFriendListPopUp';
import { useFetchUserData } from '../../Hooks/useFetchUserData';

const HomeScreen = ({ navigation }) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [createLobbyPopupVisible, setCreateLobbyPopupVisible] = useState(false);
  const [joinLobbyPopupVisible, setJoinLobbyPopupVisible] = useState(false);
  const [friendRequestPopupVisible, setFriendRequestPopupVisible] = useState(false);
  const [displayFriendsPopUpVisible, setDisplayFriendsPopUpVisible] = useState(false);

  const userData = useFetchUserData();

  return (
    <View style={styles.container}>
      <Text>Welcome, {userData ? userData.username : ''}</Text>
      <Button title='Send Friendship Request' onPress={() => setPopupVisible(true)} />
      <Button title='Create a Lobby' onPress={() => setCreateLobbyPopupVisible(true)} />
      <Button title='Lobby Navigate' onPress={() => navigation.navigate('Lobby')} />
      <Button title='Join Lobby' onPress={() => setJoinLobbyPopupVisible(true)} />
      <Button title='Friend List' onPress={() => setDisplayFriendsPopUpVisible(true)} />
      <Button title="View Friend Requests" onPress={() => setFriendRequestPopupVisible(!friendRequestPopupVisible)} />

      {friendRequestPopupVisible && <FriendRequestsView userData={userData} />}

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
  },
});

export default HomeScreen;
