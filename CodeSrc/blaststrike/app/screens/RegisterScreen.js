// Import statements for React and useState hook, and other necessary imports
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { firebaseApp } from '../../Database/Firebase';

const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);

export default function RegisterScreen({ navigation }) {
  // State hooks for user input and loading indicator
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = () => {
    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredentials) => {
        const user = userCredentials.user;
        await addDoc(collection(firestore, 'Users'), {
          username: username,
          email: user.email,
        });
        Alert.alert("Registration Successful", "You are now registered and logged in.");
        navigation.navigate("Login"); // Assuming "Login" is the name used in your stack navigator for the LoginScreen
      })
      .catch((error) => {
        Alert.alert("Registration Failed", error.message);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <View style={styles.container}>
      {/* Existing TextInput and Button elements */}
      <Text style = {{color: 'brown', fontSize:20}}>Register to play!</Text>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity style = {styles.button} onPress={handleSignUp}>
          <Text style = {{color:'white', fontSize:15}}>SIGN UP</Text>
        </TouchableOpacity>
      )}
      {/* Back to Login Button */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

// Add styling for the back button
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff3e6'
  },
  input: {
    width: '100%',
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  backButton: {
    marginTop: 15,
  },
  backButtonText: {
    color: '#brown',
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: 'firebrick',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  // Existing styles...
});
