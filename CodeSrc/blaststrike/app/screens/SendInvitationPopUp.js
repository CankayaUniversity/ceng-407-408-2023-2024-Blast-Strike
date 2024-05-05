// Popup.js
import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { ref, set } from 'firebase/firestore';
import { getFirestore, collection, query, where, getDocs,addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FIRESTORE_DB } from '../../Database/Firebase';
import axios from 'axios';

const auth = getAuth();
const firestore = getFirestore();
const URL='http://192.168.1.107:4000/fetchCurrentUserData'

  const SendInvitationPopUp = ({ lobbyName, visible, onClose }) => {

    const [to_username, setToUsername] = useState('');
    const [currentUserName, setCurrentUserName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [deneme, setdeneme] = useState('');
  
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No user logged in');
        setErrorMessage('No user logged in.');
        return;
      }
      try {
        const response = await axios.post(URL, { email: currentUser.email });
        setCurrentUserName(response.data.username);
        console.log(currentUserName);
      } catch (error) {
        console.log('Error fetching user data:', error);
        setErrorMessage('Error fetching user data.');
        setdeneme('deneme');
      }
    }
  
    const handleSendRequest = async () => {
      await fetchUserData();
      if (currentUserName) {
        try {
          console.log(lobbyName);
          const response = await axios.post('http://192.168.1.107:4000/sendInvitation', {
            data: {
              from_username: currentUserName,
              to_username: to_username,
              lobbyName: lobbyName
            }
          });
          onClose();
          console.log(response);
          console.log("Invitation sent");
        } catch (error) {
          console.error('Error sending invitation:', error);
          setErrorMessage('Error sending invitation.');
        }
      } else {
        setErrorMessage('Current user username not set.');
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
              placeholder="Enter username to invite"
              value={to_username}
              onChangeText={setToUsername}
              style={styles.input}
            />
            <Button title="Send Invitation" onPress={handleSendRequest} />
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            {deneme ? <Text style={styles.errorText}>{deneme}</Text> : null}
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

export default SendInvitationPopUp;
