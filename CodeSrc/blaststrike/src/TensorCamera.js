import { useState,useRef, useEffect } from 'react';
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import * as Location from "expo-location";
import {cameraWithTensors} from '@tensorflow/tfjs-react-native'
import { Button, StyleSheet, Text, TouchableOpacity,Platform, View, Dimensions } from 'react-native';
import { Camera, CameraType,useCameraPermissions } from 'expo-camera';
import axios from 'axios';


export default function TensorCamera({ route }) {
  const {lobbyData,selectedTeam}=route.params;
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [video, setVideo] = useState(null)

  const cameraRef = useRef(null);
  const TensorCamera = cameraWithTensors(Camera);
  const [isCheck, setIsCheck] = useState(false);

  const [tempLocation, setTempLocation] = useState(null);
  const [tempHeading, setTempHeading] = useState(null);

  const screenHeight = 960;
  const screenWidth = 540;

useEffect(() => {
    const loadTf = async ()=>  {
      await tf.ready()
    }

    return () => {
      loadTf()
    }
  })

useEffect(() => {
    const sendLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            setTempLocation(location);

            const heading = await Location.getHeadingAsync();
            setTempHeading(heading); 

            updateServer(location, heading);
        } catch (error) {
            console.error('Error fetching and sending location:', error);
        }
    };

    const intervalId = setInterval(sendLocation, 2000);
    return () => clearInterval(intervalId);
}, []);


useEffect(() => {

    if (tempHeading) {
        console.log("Updated TempHeading:", tempHeading);
    }
}, [tempHeading]); 

const updateServer = async (location, heading) => {
    const data = {
        playerTeam: selectedTeam,
        documentId: lobbyData.documentId,
        location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            heading: heading.trueHeading,
        },
    };

    try {
        const locationResponse = await axios.put('http://192.168.1.109:4000/Game/Gps', { data });
        console.log('Location server response:', locationResponse.data);
    } catch (error) {
        console.error('Error while sending location to server:', error);
    }
};

const takePicture = () => {
  setIsCheck(true);
};

function isInsideOfTolerance(actual_x, actual_y, predicted_x, predicted_y)
{
  tolerance_x = actual_x * 1.2;
  tolerance_y = actual_y * 1.2;
  if((predicted_x < tolerance_x && predicted_x > actual_x) &&
      (predicted_y < tolerance_y && predicted_y > actual_y))
      {
        return true;
      }
  
  tolerance_x = actual_x * 0.8;
  tolerance_y = actual_y * 0.8;
  if((predicted_x > tolerance_x && predicted_x < actual_x) &&
  (predicted_y > tolerance_y && predicted_y < actual_y))
  {
    return true;
  }
  return false;
}

