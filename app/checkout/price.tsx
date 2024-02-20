"use client"

import PriceComponent from 'components/price'
import { Oval } from 'react-loader-spinner'
import Tippy from '@tippyjs/react'
import { FormPrice } from 'types/price'

export default function Price({checkoutPayPalPrice, calculatingShipping}: {checkoutPayPalPrice: FormPrice, calculatingShipping: boolean}) {
  return (
    <div>
      <h1 className="text-3xl font-bold">Order Summary</h1>
      <hr className="my-4" />
      {/* Subtotal */}
      <div className="flex flex-row mb-4 justify-between">
        <span> Subtotal </span>
        <div>
          <PriceComponent price={checkoutPayPalPrice.subtotal} />
        </div>
      </div>
      {/* Shipping */}
      <div className="flex flex-row mb-4 justify-between">
        <div className="flex flex-row items-center gap-x-2">
          <span> Shipping </span>
          <Tippy content={"Shipping cost is calculated using the Canada Post rate."} delay={50}>
            <svg className="h-5 w-5 focus:outline-none focus:stroke-blue-300 hover:cursor-pointer" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </Tippy>
        </div>
        {
          calculatingShipping
            ? <Oval height={20} width={20} strokeWidth={7} color="white" secondaryColor="white" />
            : <PriceComponent price={checkoutPayPalPrice.shipping || null} />
        }
      </div>
      {/* Tax */}
      <div className="flex flex-row justify-between mb-4">
        <div className="flex flex-row items-center gap-x-2">
          <span> Tax </span>
          <Tippy content={"Tax is calculated based on the Ontario rate of 13%"} delay={50}>
            <svg className="h-5 w-5 focus:outline-none focus:stroke-blue-300 hover:cursor-pointer" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          </Tippy>
        </div>
        <PriceComponent price={checkoutPayPalPrice.tax || null} />
      </div>
      {/* Total */}
      <div className="flex flex-row justify-between mb-8">
        <p>Total</p>
        <PriceComponent price={checkoutPayPalPrice.total} />
      </div>
    </div>
  )
}