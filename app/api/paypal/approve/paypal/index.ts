import Joi from "joi";
import { attemptSchemaGenerator } from "util/typeValidate";

export type approvePayPalProps = { token: string }
export const approvePayPalPropsSchema = Joi.object({ token: Joi.string().required() })
export type approvePayPalRes = { redirect_link: string }
export const attemptApprovePayPalProps = attemptSchemaGenerator<approvePayPalProps>(approvePayPalPropsSchema)