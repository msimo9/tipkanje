//import { } from 'https://www.gstatic.com/firebasejs/9.9.3/firebase-SERVICE.js';

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-firestore.js";

import {getStorage} from "https://www.gstatic.com/firebasejs/9.9.3/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBguTlDyZZDAZtktwNUicGTRAPqaESKrXM",
  authDomain: "tipkanje-dc76d.firebaseapp.com",
  projectId: "tipkanje-dc76d",
  storageBucket: "tipkanje-dc76d.appspot.com",
  messagingSenderId: "1094428680323",
  appId: "1:1094428680323:web:36831a16d542ef708efbb6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

export {auth, db, storage};