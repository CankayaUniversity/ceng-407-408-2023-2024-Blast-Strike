import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants'; // Ensure Constants is correctly imported
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const DisplayFriendListPopUp = ({ visible, onClose, username }) => {
  const [friendList, setFriendList] = useState([]);

  const URLdisplayFriends = Constants?.expoConfig?.hostUri
  ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:4000/displayFriends`
  : 'https://yourapi.com/fetchCurrentUserData';
  

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.bullet}>•</Text>
      <Text>{item}</Text>
    </View>
  );

  useEffect(() => {
    const fetchFriendsList = async () => {
      if (!username) return;

      try {
        const response = await axios.post(URLdisplayFriends, { username });
        let friend_list  = response.data;
        friend_list = friend_list[0];
        friend_list = friend_list.filter(item => item !== "");
        setFriendList(friend_list);
      } catch (error) {
        console.log('Error fetching friends list:', error);
      }
    };

    if (visible) {
      fetchFriendsList();
    }
  }, [username, visible]);

  return (
    <View style={styles.container}>
      <Text style = {styles.text}>Friend List:</Text>
      <FlatList
        data={friendList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
      <TouchableOpacity style = {styles.button} onPress={onClose}>
        <Text style = {{color:'white', fontSize:15}}>CLOSE</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    padding: 20,
    backgroundColor: '#fff5cc',
    borderRadius: 10,
    position: 'absolute',
    width: screenWidth * 0.8, // Set width to 80% of screen width
    maxHeight: screenHeight * 0.6, // Set maxHeight to 60% of screen height
    alignItems: 'center',
    alignSelf: 'center', // Ensure the popup is centered horizontally
    overflow: 'hidden', // Prevents content from overflowing
  },
  friendItem: {
    padding: 5,
    fontSize: 18,
  },
  text: {
    fontStyle: 'italic',
    fontSize:17
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  bullet: {
    marginRight: 5,
    fontSize: 20,
  },
  button: {
    width: '75%',
    padding: 15,
    backgroundColor: 'sienna',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
});

export default DisplayFriendListPopUp;
