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
      <View style={styles.rotatedImageContainer}>
        <Image source={imagePath} style={styles.rotatedImage} />
      </View>
      {teamTag === 'blue' && (
        <View style={styles.middleRightTextBlue}>
          <Text style={styles.textStyleBlue}>Team Members:</Text>
          {winnerTeam && winnerTeam.map((user, index) => (
            <Text key={index}>-{user.username}</Text>
          ))}
        </View>
      )}
      {teamTag === 'red' && (
        <View style={styles.middleRightTextRed}>
          <Text style={styles.textStyleRed}>Team Members:</Text>
          {winnerTeam && winnerTeam.map((user, index) => (
            <Text key={index}>-{user.username}</Text>
          ))}
        </View>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={EndGame} style={styles.button}>
          <Text style={styles.buttonText}>Return Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  rotatedImageContainer: {
    flex: 1,
    width: '100%', // Ensures the container fills the width of the screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotatedImage: {
    width: '100%', // Ensures the image fills the width of the container
    height: '50%', // Ensures the image fills the height of the container
    transform: [{ rotate: '90deg' }],
  },
  middleRightTextRed: {
    position: 'absolute',
    width: '20%',
    top: '45%',
    right: '75%',
    transform: [{ rotate: '90deg' }], // Vertically center the text
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white', // Adjust color as needed
  },
  middleRightTextBlue: {
    position: 'absolute',
    width: '20%',
    top: '65%',
    right: '35%',
    transform: [{ rotate: '90deg' }], // Vertically center the text
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white', // Adjust color as needed
  },
  textStyleBlue: {
    color: 'black',
  },
  textStyleRed: {
    color: 'black',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: '7%', // Adjust this value to move the button up or down
    right: '40%', // Adjust this value to move the button left or right
    transform: [{ rotate: '90deg' }],
  },
  button: {
    backgroundColor: 'grey', // Button color
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5, // Rounded corners
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default GameEndScreen;
