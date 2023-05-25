import Joi from "joi"

/**
 * @param schema Schema to validate against
 * @returns [validator, errorGenerator] where validator is a function that returns true if the candidate is valid, and errorGenerator is a function that returns the error if the candidate is invalid
 */
export function validateSchemaFunctionsGenerator<T>(schema: Joi.Schema): [(c: any) => c is T, (c: any) => (Joi.ValidationError | undefined)]{
	const errorGenerator = (candidate: any) => schema.validate(candidate).error
	const validator = (candidate: any): candidate is T => errorGenerator(candidate) === undefined
	return [validator, errorGenerator]
}

/**
 * Validates object against schema
 * @param c Object in question
 * @param schema Schema to validate against
 * @returns The object if it matches the schema
 * @throws Error if the object does not match the schema
 */
export const validateSchema = <T>(c: any, schema: Joi.Schema): T => Joi.attempt(c, schema, "Invalid input")