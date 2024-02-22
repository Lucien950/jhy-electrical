import { OrderProduct } from "types/order"
import { Address } from "types/address"
import { apiResponse } from "server/api"

import { createOrderRes, createOrderProps } from 'app/api/paypal/order/create'
export const createPayPalOrder = async (orderProducts: OrderProduct[], express = false) => {
  // check that the products are in stock
  await Promise.all(orderProducts.map(async (orderProduct) => {
    const p = await getProductByID(orderProduct.PID)
    if (p.variants.find(v => v.sku === orderProduct.variantSKU)?.quantity === 0)
      throw new Error(`Product ${p.productName} (${orderProduct.PID}) is out of stock, please remove it from the cart.`)
  }))

	const response = await fetch(`/api/paypal/order/create`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ products: orderProducts, express } as createOrderProps)
	})

	const { res, err }: apiResponse<createOrderRes, unknown> = await response.json()
	if (response.ok) {
		if (!res) throw new Error("This code should not be reachable, since response.ok is true")
		if (res.orderStatus == "COMPLETED") throw new Error("REQUEST ID HAS BEEN USED")
		if (!res.redirect_link) throw new Error("Redirect Link could not be found")
		return Object.assign(res, { redirect_link: res.redirect_link })
	}
	else throw err
}

import { submitOrderProps, submitOrderRes } from "app/api/paypal/order/submit"
import { getProductByID } from "util/product"
export const submitOrder = async (orderID: string) => {
	const response = await fetch("/api/paypal/order/submit", {
		method: "POST",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token: orderID } as submitOrderProps)
	})
	const { res, err } = await response.json() as apiResponse<submitOrderRes, unknown>
	if (response.ok) return res!
	else throw err
}

import { updateOrderAddressRes, updateOrderAddressProps } from "app/api/paypal/order/update/address"
export const updateOrderAddress = async (orderID: string, address: Address, fullName: string)=>{
	const response = await fetch("/api/paypal/order/update/address", {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ token: orderID, address, fullName } as updateOrderAddressProps)
	})
	const {res, err} = await response.json() as apiResponse<updateOrderAddressRes, unknown>
	if (!response.ok) throw err
	return res!
}
// https://youtu.be/fzwkkZp5WcE?t=1m30s
// https://developer.paypal.com/docs/checkout/integrate/#6-verify-the-transaction


import { FormCard, attemptCard } from "types/card"
import { approveCardProps, approveCardRes } from "app/api/paypal/approve/card"
export const approveCard = async (token: string, cardInfo: Partial<FormCard>) => {
	attemptCard(cardInfo)
	const response = await fetch("/api/paypal/approve/card", {
		method: "PATCH",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token, card: cardInfo } as approveCardProps)
	})
	const { res, err } = await response.json() as apiResponse<approveCardRes, unknown>
	if (response.ok) {
		return res!
	}
	else throw err
}

import { approvePayPalRes } from "app/api/paypal/approve/paypal"
export const approvePayPal = async (token: string) => {
	const response = await fetch("/api/paypal/approve/paypal", {
		method: "PATCH",
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ token } as approveCardProps)
	})
	const { res, err } = await response.json() as apiResponse<approvePayPalRes, unknown>
	if (response.ok) return res!
	else throw err
}

