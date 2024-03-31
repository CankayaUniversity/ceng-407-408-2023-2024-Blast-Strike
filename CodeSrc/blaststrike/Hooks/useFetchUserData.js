import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const URL = 'http://localhost:4000/fetchCurrentUserData';
const auth = getAuth();

export const useFetchUserData = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const fetchUserData = async () => {
          try {
            const response = await axios.post(URL, {
              email: currentUser.email,
            });
            setUserData(response.data); // Adjust according to your response structure
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };

        fetchUserData();
      } else {
        console.error('No user logged in');
        setUserData(null);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on component unmount
  }, []);

  return userData;
};