async function detectHittedPart(segmentedParts) {
  console.log(segmentedParts);

  if (segmentedParts.length > 0) {
    // Is person hitted by head
    if (
        segmentedParts.find(part => part.part === "leftEar") &&
        segmentedParts.find(part => part.part === "rightEar") &&
        segmentedParts.find(part => part.part === "leftShoulder") &&
        segmentedParts.find(part => part.part === "rightShoulder") &&
        ((segmentedParts.find(part => part.part === "leftEar").position.x >= screenWidth / 2 &&
          segmentedParts.find(part => part.part === "rightEar").position.x <= screenWidth / 2) ||
          (segmentedParts.find(part => part.part === "leftEar").position.x <= screenWidth / 2 &&
            segmentedParts.find(part => part.part === "rightEar").position.x >= screenWidth / 2)) &&
          segmentedParts.find(part => part.part === "leftShoulder").position.y >= screenHeight / 2
        )
      {
      console.log("Hitted by head, 100 dmg taken - 1");
      damage = 100;
      } 
    
    else if (
        segmentedParts.find(part => part.part === "nose") &&
        segmentedParts.find(part => part.part === "nose").score > 0.90 &&
        isInsideOfTolerance(
          segmentedParts.find(part => part.part === "nose").position.x,
          segmentedParts.find(part => part.part === "nose").position.y,
          screenWidth / 2,
          screenHeight / 2
        )) 
      {
        console.log("Hitted by head, 100 dmg taken - 2");
        damage = 100;
      } 
      
      else if (
      segmentedParts.find(part => part.part === "leftEye") &&
      segmentedParts.find(part => part.part === "leftEye").score > 0.90 &&
      isInsideOfTolerance(
        segmentedParts.find(part => part.part === "leftEye").position.x,
        segmentedParts.find(part => part.part === "leftEye").position.y,
        screenWidth / 2,
        screenHeight / 2
      )) 
      {
        console.log("Hitted by head, 100 dmg taken - 3");
        damage = 100;
      } 
      
      else if (
      segmentedParts.find(part => part.part === "rightEye") &&
      segmentedParts.find(part => part.part === "rightEye").score > 0.90 &&
      isInsideOfTolerance(
        segmentedParts.find(part => part.part === "rightEye").position.x,
        segmentedParts.find(part => part.part === "rightEye").position.y,
        screenWidth / 2,
        screenHeight / 2
      )) 
      {
        console.log("Hitted by head, 100 dmg taken - 4");
        damage = 100;
      } 
      
      else if (
      segmentedParts.find(part => part.part === "leftEar") &&
      segmentedParts.find(part => part.part === "leftEar").score > 0.90 &&
      isInsideOfTolerance(
        segmentedParts.find(part => part.part === "leftEar").position.x,
        segmentedParts.find(part => part.part === "leftEar").position.y,
        screenWidth / 2,
        screenHeight / 2
      )) 
      {
        console.log("Hitted by head, 100 dmg taken - 5");
        damage = 100;
      } 
      
      else if (
      segmentedParts.find(part => part.part === "rightEar") &&
      segmentedParts.find(part => part.part === "rightEar").score > 0.90 &&
      isInsideOfTolerance(
        segmentedParts.find(part => part.part === "rightEar").position.x,
        segmentedParts.find(part => part.part === "rightEar").position.y,
        screenWidth / 2,
        screenHeight / 2
      )) 
      {
        console.log("Hitted by head, 100 dmg taken - 6"); 
        damage = 100;
      } 
      else if (
      segmentedParts.find(part => part.part === "leftShoulder") &&
      segmentedParts.find(part => part.part === "rightShoulder") &&
      ((segmentedParts.find(part => part.part === "leftShoulder").position.x <= screenWidth / 2 &&
        segmentedParts.find(part => part.part === "rightShoulder").position.x >= screenWidth / 2) ||
        (segmentedParts.find(part => part.part === "leftShoulder").position.x >= screenWidth / 2 &&
          segmentedParts.find(part => part.part === "rightShoulder").position.x <= screenWidth / 2)) &&
        segmentedParts.find(part => part.part === "leftShoulder").position.y <= screenHeight / 2
      )
      {
        console.log("Hitted by body, 50 dmg taken - 1");
        damage = 50;
      } 
    
      else if (
      segmentedParts.find(part => part.part === "leftShoulder") &&
      segmentedParts.find(part => part.part === "leftShoulder").score > 0.90 &&
      isInsideOfTolerance(
        segmentedParts.find(part => part.part === "leftShoulder").position.x,
        segmentedParts.find(part => part.part === "leftShoulder").position.y,
        screenWidth / 2,
        screenHeight / 2
      )) 
      {
        console.log("Hitted by body, 50 dmg taken - 2");
        damage = 50;
      } 
      
      else if (
      segmentedParts.find(part => part.part === "rightShoulder") &&
      segmentedParts.find(part => part.part === "rightShoulder").score > 0.90 &&
      isInsideOfTolerance(
        segmentedParts.find(part => part.part === "rightShoulder").position.x,
        segmentedParts.find(part => part.part === "rightShoulder").position.y,
        screenWidth / 2,
        screenHeight / 2
      )) 
      {
        console.log("Hitted by body, 50 dmg taken - 3");
        damage = 50;
      } 
      
      else if (
      segmentedParts.find(part => part.part === "leftElbow") &&
      segmentedParts.find(part => part.part === "leftElbow").score > 0.90 &&
      isInsideOfTolerance(
        segmentedParts.find(part => part.part === "leftElbow").position.x,
        segmentedParts.find(part => part.part === "leftElbow").position.y,
        screenWidth / 2,
        screenHeight / 2
      )) 
      {
        console.log("Hitted by body, 50 dmg taken - 4");
        damage = 50;
      } 
      
      else if (
      segmentedParts.find(part => part.part === "rightElbow") &&
      segmentedParts.find(part => part.part === "rightElbow").score > 0.90 &&
      isInsideOfTolerance(
        segmentedParts.find(part => part.part === "rightElbow").position.x,
        segmentedParts.find(part => part.part === "rightElbow").position.y,
        screenWidth / 2,
        screenHeight / 2
      )) 
      {
        console.log("Hitted by body, 50 dmg taken - 5");
        damage = 50;
      } 
      
      else if (
      segmentedParts.find(part => part.part === "leftWrist") &&
      segmentedParts.find(part => part.part === "leftWrist").score > 0.90 &&
      isInsideOfTolerance(
        segmentedParts.find(part => part.part === "leftWrist").position.x,
        segmentedParts.find(part => part.part === "leftWrist").position.y,
        screenWidth / 2,
        screenHeight / 2
      )) 
      {
          console.log("Hitted by body, 50 dmg taken - 6");
          damage = 50;
        } 
        
      else if (
      segmentedParts.find(part => part.part === "rightWrist") &&
      segmentedParts.find(part => part.part === "rightWrist").score > 0.90 &&
      isInsideOfTolerance(
        segmentedParts.find(part => part.part === "rightWrist").position.x,
        segmentedParts.find(part => part.part === "rightWrist").position.y,
        screenWidth / 2,
        screenHeight / 2
      )) 
      {
        console.log("Hitted by body, 50 dmg taken - 7");
        damage = 50;
      } 
      
      else if (
      segmentedParts.find(part => part.part === "leftHip") &&
      segmentedParts.find(part => part.part === "leftHip").score > 0.90 &&
      isInsideOfTolerance(
        segmentedParts.find(part => part.part === "leftHip").position.x,
        segmentedParts.find(part => part.part === "leftHip").position.y,
        screenWidth / 2,
        screenHeight / 2
      )) 
      {
        console.log("Hitted by body, 50 dmg taken - 8");
        damage = 50;
      } 
      
      else if (
      segmentedParts.find(part => part.part === "rightHip") &&
      segmentedParts.find(part => part.part === "rightHip").score > 0.90 &&
      isInsideOfTolerance(
        segmentedParts.find(part => part.part === "rightHip").position.x,
        segmentedParts.find(part => part.part === "rightHip").position.y,
        screenWidth / 2,
        screenHeight / 2
      ))
      {
        console.log("Hitted by body, 50 dmg taken - 9");
        damage = 50;
      } 
      
      else if (
      segmentedParts.find(part => part.part === "leftKnee") &&
      segmentedParts.find(part => part.part === "leftKnee").score > 0.90 &&
      isInsideOfTolerance(
        segmentedParts.find(part => part.part === "leftKnee").position.x,
        segmentedParts.find(part => part.part === "leftKnee").position.y,
        screenWidth / 2,
        screenHeight / 2
      )) 
      {
        console.log("Hitted by body, 50 dmg taken- 10");
        damage = 50;
      } 
      
      else if (
      segmentedParts.find(part => part.part === "rightKnee") &&
      segmentedParts.find(part => part.part === "rightKnee").score > 0.90 &&
      isInsideOfTolerance(
        segmentedParts.find(part => part.part === "rightKnee").position.x,
        segmentedParts.find(part => part.part === "rightKnee").position.y,
        screenWidth / 2,
        screenHeight / 2
      )) 
      {
        console.log("Hitted by body, 50 dmg taken - 11");
        damage = 50;
      } 
      
      else if (
      segmentedParts.find(part => part.part === "leftAnkle") &&
      segmentedParts.find(part => part.part === "leftAnkle").score > 0.90 &&
      isInsideOfTolerance(
        segmentedParts.find(part => part.part === "leftAnkle").position.x,
        segmentedParts.find(part => part.part === "leftAnkle").position.y,
        screenWidth / 2,
        screenHeight / 2
      )) 
      {
        console.log("Hitted by body, 50 dmg taken - 12");
        damage = 50;
      } 
      
      else if (
      segmentedParts.find(part => part.part === "rightAnkle") &&
      segmentedParts.find(part => part.part === "rightAnkle").score > 0.90 &&
      isInsideOfTolerance(
        segmentedParts.find(part => part.part === "rightAnkle").position.x,
        segmentedParts.find(part => part.part === "rightAnkle").position.y,
        screenWidth / 2,
        screenHeight / 2
      )) 
      {
        console.log("Hitted by body, 50 dmg taken - 13");
        damage = 50;
      } else {
      console.log("Cant hit to someone");
    }

    if(damage>0)
    {
      console.log(lobbyData);
      console.log("hitteyimmmm",tempLocation)
      

      try {
          console.log(1111)
           // Fetching user data from your backend
          const hitResponse = await axios.put('http://192.168.1.109:4000/Game/hit', {
            data: {
              playerTeam:selectedTeam,
              documentId:lobbyData.documentId,
              damage:damage,
              location:{
                latitude: tempLocation?.coords?.latitude,
                longitude: tempLocation?.coords?.longitude,
                heading: tempHeading?.trueHeading 
              }
            }
           })

      } catch (error) {
          console.log('Error hit:', error);
          return; // Exit the function if there was an error fetching user data
       }
    }

  }
}


