// util
import { ValidationError } from 'joi'
import { validateAddress } from 'types/address'
import { validateName, FormCustomer } from "types/customer"
/**
 * @returns Stage 1.1 Verify that the name and address are valid
 * @param ci Customer object
 */
export const validateP0FormData = (name: FormCustomer["fullName"], address: FormCustomer["address"]) => validateP0FormError(name, address) === null
export const validateP0FormError = (name: FormCustomer["fullName"], address: FormCustomer["address"]) => {
  try {
    validateName(name)
    validateAddress(address)
  } catch(e) {
    if (e instanceof ValidationError){
      return e
    } else {
      return new Error("Unknown error occurred in validation, very very bad time")
    }
  }
}
/**
 * @returns Stage 1.2 Price has been updated (from the address)
 * @param pi payment object
 */
// const findFinalPriceCalculated = (pi: PriceInterface) => validateFinalPrice(pi)
/**
 * @returns Stage 2.1 If payment has been approved
 * @param ci customer object
 */
// TODO make this a bit more firm
export const validateP1FormData = (paymentMethod: FormCustomer["paymentMethod"], PaymentSource: FormCustomer["payment_source"]) => (paymentMethod == "paypal" && !!PaymentSource?.paypal) || (paymentMethod == "card" && !!PaymentSource?.card)
