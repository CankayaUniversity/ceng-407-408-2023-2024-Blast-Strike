import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity,Button } from 'react-native';
import axios from 'axios';

const HomeScreen = ({ navigation }) => {

 
  const createLobby = async () => {
    try {
      console.log("adas");
      // Make a POST request to your server
      /*
      changed localhost to 10.0.2.2:4000 beacause android emulator cannot find localhost
      on it's on device  as I am starting server on my computer
      */
      const response = await axios.post('http://10.0.2.2:4000/createLobby', {
        // Include any data you want to send to the server in the request body
        // For example:
        // data: 'exampleData'
        data:{
        lobbyName:'emulatör demo1'

        }
        
      });

      // Handle the response from the server
      console.log('Server response:', response.data);
    } catch (error) {
      // Handle errors if the request fails
      console.error('Error making server request:', error);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Home Screen!</Text>
      

      {/*  create lobby component*/}
      <Button title="Create annn Lobby"  onPress={createLobby}></Button>


      {/* Add more buttons or content here as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
});

export default HomeScreen;

