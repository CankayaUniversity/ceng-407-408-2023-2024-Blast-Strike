import { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
const URL = 'http://10.0.2.2:4000/fetchCurrentUserData';
const auth = getAuth();

export const useFetchUserData = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('No user logged in');
        return;
      }
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
  }, []);

  return userData;
};