const detect = async (net) => {
  // Check data is available
  //console.log(video)
  if(video){
    const person = await net.segmentPersonParts(video);
    const newArray = []
    // Returned: "part", "position": {"x", "y"}, "score"... 
    // In head: nose, leftEye, rightEye, leftEar, rightEar
    // In body: leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist, leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle
    person?.allPoses[0]?.keypoints.forEach(element => {
      if(element.score >= 0.75){
        newArray.push({part:element.part, score: element.score, position: element.position})
      }
    });
    setIsCheck(false);
    detectHittedPart(newArray);
  }
}

  const runBodysegment = async (images) => {
    const net = await bodyPix.load();
    console.log("BodyPix model loaded."); 
    setVideo(images?.next().value)
    detect(net)
  };

  const CallBodySegmentation = async(images) => {
    if(isCheck)
    {
      await runBodysegment(images);
    }
  }
   
    /*
    useEffect(() => {
      const interval = setInterval(() => {
        runBodysegment();
      }, 10000);
      return () => clearInterval(interval);
    }, []);
    */

  // runBodysegment()

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }


  return (
    <View style={styles.container}>
     <TensorCamera 
        ref={cameraRef}
        style={styles.camera} 
        type={Camera.Constants.Type.front}
        onReady={CallBodySegmentation}
        resizeHeight={screenHeight}
        resizeWidth={screenWidth}
        resizeDepth={3} 
        //autorender={true}
        cameraTextureHeight={screenHeight}
        cameraTextureWidth={screenWidth}
        ratio='16:9'
      />

      {/* Cross */}
      <View style={styles.crossContainer}>
        <View style={styles.crossVertical} />
        <View style={styles.crossHorizontal} />
      </View>

      {/* Button Container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={takePicture} style={styles.button}>
          <Text style={styles.buttonText}>Click me</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red'
  },
  camera: {
    width: '100%',
    height: '90%',
    zIndex: 1,
  },
  crossContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  crossVertical: {
    position: 'absolute',
    backgroundColor: 'red',
    width: 2,
    height: 20,
    zIndex: 9999,
  },
  crossHorizontal: {
    position: 'absolute',
    backgroundColor: 'red',
    width: 20,
    height: 2,
    zIndex: 9999,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
    zIndex: 9999
  },
  button: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});