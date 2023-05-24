import Joi from "joi"

/**
 * @param schema Schema to validate against
 * @returns [validator, errorGenerator] where validator is a function that returns true if the candidate is valid, and errorGenerator is a function that returns the error if the candidate is invalid
 */
export function validateSchemaGenerator<T>(schema: Joi.Schema): [(c: any) => c is T, (c: any) => (Joi.ValidationError | undefined)]{
	const errorGenerator = (candidate: any) => schema.validate(candidate).error
	const validator = (candidate: any): candidate is T => errorGenerator(candidate) === undefined
	return [validator, errorGenerator]
}