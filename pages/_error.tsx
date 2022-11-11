import { NextPage } from 'next'

interface Props {
	statusCode: number;
}

const ErrorPage: NextPage<Props> = ({ statusCode }: Props) => {
	return (
		<p>
			{statusCode
				? `An error ${statusCode} occurred on server`
				: 'An error occurred on client'}
		</p>
	)
}

ErrorPage.getInitialProps = async ({ res, err }): Promise<Props> => {
	const statusCode = (res ? res.statusCode : err ? err.statusCode : 404) as number
	return { statusCode }
}

export default ErrorPage