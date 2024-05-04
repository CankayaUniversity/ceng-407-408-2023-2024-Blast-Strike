import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
    top: '50%',
    right: -140,
    transform: [{ translateY: -50 }],
  },
  scoreboard: {
    width: 350,
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
    transform: [{ rotate: '90deg' }],
  },
  team: {
    alignItems: 'center',
  },
  teamName: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  score: {
    fontSize: 24,
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
