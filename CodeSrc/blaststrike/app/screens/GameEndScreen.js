import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet,Image } from 'react-native';

const GameEndScreen = ({navigation , route}) => {

  const {winnerTeam,teamTag}=route.params;

    console.log("winnerTeam",winnerTeam);
    console.log("teamTag",teamTag);
    let imagePath;
    
    if(teamTag==='red')
    {
      imagePath= require('../../images/redTeamWinner.jpg');
    }
    else
    {
      imagePath= require('../../images/blueTeamWinner.jpg');
    }

    const EndGame = () =>{
        navigation.navigate('HomeScreen');
    }
    
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
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:'#000000'
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
    middleRightTextBlue: {
      position: 'absolute',
      width:'20%',
      top: '45%',
      right: '75%',
      transform: [{ rotate: '90deg' }], // Vertically center the text
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white', // Adjust color as needed
    },  
    middleRightTextRed: {
      position: 'absolute',
      width:'20%',
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
  });
  
  export default GameEndScreen;
