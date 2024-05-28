import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const GameEndScreen = ({ navigation, route }) => {
  const { winnerTeam, teamTag } = route.params;

  let imagePath;
  if (teamTag === 'red') {
    imagePath = require('../../images/redTeamWinner.jpg');
  } else {
    imagePath = require('../../images/blueTeamWinner.jpg');
  }

  const EndGame = () => {
    navigation.replace('HomeScreen');
  };

  return (
    <View style={styles.container}>
      <Image source={imagePath} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.teamHeader}>{teamTag === 'blue' ? 'Blue Team Member:' : 'Red Team Member:'}</Text>
        <Text style={styles.teamHeader}>{winnerTeam[0].username}</Text>
      </View>
      <TouchableOpacity onPress={EndGame} style={styles.button}>
        <Text style={styles.buttonText}>Return Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  image: {
    width: '100%', // Adjust as needed
    height: '50%', // Adjust as needed
    resizeMode: 'contain',
  },
  infoContainer: {
    alignItems: 'center',
    width: '100%',
  },
  teamHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  username: {
    fontSize: 18,
    color: 'white',
  },
  button: {
    backgroundColor: 'grey',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default GameEndScreen;
