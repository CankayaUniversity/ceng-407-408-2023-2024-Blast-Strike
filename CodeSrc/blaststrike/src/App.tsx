import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,Image } from 'react-native';

import * as Location from "expo-location";
import { useEffect, useState } from 'react';

export default function App() {
  
  const [location,setLocation]=useState({})
  const [heading,setHeading]=useState({})

  useEffect(()=>{
    (async()=>{
      let {status} = await Location.requestForegroundPermissionsAsync()
      if(status =="granted"){
        console.log("Permission Suc")
      }
      else{
        console.log("Permisiion Not Suc")
      }
      const location= await Location.getCurrentPositionAsync()
      setLocation(location)
      
      const heading = Location.watchHeadingAsync((heading) => {
        console.log('Heading:', heading);
      });
      setHeading(heading)
    })()
    
  }, [])

  return (
    <View style={styles.container}>
      <Text>{JSON.stringify(location)}</Text>
      <Text>{JSON.stringify(heading)}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

