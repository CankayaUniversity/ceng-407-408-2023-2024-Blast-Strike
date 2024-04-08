// Popup.js
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { ref, set } from 'firebase/firestore';
import { getFirestore, collection, query, where, getDocs,addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const auth = getAuth();
const firestore = getFirestore();
const URL='http://192.168.1.37:4000/fetchCurrentUserData'

  const SendingRequestPopup = ({ visible, onClose }) => {
    const [to_username, setToUsername] = useState('');
    const [currentUserName, setCurrentUserName] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // State to store the error message
  
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No user logged in');
        setErrorMessage('No user logged in.'); // Set error message
        return; // Exit the function if there's no logged-in user
      }
      try {
        const response = await axios.post(URL, { email: currentUser.email });
        setCurrentUserName(response.data.username);
      } catch (error) {
        console.log('Error fetching user data:', error);
        setErrorMessage('Error fetching user data.'); // Set error message
      }
    }
  
    const handleSendRequest = async () => {
      await fetchUserData();
      if (currentUserName) {
        try {
          const response = await axios.post('http://192.168.1.37:4000/sendFriendRequest', {
            data: {
              from_username: currentUserName,
              to_username: to_username,
              status: "pending"
            }
          });
          onClose(); // Close the modal on success
          console.log(response);
          console.log("Friend request sent");
        } catch (error) {
          console.error('Error sending friend request:', error);
          setErrorMessage('Error sending friend request.'); // Set error message
        }
      } else {
        setErrorMessage('Current user username not set.'); // Set error message if username isn't fetched
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
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
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

export default SendingRequestPopup;
