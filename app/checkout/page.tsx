// react
import { permanentRedirect } from 'next/navigation'
// util
import { getPayPalOrder } from 'server/paypal';
import { Stages, validateP0FormData, validateP1FormData } from './stages';
// components
import CheckoutRoot from './checkoutRoot';
//types
import { FormCustomer } from 'types/customer';
import { HandlePayPalError } from './paypalError';
import { Metadata } from 'next';

const getInitialStage = (CheckoutPayPalCustomer: FormCustomer): Stages => {
  const p0Done = validateP0FormData(CheckoutPayPalCustomer.fullName, CheckoutPayPalCustomer.address)
  const p1Done = validateP1FormData(CheckoutPayPalCustomer.paymentSource || null, null, null)
  return (p0Done && p1Done) ? Stages.P2 : (p0Done && !p1Done) ? Stages.P1 : Stages.P0
}

export const metadata: Metadata = {
	title: "Checkout",
	description: "Checkout page for JHY Electrical",
}
export const dynamic = 'force-dynamic'
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
    
    console.log("RERENDER: paypal customer", CheckoutPayPalCustomer)
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
    return <HandlePayPalError paypal_error={(paypal_error as Error).message} />
  }
}