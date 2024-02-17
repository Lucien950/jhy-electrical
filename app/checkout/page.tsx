import { updatePayPalOrderAddress } from "server/paypal";
import { getPayPalOrder } from 'server/paypal';
import { permanentRedirect } from 'next/navigation'
import Link from 'next/link';
import CheckoutRoot from './checkoutRoot';
import { validateP0FormData, validateP1FormData } from './validateStage';
import { Address } from 'types/address';

const HandlePayPalError = ({ paypal_error }: { paypal_error: unknown }) => (
  <div className="w-full h-screen grid place-items-center">
    <div>
      <h1>Paypal Error</h1>
      <p>{JSON.stringify(paypal_error)}</p>
      <Link href="/cart"> <button className="underline">Go Back</button> </Link>
    </div>
  </div>
)

export default async function Checkout({searchParams}: {searchParams: { [key: string]: string | string[] | undefined }}) {
  const token = searchParams['token']
  if (!token || Array.isArray(token)) permanentRedirect("/cart")
  // coming back from paypal ordering
  try {
    const { customerInfo: paypalCustomerInfo, priceInfo, products: emptyOrderProducts, status } = await getPayPalOrder(token)
    let paypalPriceInfo = priceInfo

    if (status == "COMPLETED") return <HandlePayPalError paypal_error={"Order has already been completed"} />

    // base address 
    if (!paypalCustomerInfo.address) paypalCustomerInfo.address = { country_code: "CA" } as Address

    const p0Done = validateP0FormData(paypalCustomerInfo.fullName, paypalCustomerInfo.address)
    const p1Done = validateP1FormData(paypalCustomerInfo.paymentMethod, paypalCustomerInfo.payment_source)
    // paymentInfo shipping update
    if (p0Done && !paypalPriceInfo.shipping) {
      const newPrice = await updatePayPalOrderAddress(token, paypalCustomerInfo.address!, paypalCustomerInfo.fullName!) //eslint-disable-line @typescript-eslint/no-non-null-assertion 
      paypalPriceInfo = newPrice
    }

    // determining initial checkout stage
    const initialStage: number = (p0Done && p1Done) ? 2 : (p0Done && !p1Done) ? 1 : 0;
    // variables we get now!
    return (
      <CheckoutRoot
        paypalCustomerInfo={paypalCustomerInfo}
        emptyOrderProducts={emptyOrderProducts}
        orderID={token}
        paypalPriceInfo={paypalPriceInfo}
        initialStage={initialStage}
      />
    )
  }
  catch (paypal_error) {
    // logEvent(analytics(), "checkout_error_paypal_SSR") // TODO: server side log error
    return <HandlePayPalError paypal_error={paypal_error} />
  }
}