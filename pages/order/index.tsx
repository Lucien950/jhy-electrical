import { GetServerSideProps } from "next"

export default function Order(){}

export const getServerSideProps: GetServerSideProps = async () => {
	return{
		redirect:{
			destination:"/",
			permanent:true
		}
	}
}