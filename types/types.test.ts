import Joi from "joi"
import { Card } from "./card"
import {validateCard, validateCardError} from "types/card"
import { validateFinalCustomer, validateFinalCustomerError, FinalCustomerInterface } from "./customer"
import { validateAddress, validateAddressError } from "types/paypal"
import { validatePostalCode, validatePostalCodeError } from "util/shipping/postalCode"
// types
import { ProductInterface, validateProduct, validateProductError } from "./product"
import { OrderProduct, OrderProductFilled, validateOrderProduct, validateOrderProductError, validateOrderProductFilled, validateOrderProductFilledError } from "./order"
import { Address } from "@paypal/paypal-js"

const successPostalCode = "H0H0H0"
const altSuccessPostalCode = "H0H 0H0"
describe("Should Validate Postal Code Correctly", () => {
	it("Should validate Successful Postal Code", () => {
		expect(validatePostalCode(successPostalCode)).toBe(true)
		expect(validatePostalCodeError(successPostalCode)).toBe(undefined)
	})
	it("Should validate alternate successful postal code", () => {
		expect(validatePostalCode(altSuccessPostalCode)).toBe(true)
		expect(validatePostalCodeError(altSuccessPostalCode)).toBe(undefined)
	})

	it("Should Validate Postal Code with no postal code", () => {
		const shortPostalCode = ""
		expect(validatePostalCode(shortPostalCode)).toBe(false)
		expect(validatePostalCodeError(shortPostalCode)).toBeInstanceOf(Joi.ValidationError)
		expect(validatePostalCodeError(shortPostalCode)?.message).toBe('"value" is not allowed to be empty')
	})

	it("Should Validate Postal Code with invalid postal code", () => {
		// create list of invalid 6 character postal codes
		const invalidPostalCodes = [ "123456", "1234a6", "1a3456", "a23456", "aaaaaa", "1a1 a1a", "1a1a1a", "1a1 a1", "1a1a 1a", "1a1a1", ]
		invalidPostalCodes.forEach((invalidPostalCode) => {
			expect(validatePostalCode(invalidPostalCode)).toBe(false)
			expect(validatePostalCodeError(invalidPostalCode)).toBeInstanceOf(Joi.ValidationError)
			expect(validatePostalCodeError(invalidPostalCode)?.message).toBe('"value" with value "' + invalidPostalCode + '" fails to match the required pattern: /^(?!.*[DFIOQUdfioqu])[A-VXYa-vxy][0-9][A-Za-z][ -]?[0-9][A-Za-z][0-9]$/')
		})
	})
})

