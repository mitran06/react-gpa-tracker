import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';

declare const auth: Auth;
declare const db: Firestore;
declare const app: FirebaseApp;

export { auth, db };
export default app;
