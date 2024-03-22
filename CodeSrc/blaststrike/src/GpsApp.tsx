import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,Image } from 'react-native';

import * as Location from "expo-location";
import { useEffect, useState } from 'react';

 
// Haversine
function getDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (degrees) => {
      return degrees * Math.PI / 180;
  }

  const earthRadius = 6371000;

  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda= toRadians(lon2 - lon1);

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) *
      Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadius * c;
  return distance;
}

export default function App() {
  
  const [location,setLocation]=useState({})
  const [heading,setHeading]=useState({})
  const [distance, setDistance] = useState({})

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

      const distance = getDistance(
        location.coords.latitude,
        location.coords.longitude,
        34.0522, // default values must be changed
      -118.2437 
         
    );
    setDistance(distance);
    })()
    
  }, [])

  return (
    <View style={styles.container}>
      <Text>{JSON.stringify(location)}</Text>
      <Text>{JSON.stringify(heading)}</Text>
      <Text>{JSON.stringify(distance)}</Text>
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
