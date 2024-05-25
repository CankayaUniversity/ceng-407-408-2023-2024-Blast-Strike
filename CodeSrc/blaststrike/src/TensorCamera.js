import * as tf from '@tensorflow/tfjs'
import {decodeJpeg} from '@tensorflow/tfjs-react-native'
import * as bodyPix from "@tensorflow-models/body-pix";
import * as FileSystem from 'expo-file-system';
import { Camera } from 'expo-camera';
import { Button, StyleSheet,Image, Text, TouchableOpacity, View, Dimensions} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { manipulateAsync } from 'expo-image-manipulator';
import Constants from 'expo-constants'; // Ensure Constants is correctly imported
import { doc, onSnapshot } from 'firebase/firestore';
import { FIRESTORE_DB as db } from '../Database/Firebase';
import Scoreboard from '../app/screens/ScoreBoard';
import ShootingButton from '../app/screens/ShootingButton'
import HealthBar from '../app/screens/HealthBar';
import GameEndScreen from '../app/screens/GameEndScreen';
import axios from 'axios';

export default function TensorCamera({ navigation, route }) {

  const URLhit = Constants?.expoConfig?.hostUri
  ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:4000/Game/hit`
  : 'https://yourapi.com/Game/hit';


  const {lobbyData,selectedTeam,username}=route.params;
 

  const [gameData, setGameData] = useState(null);

  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef(null);
  // Give default ratio value
  const [cameraRatio, setCameraRatio] = useState('16:9');

  let screenHeight;
  let screenWidth = 360;

  const [updateOnce, setUpdateOnce] = useState(true);
  const [userHealth, setUserHealth] = useState(100);

  const [scoreRed, setScoreRed] = useState(0);
  const [scoreBlue, setScoreBlue] = useState(0);



  //data snapshot listening for lobby information start
  const docId=lobbyData.documentId;
  const docRef = doc(db, "Lobby", docId);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      await requestPermission(status === 'granted');
      if (cameraRef.current) {
        const ratios = await cameraRef.current.getSupportedRatiosAsync();
        const window = Dimensions.get('window');
        const screenRatio = window.height / window.width;
        let bestRatio = ratios[0];

        let minDiff = Infinity;
        for (const ratio of ratios) {
          const parts = ratio.split(':');
          const ratioHeight = parseInt(parts[0]);
          const ratioWidth = parseInt(parts[1]);
          const currentRatio = ratioHeight / ratioWidth;
          const diff = Math.abs(currentRatio - screenRatio);

          if (diff < minDiff) {
            minDiff = diff;
            bestRatio = ratio;
          }
        }
        //console.log(ratios);
        //console.log(bestRatio);
        setCameraRatio(bestRatio);
      }
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

  //console.log("username",username);

  const unsubscribe = onSnapshot(docRef, (doc) => {
    // console.log("doc.data()['scoreBlue']",doc.data().scoreBlue);
    // console.log("scoreBlue.current",scoreBlue.current);
    // console.log("doc.data().scoreBlue!=scoreBlue.current",doc.data().scoreBlue!=scoreBlue.current);
     //scoreBlue.current=doc.data()['scoreBlue'];

     if(doc.data()[selectedTeam][0].health!=userHealth)
        setUserHealth(doc.data()[selectedTeam][0].health)

     if((doc.data().scoreRed!=scoreRed || doc.data().scoreBlue!=scoreBlue ))
       {
     //   setUpdateOnce(true);
       //  if(updateOnce){
           console.log("inside");
           setScoreBlue(doc.data()['scoreBlue']);
           setScoreRed(doc.data()['scoreRed']);
           //setGameData(doc.data());
           //console.log(gameData)
           if(doc.data().inGame == false)
           {
            if(doc.data().scoreBlue == 10)
            { 
              unsubscribe();
              navigation.replace('GameEndScreen', {
                winnerTeam: doc.data().teamBlue,
                teamTag:'blue'
              })
            }

            else if(doc.data().scoreRed == 10)
            {
              unsubscribe();
              navigation.replace('GameEndScreen', {
                winnerTeam: doc.data().teamRed,
                teamTag:'red'
              })
            }
           }
           //scoreBlue.current=doc.data()['scoreBlue'];
           //scoreRed.current=doc.data()['scoreRed'];
      //  }
      //   setUpdateOnce(false);
       }
 
    /*
     if((doc.data().scoreRed!=scoreRed.current ||doc.data().scoreBlue!=scoreBlue.current ))
       {
         setDummy(true);
         if (doc.exists() && dummy) {
           //console.log("Document data:", doc.data());
 
           console.log("doc.data()['scoreRed']",doc.data().scoreRed);
           console.log("scoreRed.current",scoreRed.current);
 
           console.log("doc.data()['scoreBlue']",doc.data().scoreBlue);
           console.log("scoreBlue.current",scoreBlue.current);
 
 
           if(doc.data()['scoreRed']!=scoreRed.current)
             {
               scoreRed.current=doc.data()['scoreRed'];
               //setScoreRed(doc.data()['scoreRed']);
             }
     
           if(doc.data()['scoreBlue']!=scoreBlue.current)
             {
               scoreBlue.current=doc.data()['scoreBlue'];
               //setScoreBlue(doc.data()['scoreBlue']);
             }
             console.log(scoreRed);
         } 
         setDummy(false);
       }
    */
     
   }, (error) => {
     console.log("Error getting document:", error);
   });


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
       try {
          console.log(1111)
           // Fetching user data from your backend
          const response = await axios.put(URLhit, {
            data: {
              playerTeam:selectedTeam,
              documentId:lobbyData.documentId,
              damage:damage
            }
           })
      } catch (error) {
          console.log('Error hit:', error);
          return; // Exit the function if there was an error fetching user data
       }
    }
  }
}


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
    detectHittedPart(newArray)
  }
}

const resizeImage = async (uri) => {
  const resizedImage = await manipulateAsync(
    uri,
    [{ resize: { width: screenWidth } }], // Adjust width as needed
    { compress: 0.2 } // Adjust compression quality as needed
  );
  return resizedImage.uri;
};


const takePicture = async () => {
  if (cameraRef.current) {
    const photo = await cameraRef.current.takePictureAsync();
    const resizedUri = await resizeImage(photo.uri);
    //setPhotoUri(resizedUri); // Here, you get the URI of the captured photo

    //console.log("uri = " + resizedUri);
    imgTensor = await transformImageToTensor(resizedUri);

    if(imgTensor !== undefined)
    {
      //console.log(imgTensor['shape'][0])
      screenHeight = imgTensor['shape'][0]
      const net = await bodyPix.load();
      console.log("BodyPix model loaded."); 
      detect(net, imgTensor);
    }
  }
};

const transformImageToTensor = async (uri)=>{
  if(uri)
  {
      console.log("TransformImageToTensor")
      const img64 = await FileSystem.readAsStringAsync(uri, {encoding:FileSystem.EncodingType.Base64})
      const imgBuffer =  tf.util.encodeString(img64, 'base64').buffer
      const raw = new Uint8Array(imgBuffer)
      let imgTensor = decodeJpeg(raw)
      console.log(imgTensor);
      /*
      const scalar = tf.scalar(255)
    //resize the image
      imgTensor = tf.image.resizeNearestNeighbor(imgTensor, [960, 540])
    //normalize; if a normalization layer is in the model, this step can be skipped
      const tensorScaled = imgTensor.div(scalar)
    //final shape of the rensor
      const img = tf.reshape(tensorScaled, [960,540,3])
      //console.log(img)
    */
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
        ratio = {cameraRatio}
      />

      {/* Cross */}
      <View style={styles.crossContainer}>
        <View style={styles.crossVertical} />
        <View style={styles.crossHorizontal} />
      </View>

      {/*score board*/}
      <Scoreboard scoreRed={scoreRed} scoreBlue={scoreBlue} />

      {/*Health bar */}
      <View style={styles.healtContainer}>
       <HealthBar value={userHealth} />
      </View>
      
      {/* Button Container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={takePicture} style={styles.button}>
          <ShootingButton/>
        </TouchableOpacity>
      </View>
      {/*photoUri && <Image source={{ uri: photoUri }} style={{ width: 100, height: 100 , opacity:1}} />*/}
    </View>
  );
}

const styles = StyleSheet.create({
  crossContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
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
    backgroundColor:'#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  healtContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%', // Take full width of the screen
    height: '100%', // Take full height of the screen
  },
});