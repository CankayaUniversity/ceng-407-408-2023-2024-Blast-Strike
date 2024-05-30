import { collection, getDocs, getDoc,addDoc,query,where,doc,updateDoc} from 'firebase/firestore/lite';
import { db } from './firebaseConfig.js';
import { getDistance, getRhumbLineBearing } from 'geolib';

const angleThreshold = 20; 
const maxDistance = 25;
const R = 6371e3; 
const toRadians = (degree) => degree * (Math.PI / 180);
const enemyWidth = 0.5; // in meter
 
async function hitPlayer(db, data) {
    let documentId = data['documentId'];
    let damage = data['damage'];
    let playerLat = parseFloat(data.location['latitude']);
    let playerLon = parseFloat(data.location['longitude']);
    let playerHeading = parseFloat (data.location['heading']);
    let enemyTeam = data['playerTeam']=="teamBlue" ? "teamRed" :"teamBlue";  /// iki ikişilik demoda karıyı vurmak için
    let newHealth=0;

    //let enemyTeam = data['playerTeam'];
    console.log("enemyTeam", enemyTeam);

    try {
        // Reference to the document using its ID
        const docRef = doc(db, 'Lobby',documentId);

        // Fetch the document
        const docSnapshot = await getDoc(docRef);

        // Check if the document exists
        if (docSnapshot.exists()) {
            // Access the field values from the document data
            const docData = docSnapshot.data();
            
            const enemyData = docData[enemyTeam][0];
            console.log(enemyData);

            const enemyLat = parseFloat(enemyData.locations._lat);
            const enemyLon = parseFloat(enemyData.locations._long);
            //const enemyHeading = parseFloat(enemyData.heading.trueHeading);

            console.log('Enemy Data:', enemyData);
            console.log('Enemy Latitude:', enemyLat);
            console.log('Enemy Longitude:', enemyLon);

            console.log("Player Latitude:",playerLat)
            console.log("Player Longtitude:",playerLon)
            console.log("Player Haeding:",playerHeading)

            //Haversine Algorithms
            const lat1 = enemyLat;
            const lon1 = enemyLon;
            const lat2 = playerLat;
            const lon2 = playerLon;

            const lat1Radians = toRadians(lat1);
            const lat2Radians = toRadians(lat2);
            const deltaLatRadians = toRadians(lat2 - lat1);
            const deltaLonRadians = toRadians(lon2 - lon1);

            const a = Math.sin(deltaLatRadians / 2) * Math.sin(deltaLatRadians / 2) +
                    Math.cos(lat1Radians) * Math.cos(lat2Radians) *
                    Math.sin(deltaLonRadians / 2) * Math.sin(deltaLonRadians / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            const distance = R * c;
            // adjust for object width
            const enemyWidthRadians = 2 * Math.atan(enemyWidth / (2 * distance));

            const bearing = getRhumbLineBearing(
                { latitude: playerLat, longitude: playerLon },
                { latitude: enemyLat, longitude: enemyLon }
            );
            
            //const angleDifference = Math.abs(playerHeading - bearing);
            
            // (playerHeading - bearing + 360) always pos
            // % 360 normalize circular nature
            let angleDifference = Math.abs((playerHeading - bearing + 360) % 360);
           //let angleDifferenceNegative = Math.abs((-playerHeading - bearing + 360) % 360);
            if (angleDifference > 180) {
                angleDifference = 360 - angleDifference;
            }

            /*
            if (angleDifferenceNegative > 180) {
                angleDifferenceNegative = 360 - angleDifferenceNegative;
            }
            */


            console.log('Enemy Radians:', enemyWidthRadians)
            console.log('Distance:', distance);
            console.log('Bearing:', bearing);
            console.log('Angle Difference:', angleDifference);

            if (Math.abs(angleDifference) <= enemyWidthRadians && distance <= maxDistance) {
                console.log("In sight!");
                //check enemy killed && score updates
                if(isDead(docData[enemyTeam][0].health,damage))
                    {
                    // console.log("isdead");
                    // console.log("data['playerTeam']",data['playerTeam']);
                    // console.log("docData[enemyTeam][0]",docData[enemyTeam][0]);
                        
                    /// eğer can 0dan aşşağı düşer ise enemy canı tekrar 100 e çekilecek ve vuran takımın puanına +1 eklenicek
                    // vurulanın canı 5 saniye sonra tekrar 100 e çek awaitsiz update çağır 5 saniye sonra
                    newHealth=0;
                    if(data['playerTeam'] == "teamRed")// if red team player kills blue team member update score
                    {
                    //  console.log("docData.scoreRed",docData.scoreRed);
                        docData.scoreRed+=1;
                        await updateDoc(docRef, {
                            scoreRed:  docData.scoreRed
                        });
                    }
                    else // if blue team player kills red team member update score
                    {
                    // console.log("docData.scoreBlue",docData.scoreBlue);
                        docData.scoreBlue+=1;
                        await updateDoc(docRef, {
                            scoreBlue:  docData.scoreBlue
                        });
                    }
    
                    setTimeout( async() => {   
                        docData[enemyTeam][0].health = 100;
                        //vurulanın   canını 100 yap   
                        await updateDoc(docRef, {
                            [`${enemyTeam}.0`]: docData[enemyTeam][0] 
                        });}, 5000); // Call myFunction after 5 seconds
                    }
                    else
                    {
                        newHealth=docData[enemyTeam][0].health-damage;
                    }
                    //check enemy killed && score updates - END
        
                    ////check if game ended 
                    if(docData.scoreBlue==5 || docData.scoreRed==5)
                    {
                        //update player health
                        docData[enemyTeam][0].health = newHealth;
                        //console.log("data",data);
                        await updateDoc(docRef, {
                        [`${enemyTeam}.0`]: docData[enemyTeam][0] 
                        });
                        await updateDoc(docRef, {
                            inGame: false
                        });
                    }
                    else{

                        if( docData[enemyTeam][0].health > 0)
                            {
                                //update player health
                                docData[enemyTeam][0].health = newHealth;
                                //console.log("data",data);
                                await updateDoc(docRef, {
                                    [`${enemyTeam}.0`]: docData[enemyTeam][0] 
                                });
                            }    
                    }
                return true;
            }
            
            else {
                console.log("Not in sight!");
                return false;
            }
            


        } else {
            console.log('Document does not exist');

        }
    } catch (error) {
        console.error('Error getting document data:', error);
        throw error;
    }
    return false;
}

// kill decide logic
function isDead (enemyHealth,damage){
   // console.log("enemyHealth",enemyHealth);
   // enemyHealth>0  to not kill currently dead player
    if(enemyHealth>0 && enemyHealth-damage<=0)
        return true;

    return false;
}

export { hitPlayer};