import Joi from "joi"

describe("String Tests", ()=>{
	it("Should convert to Base64", async ()=>{
		const { toB64 } = await import("util/string")
		expect(toB64("Hello World")).toBe("SGVsbG8gV29ybGQ=")
		expect(toB64("Hello World!")).toBe("SGVsbG8gV29ybGQh")
		expect(toB64("Hello World!!")).toBe("SGVsbG8gV29ybGQhIQ==")
		expect(toB64("acbed:asodij")).toBe("YWNiZWQ6YXNvZGlq")
	})

	it("Should convert to Sentence Case", async ()=>{
		const {toSentenceCase} = await import("util/string")
		expect(toSentenceCase("hello world")).toBe("Hello world")
		expect(toSentenceCase("Hello world")).toBe("Hello world")
		expect(toSentenceCase("HELLO WORLD")).toBe("Hello world")
	})
})

describe("Type Validation Tests", ()=>{
	const objSchema = Joi.object({
		a: Joi.string().required(),
		b: Joi.number().required(),
		c: Joi.boolean().required(),
		d: Joi.array().items(Joi.string()).required(),
	})
	it("Should Generate Validation and Error Functions for Joi", async ()=>{
		const { validateSchemaFunctionsGenerator } = await import("util/typeValidate")
		const [validateObj, validateObjErr] = validateSchemaFunctionsGenerator(objSchema)
		expect(validateObj({a: "a", b: 1, c: true, d: ["a"]})).toBe(true)
		expect(validateObjErr({a: "a", b: 1, c: true, d: ["a"]})).toBe(undefined)
		expect(validateObj({a: "a", b: 1, c: true, d: ["a", 1]})).toBe(false)
		expect(validateObjErr({a: "a", b: 1, c: true, d: ["a", 1]})).toBeInstanceOf(Joi.ValidationError)
		expect(validateObj({a: "a", b: 1, c: true, d: ["a", "b"]})).toBe(true)
		expect(validateObjErr({a: "a", b: 1, c: true, d: ["a", "b"]})).toBe(undefined)
	})
})