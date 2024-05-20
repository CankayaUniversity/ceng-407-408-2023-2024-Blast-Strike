import { collection, getDocs, getDoc,addDoc,query,where,doc,updateDoc} from 'firebase/firestore/lite';
import { db } from './firebaseConfig.js';
import { getDistance, getRhumbLineBearing } from 'geolib';

async function hitPlayer(db, data) {
    console.log("00000000data ", data)
    let documentId = data['documentId'];
    let damage = data['damage'];
    let playerLat = parseFloat(data.location['latitude']);
    let playerLon = parseFloat(data.location['longitude']);
    let playerHeading = parseFloat(data.location['heading']);
    let enemyTeam = data['playerTeam']=="teamBlue" ? "teamRed" :"teamBlue";  /// iki ikişilik demoda karıyı vurmak için
    //let enemyTeam = data['playerTeam'];
    console.log("enemyTeam", enemyTeam);

    const angleThreshold = 30; 
    const maxDistance = 25;
    try {
        // Reference to the document using its ID
        const docRef = await doc(db, 'Lobby',documentId);

        // Fetch the document
        const docSnapshot = await getDoc(docRef);

        // Check if the document exists
        if (docSnapshot.exists()) {
            // Access the field values from the document data
            const dbData = docSnapshot.data();
            const enemyData = dbData[enemyTeam][0];

            if (!enemyData.locations || !enemyData.heading || !enemyData.locations._lat || !enemyData.locations._long) {
                throw new Error('Enemy latitude, longitude, or heading is undefined');
            }

            const enemyLat = parseFloat(enemyData.locations._lat);
            const enemyLon = parseFloat(enemyData.locations._long);
            const enemyHeading = parseFloat(enemyData.heading.trueHeading);;

            console.log('Enemy Data:', enemyData);
            console.log('Enemy Latitude:', enemyLat);
            console.log(typeof(enemyLat))
            console.log('Enemy Longitude:', enemyLon);
            console.log(typeof(enemyLon))
            console.log('Enemy Heading:', enemyHeading);
            console.log(typeof(enemyHeading))
            console.log("Player Latitude:",playerLat)
            console.log("Player Longtitude:",playerLon)
            console.log("Player Haeding:",playerHeading)

            //Haversine 
            const toRadians = (degree) => degree * (Math.PI / 180);

            const lat1 = enemyLat;
            const lon1 = enemyLon;
            const lat2 = playerLat;
            const lon2 = playerLon;

            const R = 6371e3; 

            const lat1Radians = toRadians(lat1);
            const lat2Radians = toRadians(lat2);
            const deltaLatRadians = toRadians(lat2 - lat1);
            const deltaLonRadians = toRadians(lon2 - lon1);

            const a = Math.sin(deltaLatRadians / 2) * Math.sin(deltaLatRadians / 2) +
                    Math.cos(lat1Radians) * Math.cos(lat2Radians) *
                    Math.sin(deltaLonRadians / 2) * Math.sin(deltaLonRadians / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            const distance = R * c;

            const bearing = getRhumbLineBearing(
                { latitude: playerLat, longitude: playerLon },
                { latitude: enemyLat, longitude: enemyLon }
            );
            const angleDifference = Math.abs(playerHeading - bearing);

            console.log('Distance:', distance);
            console.log('Bearing:', bearing);
            console.log('Angle Difference:', angleDifference);

            if (Math.abs(angleDifference) <= angleThreshold && distance <= maxDistance) {
                console.log("In sight!");
                data[enemyTeam][0].health -= damage; // Hasar uygula
            } 
            
            else {
                console.log("Not in sight!");
            }
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