import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../app/screens/LoginScreen';
import HomeScreen from '../app/screens/HomeScreen';
import RegisterScreen from '../app/screens/RegisterScreen'; // Adjust the path as necessary
import Lobby from '../app/screens/Lobby';
import CreateLobbyPopup from '../app/screens/CreateLobbyPopup';
import JoinLobbyPopup from '../app/screens/JoinLobbyPopUp';


const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} /> 
        <Stack.Screen name="Lobby" component={Lobby} options={{ headerShown: false }} /> 
        <Stack.Screen name="CreateLobbyPopup" component={CreateLobbyPopup} options={{ headerShown: false }}  />
        <Stack.Screen name="JoinLobbyPopup" component={JoinLobbyPopup} options={{ headerShown: false }}  />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;


















