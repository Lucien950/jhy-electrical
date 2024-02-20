"use client"
import { ValidationError } from "joi"
import { useState } from "react"
// analytics
import { logEvent } from "firebase/analytics"
import { analytics } from "util/firebase/analytics"
// types
import { FormCustomer, PaymentMethods, validateName } from "types/customer"
import { validateAddress } from "types/address"
import { validateCard } from "types/card"
import { PaymentSource } from "types/paypal"

export enum Stages {
  P0, P1, P2
}

// STAGE TECHNOLOGY
export const useStage = (initialStage: Stages, customerInfo: FormCustomer) => {
	const [stage, setStage] = useState(initialStage)
	const [p0DataValid, setP0DataValid] = useState(validateP0FormData(customerInfo.fullName, customerInfo.address))
	const [p1DataValid, setP1DataValid] = useState(validateP1FormData(customerInfo.paymentSource || null, null, null))
	const goToStage = (s: Stages) => (() => {
    if(s == Stages.P1 && !p0DataValid) throw new Error("Cannot go to that stage. Please implement better guards.")
    if(s == Stages.P2 && !p1DataValid) throw new Error("Cannot go to that stage. Please implement better guards.")
    logEvent(analytics(), "checkout_progress", { checkout_step: s });
    setStage(s)
  })

	return { stage, goToStage, p0DataValid, p1DataValid, setP0DataValid, setP1DataValid }
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

