import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const GameEndScreen = ({navigation , winnerTeam}) => {

    const EndGame = () =>{
        navigation.navigate('HomeScreen');
    }

    return (
        <View style={styles.container}>
            <View style={styles.team}>
                <Text style={styles.teamHeading}>Winner Team</Text>
                <View style={styles.playerList}>
                    {winnerTeam && winnerTeam.map((user, index) => (
                        <Text key={index}>{user.username}</Text>
                    ))}
                </View>

                <View style={styles.endGameBtnContainer}>
                    <TouchableOpacity style={styles.endGameBtn} onPress={EndGame}>
                        <Text style={styles.endGameBtnText}>End Game</Text>
                    </TouchableOpacity>
                </View> 
            </View>
        </View>
      );  
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    team: {
      flex: 1,
      marginHorizontal: 5,
    },
    teamHeading: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    playerList: {
      borderWidth: 1,
      padding: 10,
    },
    endGameBtnContainer: {
      alignItems: 'center',
      borderRadius: 5,
    },
    endGameBtn: {
      backgroundColor: 'blue',
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    endGameBtnText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
  
  export default GameEndScreen;
