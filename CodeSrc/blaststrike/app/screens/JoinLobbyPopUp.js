// JoinLobbyPopup.js
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { getFirestore} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import Constants from 'expo-constants'; // Ensure Constants is correctly imported

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const auth = getAuth();

const JoinLobbyPopup = ({ visible, onClose,navigation }) => {
    const [nameOfLobby,setNameOfLobby]=useState('');
    const [currentUsername,setCurrentUsername]=useState('');
    const [selectedTeam,setSelectedTeam]=useState('');

    const URLfetchCurrentUserData = Constants?.expoConfig?.hostUri
    ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:4000/fetchCurrentUserData`
    : 'https://yourapi.com/fetchCurrentUserData';

    const URLaddPlayer = Constants?.expoConfig?.hostUri
    ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:4000/Lobby/addPlayer`
    : 'https://yourapi.com/fetchCurrentUserData';
    

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
  

    fetchUserData();

    const handleLobbyJoin = async () => {
     //fetchUserData();
      if (currentUsername) {
        try {
            const response = await axios.put(URLaddPlayer, {
                // Include any data you want to send to the server in the request body
                // For example:
                // data: 'exampleData'
                
                lobbyName:nameOfLobby,
                username:currentUsername,
                selectedTeam:selectedTeam
                
                
              });
          // Instead of visible=false;
          onClose(); // This will call the function passed from the parent component to close the modal.
          console.log("response",response.data.lobbyDocId);
          console.log("Lobby joineded!");
          navigation.navigate('Lobby',{
          lobbyName:nameOfLobby,
          username:currentUsername,
          lobbyDocId:response.data.lobbyDocId,
          selectedTeam:selectedTeam
          });
          
        } catch (error) {
          console.log('joinLobby pop Error joining lobby:', error);
          const status = error.message.slice(-3);
          if (status == "404") {
            Alert.alert("Lobby Join Failed!","No lobby found with the specified lobbyName. Please check the lobby name.")
          }
          else if (status == "409") {
            Alert.alert("Lobby Join Failed!","You joined the opposite team before, cannot also join this team.")
          }
          else if (status == "422") {
            Alert.alert("Lobby Join Failed!","Team is full!")
          }
          else {
            Alert.alert("Lobby Join Failed!","An error occured, please try again.")
          }
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
            <Text style = {styles.text}>Join a lobby!</Text>
            <TextInput
              placeholder="Enter a lobby name you want to join"
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
                          setSelectedTeam('teamBlue');
                            handleLobbyJoin();
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
                            setSelectedTeam('teamRed');
                            handleLobbyJoin();
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
      width: screenWidth * 0.77,
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
    },
    text: {
      fontStyle: 'italic',
      fontSize:17
    }
  });
  
  export default JoinLobbyPopup;
  