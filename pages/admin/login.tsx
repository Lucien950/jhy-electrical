//react cringe
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/router";

// auth handling
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import auth from "../../util/firebase/auth"

// loading
import LoadingFullPage from "../../components/loadingFullPage";
import { CircleLoader } from "react-spinners";

const AdminLogin = () => {
	const router = useRouter()
	const [loading, setLoading] = useState(true)
	const [logInLoading, setLogInLoading] = useState(false)
	useEffect(() => {
		onAuthStateChanged(auth, authUser => {
			if (authUser) router.push('/admin')
			else setLoading(false)
		})
	}, [])
	const submitLogin = async (e: FormEvent<HTMLFormElement>)=>{
		e.preventDefault()
		const email = ((e.target as HTMLFormElement).querySelector("#email")as HTMLInputElement).value
		const password = ((e.target as HTMLFormElement).querySelector("#password") as HTMLInputElement).value

		setLogInLoading(true)
		const userCredential = await signInWithEmailAndPassword(auth, email, password)
			.catch((error) => {
				//TODO display error message
				const errorCode = error.code;
				const errorMessage = error.message;
				console.error(errorCode, errorMessage)
			})
			
		console.log("login side user credential: ", userCredential)
		setLogInLoading(false)
	}

	if (loading){
		return (
			<LoadingFullPage />
		)
	}
	return (
		<div className="grid place-items-center h-screen">
			<form onSubmit={submitLogin} className="flex flex-col gap-y-3">
				<label htmlFor="email">email</label>
				<input type="email" className="border-2 p-2 w-64" id="email" name="email" required placeholder="Admin Email"/>
				<label htmlFor="password">password</label>
				<input type="password" className="border-2 p-2 w-64" id="password" name="password" required placeholder="Password"/>
				<button type="submit" className="border-2 p-2 flex justify-center" disabled={logInLoading}>
					{logInLoading
						? <CircleLoader size={24} />
						: <p>login</p>
					}
				</button>
			</form>
		</div>
	);
}

export default AdminLogin;