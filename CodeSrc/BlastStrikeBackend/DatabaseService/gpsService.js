import { collection, getDocs, getDoc,addDoc,query,where,doc,updateDoc,GeoPoint} from 'firebase/firestore/lite';
import { db } from './firebaseConfig.js';

async function getGpsLocation(db, data) {
    let documentId = data['documentId'];
    console.log("docId",documentId);
    let location = data ['location'];
    console.log("loc", location.latitude, location.longitude);
    let playerTeam = data['playerTeam'];  
    console.log("playerTeam", playerTeam);

    const geoPoint = new GeoPoint(location.latitude, location.longitude);

    try {
        // Reference to the document using its ID
        const docRef = await doc(db, 'Lobby',documentId);

        // Fetch the document
        const docSnapshot = await getDoc(docRef);

        // Check if the document exists
        if (docSnapshot.exists()) {
            // Access the field values from the document data
            const data = docSnapshot.data();
            console.log("dataaaaaa",data);

            
            data[playerTeam][0].locations = geoPoint;

            console.log("Updated data", data[playerTeam][0]);

            await updateDoc(docRef, {
                [`${playerTeam}.0`]: data[playerTeam][0]
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

export { getGpsLocation};