import { useState,useRef, useEffect } from 'react';
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import {cameraWithTensors} from '@tensorflow/tfjs-react-native'
import { Button, StyleSheet, Text, TouchableOpacity,Platform, View, Dimensions } from 'react-native';
import { Camera, CameraType } from 'expo-camera';

export default function TensorCamera() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [video, setVideo] = useState(null)

  const cameraRef = useRef(null);
  const TensorCamera = cameraWithTensors(Camera);
  const [isCheck, setIsCheck] = useState(false);

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


const takePicture = () => {
  setIsCheck(true);
};


function detectHittedPart(segmentedParts){
  //damage = NULL;
  console.log(screenHeight/2);
  console.log(screenWidth/2);
  console.log(segmentedParts);
  console.log(segmentedParts.length);

  if(segmentedParts.length > 0)
  {
    // Is person hitted by head
    if(segmentedParts.find(part => part.part == "leftEar") &&
      segmentedParts.find(part => part.part == "rightEar") && 
      ((segmentedParts.find(part => part.part == "leftEar").position.x >= (screenWidth/2) && segmentedParts.find(part => part.part == "rightEar").position.x <= (screenWidth/2)) ||
      (segmentedParts.find(part => part.part == "leftEar").position.x <= (screenWidth/2) && segmentedParts.find(part => part.part == "rightEar").position.x >= (screenWidth/2))) &&
      segmentedParts.find(part => part.part == "leftShoulder").position.y >= (screenHeight/2)) 
    {
      console.log("Hitted by head, 100 dmg taken");
      damage = 100;
    }

    else if(segmentedParts.find(part => part.part == "leftShoulder") &&
            segmentedParts.find(part => part.part == "rightShoulder") &&
            ((segmentedParts.find(part => part.part == "leftShoulder").position.x <= (screenWidth/2) && segmentedParts.find(part => part.part == "rightShoulder").position.x >= (screenWidth/2)) || 
            (segmentedParts.find(part => part.part == "leftShoulder").position.x >= (screenWidth/2) && segmentedParts.find(part => part.part == "rightShoulder").position.x <= (screenWidth/2))) &&
            segmentedParts.find(part => part.part == "leftShoulder").position.y <= (screenHeight/2))
    {
      console.log("Hitted by body, 50 dmg taken");
      damage = 50;
    }

    else
    {
      console.log("Cant hit to someone");
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
      if(element.score >= 0.8){
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
        resizeHeight={screenWidth}
        resizeWidth={screenWidth}
        resizeDepth={3} 
        //autorender={true}
        cameraTextureHeight={screenWidth}
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
  },
  crossVertical: {
    position: 'absolute',
    backgroundColor: 'red',
    width: 2,
    height: 20,
  },
  crossHorizontal: {
    position: 'absolute',
    backgroundColor: 'red',
    width: 20,
    height: 2,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
    zIndex: 1
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