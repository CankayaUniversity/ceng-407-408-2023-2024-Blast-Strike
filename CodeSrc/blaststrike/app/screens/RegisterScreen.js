// Import statements for React and useState hook, and other necessary imports
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { firebaseApp } from '../../Database/Firebase';
import LoginLogo from './LoginLogo';

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
        //Split firebase error from ":", so remove the Firebase: part from error string
        const parts = error.message.split(':');
        //Split the error part from "(" to get the actual error
        const error_parts = parts[1].split('(');
        //Remove the whitespaces from the actual error message
        const messagePart = error_parts[0].trim();
        let error_message;
        //Since firebase error format do not explain the error when invalid e-mail is entered, we need to check and generate an error message
        if(error_parts[1] == "auth/invalid-email).") {
          error_message = "Invalied e-mail entered. Please check your credentials."
        }
        else if(error_parts[1] == "auth/missing-email).") {
          error_message = "No e-mail is entered. Please check your credentials."
        }
        else if(error_parts[1] == "auth/missing-password).") {
          error_message = "No password is entered. Please check your credentials."
        }
        else {
          error_message = messagePart + '.';
        }
        Alert.alert("Registration Failed", error_message);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <View style={styles.container}>
      <LoginLogo/>
      {/* Existing TextInput and Button elements */}
      <Text style = {styles.title}>Register to play!</Text>
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
    backgroundColor: 'dimgray'
  },
  input: {
    width: '85%',
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  backButton: {
    marginTop: 15,
  },
  backButtonText: {
    color: '#4d2a00',
  },
  button: {
    width: '85%',
    padding: 15,
    backgroundColor: 'chocolate',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  // Existing styles...
});
