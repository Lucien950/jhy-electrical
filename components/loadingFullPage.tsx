"use client"
import { Oval } from 'react-loader-spinner';

const loadingFullPage = () => (
	<div className="h-screen grid place-items-center">
		<Oval width={80} height={80} strokeWidth={8} color="#28a9fa" secondaryColor="#28a9fa" />
	</div>
)

export default loadingFullPage;