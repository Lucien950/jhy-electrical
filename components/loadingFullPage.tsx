
import { Oval } from 'react-loader-spinner';

const loadingFullPage = () => {
	return (
		<div className="h-screen grid place-items-center">
			<Oval color="black" width={150} height={150}/>
		</div>
	);
}

export default loadingFullPage;