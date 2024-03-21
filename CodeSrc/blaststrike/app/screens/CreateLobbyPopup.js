// CreateLobbyPopup.js
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { getFirestore} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const auth = getAuth();

const CreateLobbyPopup = ({ visible, onClose,navigation }) => {
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
            const response = await axios.post('http://10.0.2.2:4000/fetchCurrentUserData', {
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
            const response = await axios.post('http://10.0.2.2:4000/createLobby', {
                // Include any data you want to send to the server in the request body
                // For example:
                // data: 'exampleData'
                data:{
                lobbyName:nameOfLobby,
                username:currentUsername,
                selectedTeam:selectedTeam
                }
                
              });
          // Instead of visible=false;
          onClose(); // This will call the function passed from the parent component to close the modal.
  
          console.log("Lobby Created!");
          navigation.navigate('Lobby',{
          lobbyName:nameOfLobby,
          username:currentUsername
          });
        } catch (error) {
          console.error('CreateLobby pop Error creating lobby:', error);
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
            <TextInput
              placeholder="Enter a unique lobby name"
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
                             handleLobbyCreate();
                            }}
                    />
               </View>
                <View style={{ marginLeft: 10 }}>
                    <Button 
                        title="Join Team Red" 
                        onPress={() => {
                            selectedTeam='teamRed';
                            handleLobbyCreate();
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
  
  export default CreateLobbyPopup;
  