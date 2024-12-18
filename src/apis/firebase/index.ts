import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  DocumentData,
  DocumentSnapshot,
  getFirestore,
  onSnapshot,
  QuerySnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
} from "firebase/functions";
import { DataType } from "../../views/dashboard/registrations/registrations";

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
const storage = getStorage(app);
const functions = getFunctions(app);
if (process.env.REACT_APP_ENV === "dev") {
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

export async function login(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}
export async function logout() {
  await signOut(auth);
}
export async function sendRecoverPasswordEmail(email: string) {
  await sendPasswordResetEmail(auth, email);
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
export async function updateDocument(path: string, id: string, data: any) {
  const docRef = doc(db, path, id);
  await updateDoc(docRef, data);
}
export async function deleteDocument(path: string, id: string) {
  const docRef = doc(db, path, id);
  await deleteDoc(docRef);
}

export function onCollectionChange(
  path: string,
  onValue: (collection: QuerySnapshot<DocumentData>) => void
) {
  return onSnapshot(collection(db, path), onValue);
}

export async function uploadFile(
  id: string,
  filename: string,
  file: File | Blob
) {
  const storageRef = ref(storage, `${id}/${filename}`);
  const result = await uploadBytes(storageRef, file);

  const downloadUrl = await getDownloadURL(result.ref);
  return downloadUrl;
}
export async function deleteFile(path: string, id: string) {
  const storageRef = ref(storage, `${path}/${id}`);
  await deleteObject(storageRef);
}

export function generateDocId(path: string) {
  return doc(collection(db, path)).id;
}

export async function insertData(dataType: DataType, data: any, id?: string) {
  try {
    const insertDataCallable = httpsCallable(functions, "insertData");
    data = { ...data, dataType };
    if (!!id) data.id = id;
    await insertDataCallable(data);
  } catch (error: any) {
    console.log(error);
    return error.message || "Falha ao tentar criar usuário";
  }
}
export async function editData(dataType: DataType, id: string, data: any) {
  try {
    const editDataCallable = httpsCallable(functions, "editData");
    await editDataCallable({ ...data, id, dataType });
  } catch (error: any) {
    console.log(error);
    return error.message || "Falha ao tentar criar usuário";
  }
}
export async function deleteData(dataType: DataType, id: string) {
  try {
    const deleteDataCallable = httpsCallable(functions, "deleteData");
    await deleteDataCallable({ id, dataType });
  } catch (error: any) {
    console.log(error);
    return error.message || "Falha ao tentar criar usuário";
  }
}
