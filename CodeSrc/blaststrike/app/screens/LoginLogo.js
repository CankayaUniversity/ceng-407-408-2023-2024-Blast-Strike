import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const LoginLogo = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../images/BlastStrikeLogo.jpg')}
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
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
});

export default LoginLogo;