const successAddress: Address = {
	address_line_1: "123 Test Street",
	address_line_2: "Test Apartment",
	admin_area_2: "Test City",
	admin_area_1: "Test Province",
	postal_code: successPostalCode,
	country_code: "CA",
}
describe("Should Validate Address Correctly", () => {
	it("Should Validate Successful Address", () => {
		expect(validateAddress(successAddress)).toBe(true)
		expect(validateAddressError(successAddress)).toBe(undefined)
	})
	it("Should validate address with no address_line_2", () => {
		const shortAddress = { ...successAddress, address_line_2: "" }
		expect(validateAddress(shortAddress)).toBe(true)
		expect(validateAddressError(shortAddress)).toBe(undefined)
	})
	it("Should Validate Address with no address line 1", () => {
		const shortAddressError = { ...successAddress, address_line_1: "" }
		expect(validateAddress(shortAddressError)).toBe(false)
		expect(validateAddressError(shortAddressError)).toBeInstanceOf(Joi.ValidationError)
		expect(validateAddressError(shortAddressError)?.message).toBe('"address_line_1" is not allowed to be empty')
	})
	it("Should Validate Address with address line 1 too long", () => {
		const longAddressError = { ...successAddress, address_line_1: "a".repeat(301) }
		expect(validateAddress(longAddressError)).toBe(false)
		expect(validateAddressError(longAddressError)).toBeInstanceOf(Joi.ValidationError)
		expect(validateAddressError(longAddressError)?.message).toBe('"address_line_1" length must be less than or equal to 300 characters long')
	})
	it("Should Validate Address with no city", () => {
		const shortCityError = { ...successAddress, admin_area_2: "" }
		expect(validateAddress(shortCityError)).toBe(false)
		expect(validateAddressError(shortCityError)).toBeInstanceOf(Joi.ValidationError)
		expect(validateAddressError(shortCityError)?.message).toBe('"admin_area_2" is not allowed to be empty')
	})
	it("Should Validate Address with no province", () => {
		const shortProvinceError = { ...successAddress, admin_area_1: "" }
		expect(validateAddress(shortProvinceError)).toBe(false)
		expect(validateAddressError(shortProvinceError)).toBeInstanceOf(Joi.ValidationError)
		expect(validateAddressError(shortProvinceError)?.message).toBe('"admin_area_1" is not allowed to be empty')
	})
	it("Should Validate Address with no postal code", () => {
		const shortPostalCodeError = { ...successAddress, postal_code: "" }
		expect(validateAddress(shortPostalCodeError)).toBe(false)
		expect(validateAddressError(shortPostalCodeError)).toBeInstanceOf(Joi.ValidationError)
		expect(validateAddressError(shortPostalCodeError)?.message).toBe('"postal_code" is not allowed to be empty')
	})
	it("Should Validate Address with no country code", () => {
		const shortCountryCodeError = { ...successAddress, country_code: "" }
		expect(validateAddress(shortCountryCodeError)).toBe(false)
		expect(validateAddressError(shortCountryCodeError)).toBeInstanceOf(Joi.ValidationError)
		expect(validateAddressError(shortCountryCodeError)?.message).toBe('"country_code" is not allowed to be empty')
	})
	it("Should Validate Address with long country code", () => {
		const longCountryCodeError = { ...successAddress, country_code: "a".repeat(3) }
		expect(validateAddress(longCountryCodeError)).toBe(false)
		expect(validateAddressError(longCountryCodeError)).toBeInstanceOf(Joi.ValidationError)
		expect(validateAddressError(longCountryCodeError)?.message).toBe("\"country_code\" length must be 2 characters long")
	})
	it("Should Validate Address with short country code", () => {
		const shortCountryCodeError = { ...successAddress, country_code: "a" }
		expect(validateAddress(shortCountryCodeError)).toBe(false)
		expect(validateAddressError(shortCountryCodeError)).toBeInstanceOf(Joi.ValidationError)
		expect(validateAddressError(shortCountryCodeError)?.message).toBe("\"country_code\" length must be 2 characters long")
	})
})

describe("Should Validate Card Correctly", ()=>{
	const successCard: Card = {
		cardName: "Test Card",
		cardNumber: "4214029346506481",
		cardExpiry: "2025-03",
		cardCVV: "191",
	}
	it("Should Validate Successful Card", ()=>{
		expect(validateCard(successCard)).toBe(true)
		expect(validateCardError(successCard)).toBe(undefined)
	})

	it("Should Validate Card with no name", ()=>{
		const shortNameErrorCard = { ...successCard , cardName: ""}
		expect(validateCard(shortNameErrorCard)).toBe(false)
		expect(validateCardError(shortNameErrorCard)).toBeInstanceOf(Joi.ValidationError)
		expect(validateCardError(shortNameErrorCard)?.message).toBe('"cardName" is not allowed to be empty')
	})

	it("Should Validate Card with name too long", ()=>{
		const longNameCard = {...successCard, cardName: "a".repeat(301)}
		expect(validateCard(longNameCard)).toBe(false)
		expect(validateCardError(longNameCard)).toBeInstanceOf(Joi.ValidationError)
		expect(validateCardError(longNameCard)?.message).toBe('"cardName" length must be less than or equal to 300 characters long')
	})

	it("Should Validate Card with bad number", () => {
		const badCardNumberCard = {...successCard, cardNumber: "1234567890123456"}
		expect(validateCard(badCardNumberCard)).toBe(false)
		expect(validateCardError(badCardNumberCard)).toBeInstanceOf(Joi.ValidationError)
		expect(validateCardError(badCardNumberCard)?.message).toBe('"cardNumber" must be a credit card')
	})

	it("Should Validate Card with long CVV", () => {
		const badCVVCard = {...successCard, cardCVV: "1234"}
		expect(validateCard(badCVVCard)).toBe(false)
		expect(validateCardError(badCVVCard)).toBeInstanceOf(Joi.ValidationError)
		expect(validateCardError(badCVVCard)?.message).toBe('"cardCVV" length must be 3 characters long')
	})

	it("Should Validate Card with short CVV", () => {
		const badCVVCard = { ...successCard, cardCVV: "12" }
		expect(validateCard(badCVVCard)).toBe(false)
		expect(validateCardError(badCVVCard)).toBeInstanceOf(Joi.ValidationError)
		expect(validateCardError(badCVVCard)?.message).toBe('"cardCVV" length must be 3 characters long')
	})
	
	it("Should Validate Card with malformed expiry", () => {
		const malformedExpiryCard = {...successCard, cardExpiry: "13/25"}
		expect(validateCard(malformedExpiryCard)).toBe(false)
		expect(validateCardError(malformedExpiryCard)).toBeInstanceOf(Joi.ValidationError)
		expect(validateCardError(malformedExpiryCard)?.message).toBe('"cardExpiry" with value \"13/25\" fails to match the required pattern: /^[0-9]{4}-(0[1-9]|1[0-2])$/')
	})
})

