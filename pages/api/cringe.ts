import { NextApiRequest, NextApiResponse } from "next"

export default function error(req: NextApiRequest, res: NextApiResponse){
	res.status(500).end()
}