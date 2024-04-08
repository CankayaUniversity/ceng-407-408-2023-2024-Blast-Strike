import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { getFirestore, collection, query, where, getDocs,onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import axios from 'axios'; // Make sure to import axios

const auth = getAuth();
const firestore = getFirestore();
const URL = 'http://192.168.1.130:4000/fetchCurrentUserData';

const FriendRequestsView = () => {
  const [requests, setRequests] = useState([]);



  const fetchUserData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('No user logged in');
      return null; // Return null if there's no logged-in user
    }
    try {
      const response = await axios.post(URL, { email: currentUser.email });
      return response.data.username; // Return username directly
    } catch (error) {
      console.log('Error fetching user data:', error);
      return null; // Return null if there was an error
    }
  };

  useEffect(() => {
    let unsubscribe = () => {}; // Initializes an empty unsubscribe function
    const fetchFriendRequests = async () => {
      const currentUserName = await fetchUserData(); // Wait for the username
      if (currentUserName) {
        const q = query(
          collection(firestore, "FriendRequests"), 
          where("to_username", "==", currentUserName), 
          where("status", "==", "pending")
        );
  
        // Set up the real-time listener with onSnapshot
        unsubscribe = onSnapshot(q, (querySnapshot) => {
          const updatedRequests = [];
          querySnapshot.forEach((doc) => {
           
            updatedRequests.push(doc.data());
          });
          console.log(currentUserName);
          setRequests(updatedRequests); // Update state to re-render the component
          console.log(updatedRequests);
        }, (error) => {
          console.error("Error fetching friend requests: ", error);
        });
      }
    };
  
    fetchFriendRequests(); // Call the function to set up the listener
  
    // Cleanup function to unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, []); // The empty dependency array ensures this effect runs only once on mount
  
  // The fetchUserData function remains unchanged
  


  const acceptRequest = async () => {
    const currentUserName = await fetchUserData(); // Wait for the username
    if (currentUserName) {
    try
    {
      const q = query(collection(firestore, "FriendRequests"), where("to_username", "==", currentUserName), where("status", "==", "pending"));
      const querySnapshot= await getDocs(q);
      const singleDoc=querySnapshot.docs[0];
      const requestData = singleDoc.data(); // This extracts the document data into a JavaScript object
      const fromUsername = requestData.from_username;

      const response = await axios.post('http://192.168.1.37:4000/addFriends', {
        // Include any data you want to send to the server in the request body
        // For example:
        // data: 'exampleData'
        data:{
        from_username:fromUsername,
        to_username:currentUserName,
        }})
   
        const deleteAcceptedRequest = await axios.post('http://192.168.1.37:4000/deleteAcceptedRequests',
        {
          data:
          {
            from_username:fromUsername,
            to_username:currentUserName,
          }
        })

    }
    catch (error) {
      console.error('Error accepting friend request:', error);
    }
    }
  };


  

  // Component rendering and other functions remain unchanged...



  return (
    <View style={styles.container}>
      <Text>Active Friend Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.requestItem}>
            <Text>From: {item.from_username}</Text>
            <Button title="Accept" onPress={acceptRequest} />
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
