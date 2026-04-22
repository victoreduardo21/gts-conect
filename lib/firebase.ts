import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
console.log('Firebase initialized with Project ID:', firebaseConfig.projectId);
console.log('Using Database ID:', firebaseConfig.firestoreDatabaseId);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const useFirebase = true;

/**
 * Handle Firestore errors according to guidelines
 */
export const handleFirestoreError = (error: any, operationType: string, path: string | null = null) => {
  if (error.code === 'permission-denied') {
    const errorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: auth?.currentUser?.uid || 'anonymous',
        email: auth?.currentUser?.email || 'N/A',
        emailVerified: auth?.currentUser?.emailVerified || false,
        isAnonymous: auth?.currentUser?.isAnonymous || true,
        providerInfo: auth?.currentUser?.providerData || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
};

// Generic get connection test
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Connected Successfully to gts-conect');
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
       console.error("Please check your Firebase configuration or internet connection.");
    }
  }
}
