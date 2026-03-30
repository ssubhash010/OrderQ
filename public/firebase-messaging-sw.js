// public/firebase-messaging-sw.js

// 1. Import the Firebase background scripts
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// 2. Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: 'AIzaSyAaXMBdFkhjVmI_6UulkkbGXCLG95lO7tM',
  authDomain: 'orderq-eeae2.firebaseapp.com',
  projectId: 'orderq-eeae2',
  storageBucket: 'orderq-eeae2.firebasestorage.app',
  messagingSenderId: '203112335870',
  appId: '1:203112335870:web:7654b7a1b314303e07d8af',
  measurementId: 'G-BESCF9VM3V'
});
// 3. Retrieve firebase messaging
const messaging = firebase.messaging();

// 4. Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/Playstore_Icon_512.png' // Make sure you have an icon in your public folder!
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});