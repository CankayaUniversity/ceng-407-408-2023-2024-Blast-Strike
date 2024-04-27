import { collection, getDocs, getDoc,addDoc,query,where,doc,updateDoc} from 'firebase/firestore/lite';
import { db } from './firebaseConfig.js';

async function hitPlayer(db, data) {
    let documentId = data['documentId'];
    let damage = data['damage'];
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