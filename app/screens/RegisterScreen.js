import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { FIREBASE_AUTH as auth } from '../../Database/Firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log('Registered with:', user.email);
      })
      .catch((error) => alert(error.message));
  };
//deneme1
  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={text => setEmail(text)} />
      <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={text => setPassword(text)} />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
}
