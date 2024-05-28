import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { ref, set } from 'firebase/firestore';
import { getFirestore, collection, query, where, getDocs,addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FIRESTORE_DB } from '../../Database/Firebase';
import axios from 'axios';
import Constants from 'expo-constants';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const auth = getAuth();
const firestore = getFirestore();

const URLfetchCurrentUserData = Constants?.expoConfig?.hostUri
? `http://${Constants.expoConfig.hostUri.split(':').shift()}:4000/fetchCurrentUserData`
: 'https://yourapi.com/fetchCurrentUserData';

const URLsendInvitation = Constants?.expoConfig?.hostUri
? `http://${Constants.expoConfig.hostUri.split(':').shift()}:4000/sendInvitation`
: 'https://yourapi.com/fetchCurrentUserData';

  const SendInvitationPopUp = ({ lobbyName, visible, onClose }) => {

    const [to_username, setToUsername] = useState('');
    const [currentUserName, setCurrentUserName] = useState('');


    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No user logged in');
        Alert.alert("No user logged in.")
        return;
      }
      try {
        const response = await axios.post(URLfetchCurrentUserData, { email: currentUser.email });
        setCurrentUserName(response.data.username);
        console.log(currentUserName);
      } catch (error) {
        console.log('Error fetching user data:', error);
        Alert.alert("Request Failed!","Error fetching user data.")
      }
    }

//fetchUserData();

    const handleSendRequest = async () => {
      if (currentUserName) {
        try {
          console.log(lobbyName);
          const response = await axios.post(URLsendInvitation, {
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
          console.log('Error sending invitation:', error);
          const status = error.message.slice(-3);
          if (status == "404") {
            Alert.alert("Request Failed!","Invalid username entered. Please check your credentials.")
          }
          else if (status == "409") {
            Alert.alert("Request Failed!","Invitation already exists.")
          }
          else {
            Alert.alert("Request Failed!","An error occured, please try again.")
          }
        }
      } else {
        Alert.alert("Request Failed!","Current user username not set.")
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
          <Text style = {styles.text}>Invite a Friend!</Text>
            <TextInput
              placeholder="Enter username to invite"
              value={to_username}
              onChangeText={setToUsername}
              style={styles.input}
            />
            <TouchableOpacity onPress={handleSendRequest} style= {styles.button} disabled={to_username === ''}>
              <Text style = {styles.buttonText}>Send Invitation</Text>
            </TouchableOpacity>
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
    backgroundColor: '#fff5cc',
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
    width: screenWidth * 0.7,
    height: screenHeight * 0.30,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '100%',
  },
  input: {
    height: 50,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '100%',
    margin: 20,
  },
  button: {
    width: '85%',
    padding: 15,
    backgroundColor: 'sienna',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize:18,
  },
  text: {
    fontStyle: 'italic',
    fontSize:17
  }
});

export default SendInvitationPopUp;