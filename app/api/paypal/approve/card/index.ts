import Joi from "joi";
import { FormCard, formCardSchema } from "types/card";
import { PaymentSource } from "types/paypal";
import { attemptSchemaGenerator } from "util/typeValidate";

export type approveCardProps = { token: string, card: FormCard }
const approveCardPropsSchema = Joi.object({
  token: Joi.string().required(),
  card: formCardSchema.required()
})
export type approveCardRes = { newPaymentSource: PaymentSource }
export const attemptApproveCardProps = attemptSchemaGenerator<approveCardProps>(approveCardPropsSchema)