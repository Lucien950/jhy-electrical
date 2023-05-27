describe("String Tests", () => {
	it("Should convert to Base64", async () => {
		const { toB64 } = await import("util/string")
		expect(toB64("Hello World")).toBe("SGVsbG8gV29ybGQ=")
		expect(toB64("Hello World!")).toBe("SGVsbG8gV29ybGQh")
		expect(toB64("Hello World!!")).toBe("SGVsbG8gV29ybGQhIQ==")
		expect(toB64("acbed:asodij")).toBe("YWNiZWQ6YXNvZGlq")
	})

	it("Should convert to Sentence Case", async () => {
		const { toSentenceCase } = await import("util/string")
		expect(toSentenceCase("hello world")).toBe("Hello world")
		expect(toSentenceCase("Hello world")).toBe("Hello world")
		expect(toSentenceCase("HELLO WORLD")).toBe("Hello world")
	})
})

import Joi from "joi"
import { OrderProductFilled } from "types/order"
import { ProductInterface } from "types/product"
import { validateSchema, validateSchemaFunctionsGenerator } from "util/typeValidate"
describe("Type Validation Tests", () => {
	const objSchema = Joi.object({
		a: Joi.string().required(),
		b: Joi.number().required(),
		c: Joi.boolean().required(),
		d: Joi.array().items(Joi.string()).required(),
	})

	it("Should Generate Validation and Error Functions for Joi", async () => {
		const [validateObj, validateObjErr] = validateSchemaFunctionsGenerator(objSchema)
		expect(validateObj({ a: "a", b: 1, c: true, d: ["a"] })).toBe(true)
		expect(validateObjErr({ a: "a", b: 1, c: true, d: ["a"] })).toBe(undefined)
		expect(validateObj({ a: "a", b: 1, c: true, d: ["a", 1] })).toBe(false)
		expect(validateObjErr({ a: "a", b: 1, c: true, d: ["a", 1] })).toBeInstanceOf(Joi.ValidationError)
		expect(validateObj({ a: "a", b: 1, c: true, d: ["a", "b"] })).toBe(true)
		expect(validateObjErr({ a: "a", b: 1, c: true, d: ["a", "b"] })).toBe(undefined)
	})

	it("Should not throw errors, and return value when valid", async () => {
		expect(() => validateSchema({ a: "a", b: 1, c: true, d: ["a"] }, objSchema)).not.toThrow()
		expect(validateSchema({ a: "a", b: 1, c: true, d: ["a"] }, objSchema)).toStrictEqual({ a: "a", b: 1, c: true, d: ["a"] })
		expect(() => validateSchema({ a: "a", b: 1, c: true, d: ["a", "b"] }, objSchema)).not.toThrow()
		expect(validateSchema({ a: "a", b: 1, c: true, d: ["a", "b"] }, objSchema)).toStrictEqual({ a: "a", b: 1, c: true, d: ["a", "b"] })
	})

	it("Should throw errors when invalid", ()=>{
		expect(() => validateSchema({ a: "a", b: 1, c: true, d: ["a", 1] }, objSchema)).toThrow()
		expect(() => validateSchema({ a: "a", b: 1, c: "no", d: ["a"] }, objSchema)).toThrow()
		expect(() => validateSchema({ a: "a", b: null, c: true, d: ["a"] }, objSchema)).toThrow()
		expect(() => validateSchema({ a: ["a"], b: 1, c: true, d: ["a"] }, objSchema)).toThrow()
	})
})

import * as calculateShippingModule from "../server/shipping/calculateShipping"
import { makePrice } from "./priceUtil"
import { Decimal } from "decimal.js"

describe("Price Tests", () => {
	const products: OrderProductFilled[] = [
		{
			PID: "abc",
			quantity: 3,
			product: { price: 0.01 } as ProductInterface
		},
		{
			PID: "def",
			quantity: 4,
			product: { price: 0.01 } as ProductInterface
		}
	]

	let mockCalculateShipping: jest.SpyInstance<Promise<Decimal>, [products: calculateShippingModule.productPackageInfo[], destination: string], any>;
	beforeEach(() => {
		mockCalculateShipping = jest.spyOn(calculateShippingModule, 'calculateShippingProducts')
			.mockImplementation(async () => new Decimal(0.12))
	})
	afterEach(() => {
		mockCalculateShipping.mockRestore();
	})


	it("should add accurately", async () => {
		const res = await makePrice(products)
		expect(res.subtotal).toBe(0.07)
		expect(res.total).toBe(0.07)
		expect(res.shipping).toBe(undefined)
		expect(res.tax).toBe(undefined)
	})

	it("should add accurately with shipping and taxes", async () => {
		const res = await makePrice(products, {
			postal_code: "TESTPOSTALCODE",
			admin_area_1: "Ontario"
		})
		expect(res.subtotal).toBe(0.07)
		expect(res.shipping).toBe(0.12)
		expect(res.tax).toBe(0.02)
		expect(res.total).toBe(0.21)
		expect(mockCalculateShipping).toHaveBeenCalledTimes(1)
		expect(mockCalculateShipping).toHaveBeenNthCalledWith(1, [{ id: "abc", quantity: 3 }, { id: "def", quantity: 4 }], "TESTPOSTALCODE")
	})
})