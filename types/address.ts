import {components} from "@paypal/paypal-js/types/apis/openapi/checkout_orders_v2"
import Joi from "joi"
import { validateSchemaFunctionsGenerator } from "util/typeValidate"

export const postalCodePattern = "^(?!.*[DFIOQUdfioqu])[A-VXYa-vxy][0-9][A-Za-z][ -]?[0-9][A-Za-z][0-9]$"
export const postalCodeSchema = Joi.string().regex(new RegExp(postalCodePattern)).required()
export const validatePostalCodeError = (candidate?: string) => postalCodeSchema.validate(candidate).error
export const validatePostalCode = (candidate?: string) => (candidate !== undefined) && (validatePostalCodeError(candidate) === undefined)

export const PROVINCE_NAME_TO_CODE = new Map(Object.entries({
	"alberta": "AB",
	"british columbia": "BC",
	"manitoba": "MB",
	"new brunswick": "NB",
	"newfoundland and labrador": "NL", "newfoundland": "NL", "labrador": "NL",
	"northwest territories": "NT",
	"nova scotia": "NS",
	"nunavut": "NU",
	"ontario": "ON",
	"prince edward island": "PE",
	"quebec": "QC",
	"saskatchewan": "SK",
	"yukon": "YT"
}))
export const PROVINCES = Array.from(PROVINCE_NAME_TO_CODE.keys())

export type Address = components["schemas"]["address_portable-2"]
export type addressFields = "address_line_1" | "address_line_2" | "admin_area_1" | "admin_area_2" | "postal_code" | "country_code"
export const addressSchema = Joi.object({
	address_line_1: Joi.string().max(300).required(),
	address_line_2: Joi.string().max(300).optional().allow(""),
	admin_area_1: Joi.string().valid(...PROVINCES).insensitive().required(),
	admin_area_2: Joi.string().required(),
	postal_code: postalCodeSchema,
	country_code: Joi.string().valid("CA").required(),
})
export const validateAddress = validateSchemaFunctionsGenerator<Address>(addressSchema)
