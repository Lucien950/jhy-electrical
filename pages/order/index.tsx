import { GetServerSideProps } from "next"


export default function Order() {
	return(<></>)
}
export const getServerSideProps: GetServerSideProps = async () => {
	return{
		redirect:{
			destination:"/",
			permanent:true
		}
	}
}