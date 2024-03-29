import { collection, getDocs, addDoc,query,where,updateDoc } from 'firebase/firestore/lite';
import { db } from './firebaseConfig.js';

async function getUsers() {
    const usersCol = collection(db, 'Users');
    const userSnapshot = await getDocs(usersCol);
    const userList = userSnapshot.docs.map(doc => doc.data());
    console.log("user list", userList);
}

async function getUser(userName) {
    /////// şimdilik userName ile aratma yapıyoruz ilerde gereksinimlere göre değiştirilerbilir
    try {
        const usersRef = collection(db, 'Users');
        const q = query(usersRef, where('userName', '==', userName));
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
            userName: data.userName
        });
        console.log('User created successfully with ID:', docRef.id);

    } catch (error) {
        console.error('Error creating user:', error);
    }
}

export { getUsers, createUser,getUser };