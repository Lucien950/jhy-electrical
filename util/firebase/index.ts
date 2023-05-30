import { initializeApp } from "firebase/app";

const firebaseConfig = {
	apiKey: "AIzaSyDbIZw43TePQ9yKM4Ac8zAzC4hk6cTKO2Y",
	authDomain: "jhy-electrical.firebaseapp.com",
	projectId: "jhy-electrical",
	storageBucket: "jhy-electrical.appspot.com",
	messagingSenderId: "247277233354",
	appId: "1:247277233354:web:4070e7bdbd2edb05440033",
	measurementId: "G-8303B3C461",
}

export const app = initializeApp(firebaseConfig)