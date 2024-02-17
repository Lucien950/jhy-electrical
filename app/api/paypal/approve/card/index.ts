import Joi from "joi";
import { Card, cardSchema } from "types/card";
import { PaymentSource } from "types/paypal";

export type approveCardProps = { token: string, card: Card }
export const approveCardPropsSchema = Joi.object({ token: Joi.string().required(), card: cardSchema.required() })
export type approveCardRes = { newPaymentSource: PaymentSource }