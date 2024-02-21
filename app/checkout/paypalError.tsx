"use client"
import Link from "next/link";
import { useEffect } from "react";
import { logEvent } from 'firebase/analytics';
import { analytics } from 'util/firebase/analytics';

export const HandlePayPalError = ({ paypal_error }: { paypal_error: string; }) => {
  useEffect(() => logEvent(analytics(), "checkout_error_paypal_SSR"), [])
  return (
    <div className="w-full h-screen grid place-items-center">
      <div>
        <h1>Paypal Error</h1>
        <p>{JSON.stringify(paypal_error)}</p>
        <Link href="/cart"> <button className="underline">Go Back</button> </Link>
      </div>
    </div>
  )
};