const successCustomer: FinalCustomerInterface = {
	fullName: "Test Customer",
	paymentMethod: "card",
	payment_source: {
		paypal: {
			email_address: "sb-5tjyr23952170@personal.example.com",
			account_id: "CEPBDHWUALZTA",
			name: {
				given_name: "John",
				"surname": "Doe"
			},
			address: {
				country_code: "CA"
			}
		},
	},
	address: successAddress,
}
describe("Should Validate Final Customer Correctly", ()=>{
	it("Should Validate Successful Customer", ()=>{
		expect(validateFinalCustomer(successCustomer)).toBe(true)
		expect(validateFinalCustomerError(successCustomer)).toBe(undefined)
	})

	it("Should Validate Customer with no name", ()=>{
		const shortNameErrorCustomer = { ...successCustomer , fullName: ""}
		expect(validateFinalCustomer(shortNameErrorCustomer)).toBe(false)
		expect(validateFinalCustomerError(shortNameErrorCustomer)).toBeInstanceOf(Joi.ValidationError)
		expect(validateFinalCustomerError(shortNameErrorCustomer)?.message).toBe('"fullName" is not allowed to be empty')
	})

	it("Should Validate Customer with name too long", ()=>{
		const longNameCustomer = {...successCustomer, fullName: "a".repeat(301)}
		expect(validateFinalCustomer(longNameCustomer)).toBe(false)
		expect(validateFinalCustomerError(longNameCustomer)).toBeInstanceOf(Joi.ValidationError)
		expect(validateFinalCustomerError(longNameCustomer)?.message).toBe('"fullName" length must be less than or equal to 300 characters long')
	})

	it("Should Validate Customer with bad payment method", () => {
		const badPaymentMethodCustomer = {...successCustomer, paymentMethod: "bad"}
		expect(validateFinalCustomer(badPaymentMethodCustomer)).toBe(false)
		expect(validateFinalCustomerError(badPaymentMethodCustomer)).toBeInstanceOf(Joi.ValidationError)
		expect(validateFinalCustomerError(badPaymentMethodCustomer)?.message).toBe('"paymentMethod" must be one of [card, paypal]')
	})

	it("Should Validate Customer with bad payment source", () => {
		const badPaymentSourceCustomer = {...successCustomer, payment_source: {bad: {}}}
		expect(validateFinalCustomer(badPaymentSourceCustomer)).toBe(false)
		expect(validateFinalCustomerError(badPaymentSourceCustomer)).toBeInstanceOf(Joi.ValidationError)
		expect(validateFinalCustomerError(badPaymentSourceCustomer)?.message).toBe('"payment_source.bad" is not allowed')
	})

	it("Should Validate Customer with bad address", () => {
		const badAddressCustomer = {...successCustomer, address: {}}
		expect(validateFinalCustomer(badAddressCustomer)).toBe(false)
		expect(validateFinalCustomerError(badAddressCustomer)).toBeInstanceOf(Joi.ValidationError)
		expect(validateFinalCustomerError(badAddressCustomer)?.message).toBe('\"address.address_line_1\" is required')
	})
})

