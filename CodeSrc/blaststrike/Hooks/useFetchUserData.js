import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Constants from 'expo-constants'; // Ensure Constants is correctly imported

const auth = getAuth();

export const useFetchUserData = () => {
  const [userData, setUserData] = useState(null);

  // Determine the API URL dynamically based on the environment
  const uri = Constants?.expoConfig?.hostUri
    ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:4000/fetchCurrentUserData`
    : 'https://yourapi.com/fetchCurrentUserData';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) { // Check only for a logged-in user
        const fetchUserData = async () => {
          try {
            const response = await axios.post(uri, {
              email: currentUser.email,
            });
            setUserData(response.data); // Adjust according to your response structure
          } catch (error) {
            console.log('Error fetching user data:', error);
            setUserData(null); // Handle error by setting userData to null
          }
        };

        fetchUserData();
      } else {
        console.log('No user logged in');
        setUserData(null); // Set userData to null when no user is logged in
      }
    });

    return () => unsubscribe(); // Cleanup subscription on component unmount
  }, [uri]); // Add uri to dependency array to re-run the effect if uri changes

  return userData;
};
