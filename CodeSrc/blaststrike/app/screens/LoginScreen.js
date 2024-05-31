import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { FIREBASE_AUTH as auth } from '../../Database/Firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import LoginLogo from './LoginLogo';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log('Logged in with:', user.email);
        setLoading(false);
        navigation.navigate('HomeScreen');
      })
      .catch((error) => {
        Alert.alert("Login Failed", "Please check your credentials.");
        setLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <LoginLogo/>
      <Text style = {[{color: '#D2691E'}, {fontSize: 24}, {fontStyle: 'italic'}]}>Welcome to BlastStrike!</Text>
      <Text style={styles.title}>Login to play!</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <TouchableOpacity onPress={handleLogin} style={styles.button} disabled={email === '' || password === ''}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerButton}>
        <Text style={styles.registerButtonText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'dimgray',
  },
  image: {
    width:10,
    height: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
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
  button: {
    width: '85%',
    padding: 15,
    backgroundColor: 'chocolate',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 15,
  },
  registerButtonText: {
    color: '#4d2a00',
  },
});