const successProductWithoutImageAndID: Omit<ProductInterface, "productImageURL" | "firestoreID"> = {
	productName: "Test Product",
	quantity: 1,
	price: 1,
	description: "Test Description",
	
	commercial: true,
	residential: true,
	industrial: false,

	length: 1,
	width: 1,
	height: 1,
	weight: 1,
}
const successProduct = { ...successProductWithoutImageAndID, productImageURL: "test", firestoreID: "test" }
describe("Should Validate Product Correctly", ()=>{
	it("Should Validate Successful Product", ()=>{
		expect(validateProduct(successProductWithoutImageAndID)).toBe(true)
		expect(validateProductError(successProductWithoutImageAndID)).toBe(undefined)
	})
	it("Should allow inclusion of productImageURL and firestoreID", () => {
		expect(validateProduct(successProduct)).toBe(true)
		expect(validateProductError(successProduct)).toBe(undefined)
	})

	it("Should Validate Product with no name", ()=>{
		const shortNameErrorProduct = { ...successProduct , productName: ""}
		expect(validateProduct(shortNameErrorProduct)).toBe(false)
		expect(validateProductError(shortNameErrorProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(shortNameErrorProduct)?.message).toBe('"productName" is not allowed to be empty')
	})

	it("Should validate quantity is a number", ()=>{
		const badQuantityProduct = {...successProduct, quantity: "bad"}
		expect(validateProduct(badQuantityProduct)).toBe(false)
		expect(validateProductError(badQuantityProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(badQuantityProduct)?.message).toBe('"quantity" must be a number')
	})
	it("Should validate quantity too low", () => {
		const lowQuantityProduct = {...successProduct, quantity: 0}
		expect(validateProduct(lowQuantityProduct)).toBe(false)
		expect(validateProductError(lowQuantityProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(lowQuantityProduct)?.message).toBe('\"quantity\" must be greater than 0')
	})

	it("Should validate price is a number", ()=>{
		const badPriceProduct = {...successProduct, price: "bad"}
		expect(validateProduct(badPriceProduct)).toBe(false)
		expect(validateProductError(badPriceProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(badPriceProduct)?.message).toBe('"price" must be a number')
	})
	it("Should validate price too low", () => {
		const lowPriceProduct = {...successProduct, price: 0}
		expect(validateProduct(lowPriceProduct)).toBe(false)
		expect(validateProductError(lowPriceProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(lowPriceProduct)?.message).toBe('\"price\" must be greater than 0')
	})

	it("Should validate description is present", ()=>{
		const badDescriptionProduct = {...successProduct, description: ""}
		expect(validateProduct(badDescriptionProduct)).toBe(false)
		expect(validateProductError(badDescriptionProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(badDescriptionProduct)?.message).toBe('"description" is not allowed to be empty')
	})
	it("Should validate description is a string", ()=>{
		const badDescriptionProduct = {...successProduct, description: 1}
		expect(validateProduct(badDescriptionProduct)).toBe(false)
		expect(validateProductError(badDescriptionProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(badDescriptionProduct)?.message).toBe('"description" must be a string')
	})

	it("Should validate commercial is a boolean", ()=>{
		const badCommercialProduct = {...successProduct, commercial: "bad"}
		expect(validateProduct(badCommercialProduct)).toBe(false)
		expect(validateProductError(badCommercialProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(badCommercialProduct)?.message).toBe('"commercial" must be a boolean')
	})
	it("Should validate residential is a boolean", ()=>{
		const badResidentialProduct = {...successProduct, residential: "bad"}
		expect(validateProduct(badResidentialProduct)).toBe(false)
		expect(validateProductError(badResidentialProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(badResidentialProduct)?.message).toBe('"residential" must be a boolean')
	})
	it("Should validate industrial is a boolean", ()=>{
		const badIndustrialProduct = {...successProduct, industrial: "bad"}
		expect(validateProduct(badIndustrialProduct)).toBe(false)
		expect(validateProductError(badIndustrialProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(badIndustrialProduct)?.message).toBe('"industrial" must be a boolean')
	})

	it("Should validate length is a number", ()=>{
		const badLengthProduct = {...successProduct, length: "bad"}
		expect(validateProduct(badLengthProduct)).toBe(false)
		expect(validateProductError(badLengthProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(badLengthProduct)?.message).toBe('"length" must be a number')
	})
	it("Should validate length too low", () => {
		const lowLengthProduct = {...successProduct, length: 0}
		expect(validateProduct(lowLengthProduct)).toBe(false)
		expect(validateProductError(lowLengthProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(lowLengthProduct)?.message).toBe('\"length\" must be greater than 0')
	})
	it("Should validate width is a number", ()=>{
		const badWidthProduct = {...successProduct, width: "bad"}
		expect(validateProduct(badWidthProduct)).toBe(false)
		expect(validateProductError(badWidthProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(badWidthProduct)?.message).toBe('"width" must be a number')
	})
	it("Should validate width too low", () => {
		const lowWidthProduct = {...successProduct, width: 0}
		expect(validateProduct(lowWidthProduct)).toBe(false)
		expect(validateProductError(lowWidthProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(lowWidthProduct)?.message).toBe('\"width\" must be greater than 0')
	})
	it("Should validate height is a number", ()=>{
		const badHeightProduct = {...successProduct, height: "bad"}
		expect(validateProduct(badHeightProduct)).toBe(false)
		expect(validateProductError(badHeightProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(badHeightProduct)?.message).toBe('"height" must be a number')
	})
	it("Should validate height too low", () => {
		const lowHeightProduct = {...successProduct, height: 0}
		expect(validateProduct(lowHeightProduct)).toBe(false)
		expect(validateProductError(lowHeightProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(lowHeightProduct)?.message).toBe('\"height\" must be greater than 0')
	})
	it("Should validate weight is a number", ()=>{
		const badWeightProduct = {...successProduct, weight: "bad"}
		expect(validateProduct(badWeightProduct)).toBe(false)
		expect(validateProductError(badWeightProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(badWeightProduct)?.message).toBe('"weight" must be a number')
	})
	it("Should validate weight too low", () => {
		const lowWeightProduct = {...successProduct, weight: 0}
		expect(validateProduct(lowWeightProduct)).toBe(false)
		expect(validateProductError(lowWeightProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateProductError(lowWeightProduct)?.message).toBe('\"weight\" must be greater than 0')
	})
})

const successOrderProduct: OrderProduct = {
	PID: "abcedf",
	quantity: 1,
}
const successOrderProductFilled: OrderProductFilled = {
	PID: "abcedf",
	quantity: 1,
	product: successProduct
}
describe("Should Validate Order Product Correctly", ()=>{
	it("Should validate Order Product", ()=>{
		expect(validateOrderProduct(successOrderProduct)).toBe(true)
		expect(validateOrderProductError(successOrderProduct)).toBe(undefined)
	})
	it("Should validate PID is present", ()=>{
		const badPIDOrderProduct = {...successOrderProduct, PID: undefined}
		expect(validateOrderProduct(badPIDOrderProduct)).toBe(false)
		expect(validateOrderProductError(badPIDOrderProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateOrderProductError(badPIDOrderProduct)?.message).toBe('"PID" is required')
	})
	it("Should validate PID is a string", ()=>{
		const badPIDOrderProduct = {...successOrderProduct, PID: 1}
		expect(validateOrderProduct(badPIDOrderProduct)).toBe(false)
		expect(validateOrderProductError(badPIDOrderProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateOrderProductError(badPIDOrderProduct)?.message).toBe('"PID" must be a string')
	})
	it("Should validate quantity is present", ()=>{
		const badQuantityOrderProduct = {...successOrderProduct, quantity: undefined}
		expect(validateOrderProduct(badQuantityOrderProduct)).toBe(false)
		expect(validateOrderProductError(badQuantityOrderProduct)).toBeInstanceOf(Joi.ValidationError)
		expect(validateOrderProductError(badQuantityOrderProduct)?.message).toBe('"quantity" is required')
	})

	it("Should validate Order Product Filled", ()=>{
		expect(validateOrderProductFilled(successOrderProductFilled)).toBe(true)
		expect(validateOrderProductFilledError(successOrderProductFilled)).toBe(undefined)
	})
	it("Should contain a product", ()=>{
		const badOrderProductFilled = successOrderProduct
		expect(validateOrderProductFilled(badOrderProductFilled)).toBe(false)
		expect(validateOrderProductFilledError(badOrderProductFilled)).toBeInstanceOf(Joi.ValidationError)
		expect(validateOrderProductFilledError(badOrderProductFilled)?.message).toBe('"product" is required')
	})
})
