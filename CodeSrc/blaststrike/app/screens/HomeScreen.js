import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Popup from './Popup'; // Import the Popup component
import axios from 'axios';
import FriendRequestsPopup from './FriendRequestPopUp';
import { useFetchUserData } from '../../Hooks/useFetchUserData';
import  CreateLobbyPopup from './CreateLobbyPopup';

// Assuming firebaseApp is initialized elsewhere in your project
const auth = getAuth();
const firestore = getFirestore();

const HomeScreen = ({ navigation }) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [createLobbyPopupVisible, setCreateLobbyPopupVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [friendRequestPopupVisible, setFriendRequestPopupVisible] = useState(false);
  const userData=useFetchUserData();
  
  useEffect(() => {
    // Update username state only when userData changes
    if (userData) {
      setUsername(userData.username);
    }
  }, [userData]); // Dependen

return (
  <View style={styles.container}>
    <Text>Welcome,{username}</Text>
    <Button title='Send Friendship Request' onPress={() => setPopupVisible(true)} />
    <Button title='Create a Lobby' onPress={() => setCreateLobbyPopupVisible(true)} />
    <Button title='lobby navigate' onPress={() => navigation.navigate('Lobby')} />
        
    {/*<Button title='Create annn Lobby'  onPress={createLobby}></Button>*/}

    <Popup
      visible={popupVisible}
      onClose={() => setPopupVisible(false)}
      
    />
    <CreateLobbyPopup
        visible={createLobbyPopupVisible}
        onClose={() => setCreateLobbyPopupVisible(false)}
        navigation={navigation}
        />
 
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
