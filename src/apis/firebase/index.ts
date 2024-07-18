import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  DocumentSnapshot,
  getFirestore,
  onSnapshot,
  query,
  QuerySnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function login(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}
export async function logout() {
  await signOut(auth);
}
export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function onDocChange(
  path: string,
  id: string,
  onValue: (doc: DocumentSnapshot<DocumentData>) => void
) {
  const dbRef = doc(db, path, id);
  return onSnapshot(dbRef, onValue);
}
export async function setDocument(path: string, id: string, data: any) {
  const dbRef = doc(db, path, id);
  await setDoc(dbRef, data);
}
export async function pushDoc(path: string, data: any, withCreatedAt = true) {
  const dbRef = collection(db, path);

  if (withCreatedAt) data.createdAt = serverTimestamp();
  await addDoc(dbRef, data);
}
export async function deleteDocument(path: string, id: string) {
  const docRef = doc(db, path, id);
  await deleteDoc(docRef);
}

export function onCollectionChange(
  path: string,
  onValue: (collection: QuerySnapshot<DocumentData>) => void
) {
  const _query = query(collection(db, path));
  return onSnapshot(_query, onValue);
}
