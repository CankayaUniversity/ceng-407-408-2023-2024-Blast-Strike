import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const LoginLogo = () => {
  return (
    <View>
      <Image
        source={require('../../images/BlastStrikeLogo.jpg')}
        style={styles.image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom:20,
  },
});

export default LoginLogo;
