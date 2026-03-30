// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAaXMBdFkhjVmI_6UulkkbGXCLG95lO7tM',
  authDomain: 'orderq-eeae2.firebaseapp.com',
  projectId: 'orderq-eeae2',
  storageBucket: 'orderq-eeae2.firebasestorage.app',
  messagingSenderId: '203112335870',
  appId: '1:203112335870:web:7654b7a1b314303e07d8af',
  measurementId: 'G-BESCF9VM3V'
};
const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

export const onForegroundMessage = (callback) => {
  return onMessage(messaging, callback);
};


export const requestFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Replace with your Firebase Web Push Key (VAPID Key) from Project Settings -> Cloud Messaging
      const token = await getToken(messaging, { vapidKey: process.env.REACT_APP_VAPID_KEY});
      return token;
    }
  } catch (error) {
    console.error('FCM Token Error:', error);
    return null;
  }
};