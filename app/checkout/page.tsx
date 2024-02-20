// react
import { permanentRedirect } from 'next/navigation'
import Link from 'next/link';
// util
import { getPayPalOrder } from 'server/paypal';
import { Stages, validateP0FormData, validateP1FormData } from './stages';
// components
import CheckoutRoot from './checkoutRoot';
// analytics
// TODO make it admin
import { logEvent } from 'firebase/analytics';
import { analytics } from 'util/firebase/analytics';
import { FormCustomer } from 'types/customer';

const HandlePayPalError = ({ paypal_error }: { paypal_error: unknown }) => (
  <div className="w-full h-screen grid place-items-center">
    <div>
      <h1>Paypal Error</h1>
      <p>{JSON.stringify(paypal_error)}</p>
      <Link href="/cart"> <button className="underline">Go Back</button> </Link>
    </div>
  </div>
)

const getInitialStage = (CheckoutPayPalCustomer: FormCustomer): Stages => {
  const p0Done = validateP0FormData(CheckoutPayPalCustomer.fullName, CheckoutPayPalCustomer.address)
  const p1Done = validateP1FormData(CheckoutPayPalCustomer.paymentSource || null, null, null)
  return (p0Done && p1Done) ? Stages.P2 : (p0Done && !p1Done) ? Stages.P1 : Stages.P0
}

export default async function Checkout({searchParams}: {searchParams: { [key: string]: string | string[] | undefined }}) {
  const CheckoutOrderID = searchParams['token']
  if (!CheckoutOrderID || Array.isArray(CheckoutOrderID)) permanentRedirect("/cart")
  // coming back from paypal ordering
  try {
    const {
      PayPalCustomer: CheckoutPayPalCustomer,
      orderPrice: CheckoutPayPalPrice,
      products: CheckoutOrderProducts,
      status: CheckoutStatus
    } = await getPayPalOrder(CheckoutOrderID)
    if (CheckoutStatus == "COMPLETED") return <HandlePayPalError paypal_error={"Order has already been completed"} />
    // determining initial checkout stage
    return (
      <CheckoutRoot
        CheckoutPayPalCustomer={CheckoutPayPalCustomer}
        CheckoutOrderProducts={CheckoutOrderProducts}
        CheckoutPayPalPrice={CheckoutPayPalPrice}
        CheckoutOrderID={CheckoutOrderID}
        initialStage={getInitialStage(CheckoutPayPalCustomer)}
      />
    )
  }
  catch (paypal_error) {
    logEvent(analytics(), "checkout_error_paypal_SSR")
    return <HandlePayPalError paypal_error={paypal_error} />
  }
}