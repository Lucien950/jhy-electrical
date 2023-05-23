import { NextApiRequest, NextApiResponse } from "next";

export default function (req: NextApiRequest, res: NextApiResponse) {
	res.status(500).send("Specify a field you would like to update")
}