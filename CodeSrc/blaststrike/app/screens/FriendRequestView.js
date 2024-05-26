import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import axios from 'axios';
import Constants from 'expo-constants'; // Ensure Constants is correctly imported
const firestore = getFirestore();

const FriendRequestsView = ({ userData }) => {
  const [requests, setRequests] = useState([]);

  const URLaddFriends = Constants?.expoConfig?.hostUri
  ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:4000/addFriends`
  : 'https://yourapi.com/fetchCurrentUserData';
  const URLdeleteAcceptedRequest = Constants?.expoConfig?.hostUri
  ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:4000/deleteAcceptedRequests`
  : 'https://yourapi.com/fetchCurrentUserData';
  

  useEffect(() => {
    let unsubscribe = () => {};
    if (userData && userData.username) {
      const q = query(
        collection(firestore, "FriendRequests"),
        where("to_username", "==", userData.username),
        where("status", "==", "pending")
      );

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const updatedRequests = querySnapshot.docs.map(doc => doc.data());
        setRequests(updatedRequests);
      }, (error) => {
        console.error("Error fetching friend requests: ", error);
      });
    }

    return () => unsubscribe();
  }, [userData]); // Depend on userData to re-run if it changes

  const acceptRequest = async (fromUsername) => {
    try {
      await axios.post(URLaddFriends, {
        from_username: fromUsername,
        to_username: userData.username,
      });
      
      await axios.post(URLdeleteAcceptedRequest, {
        from_username: fromUsername,
        to_username: userData.username,
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert("Acception Failed!", "Error accepting friend request.")
    }
  };

  return (
    <View style={styles.container}>
      <Text style = {{fontSize: 20}}>Active Friend Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.requestItem}>
            <Text>From: {item.from_username}</Text>
            <Button title="Accept" onPress={() => acceptRequest(item.from_username)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22,
  },
  requestItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default FriendRequestsView;
