
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import axios from 'axios'; // Import axios for API calls
import { getAuth } from 'firebase/auth'; // Import Firebase authentication

// Initialize Firebase Auth
const auth = getAuth();

const DisplayFriendList = () => {
  const [friendList, setFriendList] = useState([]);

  // Function to fetch the current user's username
  const fetchUserData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No user logged in');
      return null; // Return null if there's no logged-in user
    }
    try {
      // Replace with your actual URL to fetch the current user's data
      const response = await axios.post('http://192.168.1.37:4000/fetchCurrentUserData', { email: currentUser.email });
      return response.data.username; // Assuming the response contains a username
    } catch (error) {
      console.log('Error fetching user data:', error);
      return null; // Return null if there was an error
    }
  };

  // Function to fetch the friend list for the current user
  const fetchFriendsList = async () => {
    const username = await fetchUserData(); // Fetch current user's username
    if (!username) {
      console.log('Failed to fetch user data or no user logged in');
      return;
    }
    try {
      // Replace with your actual URL to fetch the friends list
      const response = await axios.post('http://192.168.1.37:4000/displayFriends', { username });
      setFriendList(response.data); // Set the friend list in state
    } catch (error) {
      console.log('Error fetching friends list:', error);
    }
  };

  // Fetch friends list once component is mounted
  useEffect(() => {
    fetchFriendsList();
  }, []); // Empty dependency array means this effect runs once on mount

  // Render the friend list using FlatList
  return (
    <View style={styles.container}>
      <FlatList
        data={friendList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text style={styles.friendItem}>{item}</Text>} // Adjust according to your data structure
      />
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  friendItem: {
    padding: 10,
    fontSize: 18,
  },
});

export default DisplayFriendList;
