import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');  // Get the screen width and height

const Scoreboard = ({ scoreRed, scoreBlue }) => {
  return (
    <View style={styles.scoreboardContainer}>
      <View style={[styles.scoreboard, styles.rotatedScoreboard]}>
        <View style={styles.team}>
          <Text style={styles.teamName}>Team Blue</Text>
          <Text style={[styles.score, styles.team1]}>{scoreBlue}</Text>
        </View>
        <View style={styles.team}>
          <Text style={styles.teamName}>Team Red</Text>
          <Text style={[styles.score, styles.team2]}>{scoreRed}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scoreboardContainer: {
    position: 'absolute',
    top: height * 0.1, // 11% of the screen height
    right: width * 0.05, // 8% of the screen width
    transform: [{ translateY: -80 }], // Consider adjusting based on device size if necessary
  },
  scoreboard: {
    width: width * 0.9, // Make width responsive, e.g., 90% of screen width
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  rotatedScoreboard: {
    // Uncomment and adjust rotation if needed for different orientations
    // transform: [{ rotate: '90deg' }],
  },
  team: {
    alignItems: 'center',
  },
  teamName: {
    fontSize: 15, // Consider using a scaling function for font sizes
    fontWeight: 'bold',
  },
  score: {
    fontSize: 24, // Consider using a scaling function for font sizes
    marginTop: 10,
  },
  team1: {
    color: '#00CCFF',
  },
  team2: {
    color: '#FF0000',
  },
});

export default Scoreboard;