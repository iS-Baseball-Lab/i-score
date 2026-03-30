// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setLogLevel } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * 💡 Firebase 構成の復元
 * キャンバス環境から提供される __firebase_config を使用します。
 */
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : {
      apiKey: "mock-api-key",
      authDomain: "i-score-mock.firebaseapp.com",
      projectId: "i-score-mock",
      storageBucket: "i-score-mock.appspot.com",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:000000000000"
    };

// シングルトンパターンの適用
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

// デバッグログの有効化
setLogLevel('debug');

export { auth, db, app };
