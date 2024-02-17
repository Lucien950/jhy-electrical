import Joi from "joi"

/**
 * @param schema Schema to validate against
 * @returns [validator, errorGenerator] where validator is a function that returns true if the candidate is valid, and errorGenerator is a function that returns the error if the candidate is invalid
 */
export function validateSchemaFunctionsGenerator<T>(schema: Joi.Schema): (c: any) => c is T{
	return (candidate: any): candidate is T => {
		const {value: _, error, warning} = schema.validate(candidate)
		if (error) {
			console.error(`schema validation error`, error.message)
			throw error
		}
		if (warning) console.warn(warning.message)
		return true
	}
}

/**
 * Validates object against schema
 * @param c Object in question
 * @param schema Schema to validate against
 * @returns The object if it matches the schema
 * @throws Error if the object does not match the schema
 */
export const validateSchema = <T>(c: any, schema: Joi.Schema): T => Joi.attempt(c, schema, "Invalid input")