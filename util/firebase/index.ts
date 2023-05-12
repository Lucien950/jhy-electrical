import { initializeApp } from "firebase/app";

const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: "jhy-electrical.appspot.com",
	messagingSenderId: "247277233354",
	appId: "1:247277233354:web:4070e7bdbd2edb05440033"
};

export const app = initializeApp(firebaseConfig)