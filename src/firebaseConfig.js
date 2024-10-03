import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence, FacebookAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import Firestore
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cấu hình Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC1E_w3n_Zr0Emdm1klVGXU8qeqRa-74BQ",
  authDomain: "fashionstore-3d195.firebaseapp.com",
  projectId: "fashionstore-3d195",
  storageBucket: "fashionstore-3d195.appspot.com",
  messagingSenderId: "799913536954",
  appId: "1:799913536954:android:debb76a33e6308403dc183",
};

// Khởi tạo Firebase App nếu chưa được khởi tạo
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // Sử dụng Firebase app hiện có
}

// Kiểm tra và khởi tạo dịch vụ xác thực nếu chưa khởi tạo
let auth;
try {
  // Thử lấy auth đã khởi tạo
  auth = getAuth(app); 
} catch (error) {
  // Nếu chưa có auth, khởi tạo với persistence để lưu trạng thái đăng nhập
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Khởi tạo Firestore
const db = getFirestore(app); // Khởi tạo Firestore

// Khởi tạo Facebook và Google Auth Provider
const facebookProvider = new FacebookAuthProvider();
const googleProvider = new GoogleAuthProvider();

// Export các thành phần cần thiết
export { auth, db, facebookProvider, googleProvider };

