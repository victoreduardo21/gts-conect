import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

let app;
let db: any = null;
let auth: any = null;
let useFirebase = false;

try {
  if (firebaseConfig && firebaseConfig.projectId && firebaseConfig.apiKey) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    useFirebase = true;
    console.log('Firebase initialized with Project ID:', firebaseConfig.projectId);
  }
} catch (e) {
  console.error("Firebase initialization error, falling back to local database:", e);
}

export { app, db, auth, useFirebase };
export { collection, doc, getDocs, setDoc, deleteDoc };
