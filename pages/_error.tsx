import { NextPage } from 'next'

interface Props {
	statusCode: number;
}

const ErrorPage: NextPage<Props> = ({ statusCode }: Props) => {
	return (
		<div className="h-screen w-screen grid place-items-center">
			<p className="font-bold text-2xl">
				{statusCode
					? `An ${statusCode} error occurred on server`
					: 'An error occurred on client'}
			</p>
		</div>
	)
}

ErrorPage.getInitialProps = async ({ res, err }): Promise<Props> => {
	const statusCode = (res ? res.statusCode : err ? err.statusCode : 404) as number
	return { statusCode }
}

export default ErrorPage