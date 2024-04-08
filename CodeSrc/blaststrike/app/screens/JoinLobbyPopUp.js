// CreateLobbyPopup.js
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { getFirestore} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const auth = getAuth();

const JoinLobbyPopup = ({ visible, onClose,navigation }) => {
    const [nameOfLobby,setNameOfLobby]=useState('');
    const [currentUsername,setCurrentUsername]=useState('');
    var selectedTeam='';

    const fetchUserData = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.log('No user logged in');
            return; // Exit the function if there's no logged-in user
        }
        try {
            // Fetching user data from your backend
            const response = await axios.post('http://192.168.1.37:4000/fetchCurrentUserData', {
            email: currentUser.email, // Sending current user's email to your backend
            })
        // usernameFromResponse = response.data.username; // Assuming the backend responds with the username
        setCurrentUsername(response.data.username);
        } catch (error) {
            console.log('Error fetching user data:', error);
            return; // Exit the function if there was an error fetching user data
        }
    }
  

    const handleLobbyJoin = async () => {
     fetchUserData();
      if (currentUsername) {
        try {
            const response = await axios.put('http://192.168.1.130:4000/Lobby/addPlayer', {
                // Include any data you want to send to the server in the request body
                // For example:
                // data: 'exampleData'
                
                lobbyName:nameOfLobby,
                username:currentUsername,
                selectedTeam:selectedTeam
                
                
              });
          // Instead of visible=false;
          onClose(); // This will call the function passed from the parent component to close the modal.
  
          
          navigation.navigate('Lobby',{
          lobbyName:nameOfLobby,
          username:currentUsername
          });
          console.log("Lobby joineded!");
        } catch (error) {
          console.error('joinLobby pop Error joining lobby:', error);
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
              placeholder="Enter a lobby name you want to join"
              value={nameOfLobby}
              onChangeText={setNameOfLobby}
              style={styles.input}
            />
            <View style={{flexDirection: 'row'}}>
                <View style={{ marginRight: 10 }}>
                    <Button 
                        title='Join Team Blue' 
                        onPress={() => {
                            selectedTeam='teamBlue';
                            handleLobbyJoin();
                            }}
                    />
               </View>
                <View style={{ marginLeft: 10 }}>
                    <Button 
                        title="Join Team Red" 
                        onPress={() => {
                            selectedTeam='teamRed';
                            handleLobbyJoin();
                            }}
                    />
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
  
  export default JoinLobbyPopup;
  