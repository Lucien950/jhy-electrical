import Joi from "joi";
import { OrderProduct, orderProductSchema } from "types/order";
import { Price } from "types/price";
import { attemptSchemaGenerator } from "util/typeValidate";

export type priceAPIProps = { productIDs: OrderProduct[] }
export type priceAPIRes = { price: Price }

export const priceAPIPropsSchema = Joi.object({ productIDs: Joi.array().items(orderProductSchema).required(), })
export const attemptPriceAPIProps = attemptSchemaGenerator<priceAPIProps>(priceAPIPropsSchema)