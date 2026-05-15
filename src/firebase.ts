import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence, enableIndexedDbPersistence, disableNetwork, enableNetwork } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export { disableNetwork, enableNetwork };

// Enable Auth persistence (keeps user logged in even after closing browser)
setPersistence(auth, browserLocalPersistence);

// Enable Firestore persistence (allows reading/writing data while offline)
if (typeof window !== 'undefined') {
  // Try multi-tab persistence first
  enableMultiTabIndexedDbPersistence(db).catch(() => {
    // If multi-tab fails, try single tab
    enableIndexedDbPersistence(db).catch((err) => {
      console.warn('Firestore persistence failed:', err.code);
    });
  });
}
