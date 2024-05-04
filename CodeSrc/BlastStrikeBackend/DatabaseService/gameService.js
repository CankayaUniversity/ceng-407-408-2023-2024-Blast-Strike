import { collection, getDocs, getDoc,addDoc,query,where,doc,updateDoc} from 'firebase/firestore/lite';
import { db } from './firebaseConfig.js';

async function hitPlayer(db, data) {
    let documentId = data['documentId'];
    let damage = data['damage'];
    let enemyTeam = data['playerTeam']=="teamBlue" ? "teamRed" :"teamBlue";  /// iki ikişilik demoda karıyı vurmak için
    let newHealth=0;
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
            const docData = docSnapshot.data();

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
                    //vurulanın   canını 100 yap   
                    await updateDoc(docRef, {
                        [`${enemyTeam}.0.health`] :100
                    });}, 5000); // Call myFunction after 5 seconds
                    
            }
            else
            {
                newHealth=docData[enemyTeam][0].health-damage;
            }
           //check enemy killed && score updates - END

            ////check if game ended 
            if(docData.scoreBlue==10 || docData.scoreRed==10)
            {
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
   
            


        } else {
            console.log('Document does not exist');

        }
    } catch (error) {
        console.error('Error getting document data:', error);
        throw error;
    }
    return true;
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