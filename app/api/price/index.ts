import Joi from "joi";
import { OrderProduct, orderProductSchema } from "types/order";
import { Price } from "types/price";

export type priceAPIProps = { productIDs: OrderProduct[] }
export const priceAPIPropsSchema = Joi.object({ productIDs: Joi.array().items(orderProductSchema).required(), })
export type priceAPIRes = { price: Price }