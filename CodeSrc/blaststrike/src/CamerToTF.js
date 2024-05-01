import * as tf from '@tensorflow/tfjs'
import {decodeJpeg} from '@tensorflow/tfjs-react-native'
import * as bodyPix from "@tensorflow-models/body-pix";
import * as FileSystem from 'expo-file-system';
import { Camera } from 'expo-camera';
import { Button, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { manipulateAsync } from 'expo-image-manipulator';

export default function CameraToTF(){

    const [permission, requestPermission] = Camera.useCameraPermissions();
    const cameraRef = useRef(null);

    useEffect(() => {
        (async () => {
          const { status } = await Camera.requestCameraPermissionsAsync();
          requestPermission(status === 'granted');
        })();
      }, []);
    

    useEffect(() => {
        const loadTf = async ()=>  {
          await tf.ready()
        }
    
        return () => {
          loadTf()
        }
      })

      const detect = async (net, imgTensor) => {
        // Check data is available
        //console.log(video)
        if(imgTensor){
          console.log("segmentation process");
          const person = await net.segmentPersonParts(imgTensor);
          const newArray = []
          // Returned: "part", "position": {"x", "y"}, "score"... 
          // In head: nose, leftEye, rightEye, leftEar, rightEar
          // In body: leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist, leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle
          person?.allPoses[0]?.keypoints.forEach(element => {
            if(element.score >= 0.75){
              newArray.push({part:element.part, score: element.score, position: element.position})
            }
          });
          console.log(newArray)
        }
      }

      const resizeImage = async (uri) => {
        const resizedImage = await manipulateAsync(
          uri,
          [{ resize: { width: 540 } }], // Adjust width as needed
          { compress: 0.7 } // Adjust compression quality as needed
        );
        return resizedImage.uri;
      };

    const takePicture = async () => {
        if (cameraRef.current) {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.5, // Adjust quality (0.0 - 1.0)
            width: 540, // Set target width
            height: 960, // Set target height
          });
          const resizedUri = await resizeImage(photo.uri);
          //setPhotoUri(resizedUri); // Here, you get the URI of the captured photo

          console.log("uri = " + resizedUri);
          imgTensor = await transformImageToTensor(resizedUri);

          if(imgTensor !== undefined)
          {
            const net = await bodyPix.load();
            console.log("BodyPix model loaded."); 
            detect(net, imgTensor);
          }
          //console.log(photoUri);
        }
      };


      const transformImageToTensor = async (uri)=>{
        //.ts: const transformImageToTensor = async (uri:string):Promise<tf.Tensor>=>{
        //read the image as base64
        if(uri)
        {
            console.log("TransformImageToTensor")
            const img64 = await FileSystem.readAsStringAsync(uri, {encoding:FileSystem.EncodingType.Base64})
            const imgBuffer =  tf.util.encodeString(img64, 'base64').buffer
            const raw = new Uint8Array(imgBuffer)
            let imgTensor = decodeJpeg(raw)
            console.log(imgTensor);
            
            const scalar = tf.scalar(255)
          //resize the image
            imgTensor = tf.image.resizeNearestNeighbor(imgTensor, [960, 540])
          //normalize; if a normalization layer is in the model, this step can be skipped
            const tensorScaled = imgTensor.div(scalar)
          //final shape of the rensor
            const img = tf.reshape(tensorScaled, [960,540,3])
            console.log(img)
            
            return imgTensor
        }
      }


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
            <View style={{ flex: 1 }}>
              <Camera 
                ref={cameraRef} 
                style={{ flex: 1 }}
                 />

            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={takePicture} style={styles.button}>
                <Text style={styles.buttonText}>Click me</Text>
                </TouchableOpacity>
            </View>

              {/*photoUri && <Image source={{ uri: photoUri }} style={{ width: 100, height: 100 , opacity:1}} />*/}
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
})