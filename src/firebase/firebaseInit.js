// Initialisation de l'app Firebase et export des services nécessaires
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import firebaseConfig from './firebaseConfig';

// Initialize Firebase if it hasn't been initialized already
let firebaseApp;
if (!firebase.apps.length) {
  firebaseApp = firebase.initializeApp(firebaseConfig);
} else {
  firebaseApp = firebase.app();
}

// Export auth and firestore services
export const auth = firebase.auth();
export const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence()
  .catch((err) => {
    console.error('Firestore persistence error:', err.code);
  });

export default firebaseApp;