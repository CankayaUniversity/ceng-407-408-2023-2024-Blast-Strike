// Popup.js
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { ref, set } from 'firebase/firestore';
import { getFirestore, collection, query, where, getDocs,addDoc } from 'firebase/firestore';

import { getAuth } from 'firebase/auth';
import axios from 'axios';

const auth = getAuth();
const firestore = getFirestore();
const Popup = ({ visible, onClose }) => {
  const [to_username, setToUsername] = useState('');
  const [currentUserName,setCurrentUserName]=useState('');

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
     setCurrentUserName(response.data.username);
    } catch (error) {
      console.log('Error fetching user data:', error);
      return; // Exit the function if there was an error fetching user data
    }
  }

  const handleSendRequest = async () => {
   fetchUserData();
    // Proceed to send a friend request only if we successfully got the username
    if (currentUserName) {
      try {
        // Assuming you're using Firebase Realtime Database based on your code
        // Note: For Firestore, the approach would be different
        const docRef = await addDoc(collection(firestore, "FriendRequests"), {
          from_username: currentUserName,
          to_username: to_username,
          status:"pending"
        });
        // Instead of visible=false;
        onClose(); // This will call the function passed from the parent component to close the modal.

        console.log("Friend request sent");
      } catch (error) {
        console.error('Error sending friend request:', error);
      }
    }
    
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <TextInput
            placeholder="Enter username"
            value={to_username}
            onChangeText={setToUsername}
            style={styles.input}
          />
          <Button title="Send Request" onPress={handleSendRequest} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '100%',
  },
});

export default Popup;
