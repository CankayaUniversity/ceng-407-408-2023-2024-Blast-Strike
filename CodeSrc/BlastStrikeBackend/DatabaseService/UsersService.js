import { collection, getDocs, addDoc,query,where,updateDoc,doc,arrayUnion,deleteDoc } from 'firebase/firestore/lite';
import { db } from './firebaseConfig.js';

async function getUsers() {
    const usersCol = collection(db, 'Users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => doc.data());
    console.log("user list", userList);
}

async function getUser(username) {
    /////// şimdilik username ile aratma yapıyoruz ilerde gereksinimlere göre değiştirilerbilir
    try {
        const usersRef = collection(db, 'Users');
        const q = query(usersRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.log('No matching documents.');
            return null;
        } else {
            // Assuming there's only one user with the given email, you can access it like this:
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            return userData;
        }
    } catch (error) {
        console.error('Error getting user by email:', error);
        throw error;
    }
}


async function createUser(db, data) {
    try {
         const docRef = await addDoc(collection(db, 'Users'), {
            email: data.email,
            username: data.username
        });
        console.log('User created successfully with ID:', docRef.id);

    } catch (error) {
        console.error('Error creating user:', error);
    }
}
async function fetchCurrentUserData(db,data) {
    //const auth = getAuth();
  
    // const currentUser = auth.currentUser;
     if (data) {
       const usersRef = collection(db, 'Users');
       const q = query(usersRef, where("email", "==", data.email));
       const querySnapshot = await getDocs(q);
       if (!querySnapshot.empty) {
         // Accessing the first document's data since email is unique
         const userData = querySnapshot.docs[0].data();
         return userData; // Returning a single object
       } else {
         console.log('No user found with the given email.');
         return null; // No user found
       }
     } else {
       console.log('No current user.');
       return null; // No current user
     }
   }
   /**
    * 
    * @param {*} db 
    * @param {*} data 
    * Checks if there is valid username that got friendship request.
    * Creates a document in friendshipRequests database.
    */
   async function sendFriendRequest(db, data) {
    
    const requestExists = await checkFriendshipRequestExist(db, data);

    if (requestExists) {
      // Handle the case where the friendship request already exists
      throw new Error("Friendship request already exists between these users.");
      // Optionally, you could return here or throw an error, depending on how you want to handle this case
  
    }
    if (data) {
        
      try {
        const usersRef = collection(db, 'Users');
        const q = query(usersRef, where("username", "==", data.data.to_username));
        const querySnapshot = await getDocs(q);
        console.log("Query snapshot size:", querySnapshot.size); // Check how many documents were found
  
        if (!querySnapshot.empty) {
          const docRef = await addDoc(collection(db, "FriendRequests"), {
            from_username: data.data.from_username,
            status: data.data.status,
            to_username: data.data.to_username,
          });
          console.log("Document written with ID: ", docRef.id);
        } else {
          console.log("User not found with username:", data.data.to_username);
          throw new Error("User is not found");
        }
      } catch (error) {
        console.error('Error sending friend request:', error);
        throw error; // Ensure this error gets thrown for the caller to handle
      }
    }
  }
  async function checkFriendshipRequestExist(db, data) {
    let requestExists = false; // Default assumption
  
    if(data) {
      const usersRef = collection(db, 'FriendRequests');
      // Ensure you're querying with the correct structure
      const q = query(usersRef, 
                      where("from_username", "==", data.data.from_username),
                      where("to_username", "==", data.data.to_username));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        // If the querySnapshot is not empty, it means a friendship request already exists
        requestExists = true;
      }
    }
  
    return requestExists;
  }
  
  
   async function addFriends(db, data) {
    if (data) {
      const usersCollectionRef = collection(db, 'Users');
      console.log("First breakpoint");
      const q = query(usersCollectionRef, where('username', '==', data.to_username));
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (documentSnapshot) => {
          console.log("Second breakpoint");
          // Get the document ID
          const docId = documentSnapshot.id;
          // Create a reference to the document
          const docRef = doc(db, 'Users', docId);
          // Perform the update
          try {
            await updateDoc(docRef, {
              friends: arrayUnion(data.from_username)
            });
            console.log('Item added to the array successfully!');
          } catch (error) {
            console.error('Error updating document: ', error);
          }
        });
      } else {
        console.log('No documents matching the criteria.');
      }
    }
  }
 async function fetchFriendRequests(db,data)
 {
  try {
    const q = query(collection(db, "FriendRequests"), where("to_username", "==", data.to_username), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    const requestsArray = [];
    querySnapshot.forEach((doc) => {
      requestsArray.push(doc.data());
    });
   // console.log(requestsArray)
    return requestsArray;
  
} catch (error) {
  console.log("Error on fetching data",error);
  
}

 }

async function displayFriends(db,data)
{
  try
  {
  console.log(data);
  const usersRef = collection(db, 'Users');
  const q = query(usersRef, where("username", "==", data.username));
  const querySnapshot = await getDocs(q);
  const friendListArray=[]
  if (!querySnapshot.empty) {
    querySnapshot.forEach(async (doc) => {
      friendListArray.push(doc.data().friends)

    })}
    return friendListArray;

  }
  catch(error)
  {
    console.log("Error in display friends",error);
  }
}

 async function deleteAcceptedRequest(db, data) {
  // Check if the necessary data is present and not undefined.
  if (!data.to_username || !data.from_username) {
    console.error("Error: Missing or undefined to_username or from_username.");
    return; // Exit the function if the required data is missing or undefined.
  }

  try {
    // Define the query to find the matching friend requests.
    const q = query(
      collection(db, "FriendRequests"),
      where("to_username", "==", data.to_username),
      where("from_username", "==", data.from_username)
    );

    // Execute the query.
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No matching documents found to delete.");
      return;
    }

    // Loop over the documents returned by the query.
    for (const docSnapshot of querySnapshot.docs) {
      // For each document, delete it.
      await deleteDoc(doc(db, "FriendRequests", docSnapshot.id));
    }

    console.log("Document(s) deleted successfully.");
  } catch (error) {
    console.error("Error deleting document:", error);
  }
}


export { getUsers, createUser,getUser,fetchCurrentUserData,sendFriendRequest,addFriends,fetchFriendRequests,deleteAcceptedRequest,displayFriends };