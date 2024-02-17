import Joi from "joi";

export type approvePayPalProps = { token: string }
export const approvePayPalPropsSchema = Joi.object({ token: Joi.string().required() })
export type approvePayPalRes = { redirect_link: string }