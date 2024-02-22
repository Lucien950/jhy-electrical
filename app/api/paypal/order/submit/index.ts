import Joi from "joi"
import { attemptSchemaGenerator } from "util/typeValidate"

export type submitOrderProps = { token: string }
export type submitOrderRes = { firebaseOrderID: string }

const submitOrderPropsSchema = Joi.object({ token: Joi.string().required() })
export const attemptSubmitOrderProps = attemptSchemaGenerator<submitOrderProps>(submitOrderPropsSchema)