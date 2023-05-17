import { Address } from "@paypal/paypal-js"
import { NextApiRequest, NextApiResponse } from "next";
import { PriceInterface } from "types/price";
export type updateOrderAddressProps = { token: string, address: Address, fullName: string}
export type updateOrderAddressRes = { newPrice: PriceInterface }

export default (req: NextApiRequest, res: NextApiResponse)=>{
	res.status(500).send("Specify a field you would like to update")
}