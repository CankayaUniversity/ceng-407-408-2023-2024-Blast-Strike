import { useState,useRef, useEffect } from 'react';
import * as tf from "@tensorflow/tfjs";
import * as bodyPix from "@tensorflow-models/body-pix";
import {cameraWithTensors} from '@tensorflow/tfjs-react-native'
import { Button, StyleSheet, Text, TouchableOpacity,Platform, View, Dimensions } from 'react-native';
import { ImageManipulator } from 'expo-image-manipulator';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import processImageForClassification from './CameraConverter';
import * as FileSystem from 'expo-file-system';

export default function TensorCamera() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [video, setVideo] = useState(null)
  const cameraRef = useRef(null);
  //const TensorCamera = cameraWithTensors(Camera);
  const [isCheck, setIsCheck] = useState(false);

  const textureDims = Platform.OS === 'ios' ?
{
  height: 1920,
  width: 1080,
} :
{
  height: 1920,
  width: 1080,
};
Height=textureDims.height;
Width=textureDims.width;

  useEffect(() => {
    const loadTf = async ()=>  {
      await tf.ready()
    }

    return () => {
      loadTf()
    }
  })

  useEffect(() => {
    const { width, height } = Dimensions.get('window');
    const midX = width / 2;
    const midY = height / 2;

    console.log('Midpoint of X: ', midX);
    console.log('Midpoint of Y: ', midY);
  }, [])

const takePicture = async () => {
  if (cameraRef.current) {
    const { uri } = await cameraRef.current.takePictureAsync();
    runBodysegment(uri)
  }
  //setIsCheck(true);
};


  const runBodysegment = async (uri) => {
    const net = await bodyPix.load();
    console.log("BodyPix model loaded.");
    //setVideo(images?.next().value)
    //const image = tf.browser.fromPixels({ uri });
    //let imageBuffer = tf.node.decodeImage(uri);
    //const image = tf.tensor(imageBuffer);
    //setVideo(image)
    //const processedImg = processImageForClassification(uri)
    //setVideo(processedImg)

    const img64 = await FileSystem.readAsStringAsync(uri, {encoding:FileSystem.EncodingType.Base64})
    const imgBuffer =  tf.util.encodeString(img64, 'base64').buffer
    const raw = new Uint8Array(imgBuffer)
    let imgTensor = decodeJpeg(raw)
    const scalar = tf.scalar(255)
    imgTensor = tf.image.resizeNearestNeighbor(imgTensor, [300, 300])
    const tensorScaled = imgTensor.div(scalar)
    const img = tf.reshape(tensorScaled, [1,300,300,3])
    setVideo(img)
    detect(net)
  };
   
  const detect = async (net) => {
    // Check data is available
    //console.log(video)
    if(video){
      console.log("video")
      const person = await net.segmentPersonParts(video);
      const newArray = []
      person?.allPoses[0]?.keypoints.forEach(element => {
        if(element.score >= 0.8){
          newArray.push({part:element.part, score: element.score, position: element.position})
        }
      });
      console.log(newArray)}
      setIsCheck(false);
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
     <Camera 
        ref={cameraRef}
        style={styles.camera} 
        type={Camera.Constants.Type.front}
        //onReady={isCheck ? runBodysegment : null}
        resizeHeight={1920}
        resizeWidth={1080}
        resizeDepth={3}
        //autorender={true}
        cameraTextureHeight={textureDims.height}
        cameraTextureWidth={textureDims.width}
        ratio='4:3'
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