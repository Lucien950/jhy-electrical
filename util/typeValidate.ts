import Joi from "joi"

/**
 * NOTE: Use this only to narrow types. If you want to throw errors, use validateSchema
 * @param schema Schema to validate against
 * @returns [validator, errorGenerator] where validator is a function that returns true if the candidate is valid, and errorGenerator is a function that returns the error if the candidate is invalid
 */
export function validateSchemaFunctionsGenerator<T>(schema: Joi.Schema){
	return (candidate: unknown): candidate is T => {
		const {value: _, error, warning} = schema.validate(candidate)
		if (error) {
			console.error(error)
			return false
		}
		if (warning) console.warn(warning.message)
		// console.log(_, error, warning)
		return true
	}
}

/**
 * Validates object against schema. Throws errors if invalid.
 * @param c Object in question
 * @param schema Schema to validate against
 * @returns The object if it matches the schema
 * @throws Error if the object does not match the schema
 */
export function attemptSchemaGenerator<T>(schema: Joi.Schema) {
	return (c: unknown): T => Joi.attempt(c, schema)
}