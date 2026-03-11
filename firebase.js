var firebaseConfig = {
  apiKey: "AIzaSyAClOLR74zqBXr-Dgh05PcXTsSGWxE88Ak",
  authDomain: "expensive-a8726.firebaseapp.com",
  projectId: "expensive-a8726",
  storageBucket: "expensive-a8726.firebasestorage.app",
  messagingSenderId: "782348795899",
  appId: "1:782348795899:web:1776d5e15e59a439dfd55e",
  measurementId: "G-K077X1WVVK"
};

firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();
var auth = firebase.auth();