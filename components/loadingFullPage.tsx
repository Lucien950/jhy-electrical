
// https://www.npmjs.com/package/react-spinners
import CircleLoader from "react-spinners/CircleLoader";
import { CSSProperties } from "react";


const override: CSSProperties = {
	animationFillMode: "none"
};

const loadingFullPage = () => {
	return (
		<div className="h-screen grid place-items-center">
			<CircleLoader color="black" size={150} cssOverride={override}/>
		</div>
	);
}

export default loadingFullPage;