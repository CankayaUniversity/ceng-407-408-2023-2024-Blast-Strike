import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const ShootingButton = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../images/shooting_icon.png')} // Provide the local file path
        style={styles.image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    resizeMode: 'contain', // Adjust the resizeMode as needed
  },
});

export default ShootingButton;
