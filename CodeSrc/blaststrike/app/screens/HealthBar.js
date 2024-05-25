import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HealthBar = ({ value }) => {
    const fillStyle = {
        ...styles.fill,
        width: `${value}%`,
        backgroundColor: `rgb(${255 - value * 2},${value * 2} , 0)`, // Calculate color based on value
    };
          console.log(value)
    return (
        <View style={[styles.bar, { transform: [{ rotate: '90deg' }] }]}>
          <View style={fillStyle}>
            <Text style={styles.text}>{value}</Text>
          </View>
        </View>
      );
    };

const styles = StyleSheet.create({
  bar: {
    height: 20, // Height of the bar
    width: '100%', // Full width
    backgroundColor: 'transparent', // Color of the bar
    borderRadius: 15, // Rounded corners
    position: 'absolute', // Absolute positioning
    top: '49%', // Align to the top of the screen
    right: '47%', // Align to the left of the screen
  }, 
  fill: {
    borderRadius: 15, // Rounded corners
    backgroundColor: 'green', // Initial color of the bar
  },
  text: {
    textAlign : 'center',
    color: 'white',
    fontSize: 16,
  },
});

export default HealthBar;