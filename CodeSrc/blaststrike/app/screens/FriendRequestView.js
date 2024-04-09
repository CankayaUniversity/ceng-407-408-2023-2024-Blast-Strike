import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';
import axios from 'axios';

const firestore = getFirestore();

const FriendRequestsView = ({ userData }) => {
  const [requests, setRequests] = useState([]);

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
      await axios.post('http://192.168.1.37:4000/addFriends', {
        from_username: fromUsername,
        to_username: userData.username,
      });
      
      await axios.post('http://192.168.1.37:4000/deleteAcceptedRequests', {
        from_username: fromUsername,
        to_username: userData.username,
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Active Friend Requests</Text>
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
