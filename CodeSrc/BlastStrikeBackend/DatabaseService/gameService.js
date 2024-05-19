import { collection, getDocs, getDoc,addDoc,query,where,doc,updateDoc} from 'firebase/firestore/lite';
import { db } from './firebaseConfig.js';
import { getDistance, getRhumbLineBearing } from 'geolib';

async function hitPlayer(db, data) {
    let documentId = data['documentId'];
    let damage = data['damage'];
    let playerLat = data['latitude'];
    let playerLon = data['longitude'];
    let playerHeading = data['heading'];
    let enemyTeam = data['playerTeam']=="teamBlue" ? "teamRed" :"teamBlue";  /// iki ikişilik demoda karıyı vurmak için
    //let enemyTeam = data['playerTeam'];
    console.log("enemyTeam", enemyTeam);
    try {
        // Reference to the document using its ID
        const docRef = await doc(db, 'Lobby',documentId);

        // Fetch the document
        const docSnapshot = await getDoc(docRef);

        // Check if the document exists
        if (docSnapshot.exists()) {
            // Access the field values from the document data
            const data = docSnapshot.data();
            const enemyData = data[enemyTeam][0];
            const enemyLat = enemyData.locations._lat;
            const enemyLon = enemyData.locations._long;
            const enemyHeading = enemyData.heading.trueHeading;

            console.log('Enemy Data:', enemyData);

            const distance = getDistance(
                { latitude: playerLat, longitude: playerLon },
                { latitude: enemyLat, longitude: enemyLon }
            );

            const bearing = getRhumbLineBearing(
            { latitude: playerLat, longitude: playerLon },
            { latitude: enemyLat, longitude: enemyLon }
            );

            const angleDifference = Math.abs(playerHeading - bearing);

            console.log('Distance:', distance);
            console.log('Bearing:', bearing);
            console.log('Angle Difference:', angleDifference);

            
            //console.log("data[enemyTeam]",data[enemyTeam.toString()][0].health);
            data[enemyTeam][0].health -=damage;
            console.log("data",data);
            await updateDoc(docRef, {
                [`${enemyTeam}.0`]: data[enemyTeam][0] 
            });

        } else {
            console.log('Document does not exist');

        }
    } catch (error) {
        console.error('Error getting document data:', error);
        throw error;
    }
    return true;
}

export { hitPlayer};