import { ValidationError } from "joi"
// types
import { PaymentMethods, validateName } from "types/customer"
import { validateAddress } from "types/address"
import { validateCard } from "types/card"
import { PaymentSource } from "types/paypal"

export enum Stages {
  P0, P1, P2
}

/**
 * @returns Stage 1.1 Verify that the name and address are valid
 * @param ci Customer object
 * @throws if an unexpected error occured when validating with JOI
 */
export const validateP0FormData = (name: unknown, address: unknown) => validateP0FormError(name, address) === null
export const validateP0FormError = (name: unknown, address: unknown) => {
  try {
    validateName(name)
    validateAddress(address)
    return null
  } catch (e) {
    if (e instanceof ValidationError) {
      return e
    }
    throw e
  }
}


export const validateP1FormData = (existingPaymentSource: PaymentSource | null, paymentMethod: PaymentMethods | null, newPaymentForm: unknown): boolean =>
  validateP1FormError(existingPaymentSource, paymentMethod, newPaymentForm) === null
export const validateP1FormError = (existingPaymentSource: PaymentSource | null, paymentMethod: PaymentMethods | null, newPaymentForm: unknown): string | null => {
  if(existingPaymentSource) return null  // if there is an existing payment source, we don't need to validate the new one
  if (!paymentMethod) return "Select a Payment Method"
  if (paymentMethod == PaymentMethods.Card) {
    try {
      validateCard(newPaymentForm)
      return null
    } catch (e) {
      if (e instanceof ValidationError) return e.message
      throw e
    }
  } else if(paymentMethod == PaymentMethods.PayPal) {
    return null
  } else {
    return "Invalid Payment Method"
  }
}

