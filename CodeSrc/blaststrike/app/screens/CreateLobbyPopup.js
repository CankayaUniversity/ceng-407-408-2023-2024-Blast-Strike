// CreateLobbyPopup.js
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { getFirestore} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import Constants from 'expo-constants'; // Ensure Constants is correctly imported

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const auth = getAuth();

const CreateLobbyPopup = ({ visible, onClose,navigation }) => {
    const [nameOfLobby,setNameOfLobby]=useState('');
    const [currentUsername,setCurrentUsername]=useState('');

    const URLfetchCurrentUserData = Constants?.expoConfig?.hostUri
? `http://${Constants.expoConfig.hostUri.split(':').shift()}:4000/fetchCurrentUserData`
: 'https://yourapi.com/fetchCurrentUserData';

const URLcreateLobby = Constants?.expoConfig?.hostUri
? `http://${Constants.expoConfig.hostUri.split(':').shift()}:4000/createLobby`
: 'https://yourapi.com/fetchCurrentUserData';

    var selectedTeam='';
    
    const fetchUserData = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.log('No user logged in');
            return; // Exit the function if there's no logged-in user
        }
        try {
            // Fetching user data from your backend
            const response = await axios.post(URLfetchCurrentUserData, {
            email: currentUser.email, // Sending current user's email to your backend
            })
        // usernameFromResponse = response.data.username; // Assuming the backend responds with the username
        setCurrentUsername(response.data.username);
        } catch (error) {
            console.log('Error fetching user data:', error);
            return; // Exit the function if there was an error fetching user data
        }
    }
  

    const handleLobbyCreate = async () => {
     fetchUserData();
      // Proceed to send a friend request only if we successfully got the username
      if (currentUsername) {
        try {
            const response = await axios.post(URLcreateLobby, {
                // Include any data you want to send to the server in the request body
                // For example:
                // data: 'exampleData'
                
                lobbyName:nameOfLobby,
                username:currentUsername,
                selectedTeam:selectedTeam

              });
          // Instead of visible=false;
          onClose(); // This will call the function passed from the parent component to close the modal.
  
          console.log("Lobby Created!");
          navigation.navigate('Lobby',{
          lobbyName:nameOfLobby,
          username:currentUsername,
          selectedTeam:selectedTeam
          });
        } catch (error) {
          console.log('CreateLobby pop Error creating lobby:', error);
          const status = error.message.slice(-3);
          console.log("status", status);
          console.log(typeof status);
          if (status == "404") {
            Alert.alert("Lobby Creation Failed!","Invalid lobby name entered. Please check your credentials.")
          }
          else if (status == "409") {
            Alert.alert("Lobby Creation Failed!","Lobby already exists.")
          }
          else {
            Alert.alert("Lobby Creation Failed!","An error occured, please try again.")
          }
        }
        finally{
            setNameOfLobby('');
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
            <Text style = {styles.text}>Create a lobby!</Text>
            <TextInput
              placeholder="Enter a unique lobby name"
              value={nameOfLobby}
              onChangeText={setNameOfLobby}
              style={styles.input}
            />
            <View style={{flexDirection: 'vertical'}}>
              <View>
                  <TouchableOpacity 
                    style = {[styles.button, {backgroundColor: 'deepskyblue'}]}
                    disabled={nameOfLobby === ''}
                    onPress={() => {
                      selectedTeam='teamBlue';
                      handleLobbyCreate();
                    }}
                  >
                    <Text>Join Team Blue</Text>
                  </TouchableOpacity>
               </View>
                <View>
                    <TouchableOpacity 
                      style = {[styles.button, {backgroundColor: 'red'}]}
                      disabled={nameOfLobby === ''}
                      onPress={() => {
                        selectedTeam='teamRed';
                        handleLobbyCreate();
                      }}
                    >
                      <Text>Join Team Red</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
      height: screenHeight * 0.35,
    },
    input: {
      height: 50,
      margin: 12,
      borderWidth: 1,
      padding: 10,
      width: '100%',
      margin: 20,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    button: {
      borderRadius: 4,
      paddingVertical: 12,
      paddingHorizontal: 32,
      marginBottom: 20,
      width: '100%',
    },
    text: {
      fontStyle: 'italic',
      fontSize:17
    }
  });
  
  export default CreateLobbyPopup;
  