import Joi from "joi";
import { FormCard, formCardSchema } from "types/card";
import { PaymentSource } from "types/paypal";

export type approveCardProps = { token: string, card: FormCard }
export const approveCardPropsSchema = Joi.object({ token: Joi.string().required(), card: formCardSchema.required() })
export type approveCardRes = { newPaymentSource: PaymentSource }