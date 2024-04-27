import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Dimensions } from 'react-native';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const DisplayFriendListPopUp = ({ visible, onClose, username }) => {
const [friendList, setFriendList] = useState([]);

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
        const response = await axios.post('http://192.168.1.105:4000/displayFriends', { username });
        let friend_list  = response.data;
        friend_list = friend_list[0];
        friend_list = friend_list.filter(item => item !== "");
        setFriendList(friend_list); // Assuming response.data is the list of friends

      } catch (error) {
        console.error('Error fetching friends list:', error);
      }
    };

    if (visible) {
      fetchFriendsList();
    }
  }, [username, visible]);

  return (
    <View style={styles.container}>
      <FlatList
        data={friendList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
      <Button title="Close" onPress={onClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    padding: 20,
    backgroundColor: 'white',
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
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  bullet: {
    marginRight: 5,
    fontSize: 20,
  },
});

export default DisplayFriendListPopUp;
