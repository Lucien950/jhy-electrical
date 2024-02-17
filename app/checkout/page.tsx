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
  const CheckoutOrderID = searchParams['token']
  if (!CheckoutOrderID || Array.isArray(CheckoutOrderID)) permanentRedirect("/cart")
  // coming back from paypal ordering
  try {
    const { customerInfo: CheckoutPayPalCustomer, priceInfo, products: CheckoutOrderProducts, status } = await getPayPalOrder(CheckoutOrderID)
    let CheckoutPayPalPrice = priceInfo

    if (status == "COMPLETED") return <HandlePayPalError paypal_error={"Order has already been completed"} />

    // base address 
    if (!CheckoutPayPalCustomer.address) CheckoutPayPalCustomer.address = { country_code: "CA" } as Address

    const p0Done = validateP0FormData(CheckoutPayPalCustomer.fullName, CheckoutPayPalCustomer.address)
    const p1Done = validateP1FormData(CheckoutPayPalCustomer.paymentMethod, CheckoutPayPalCustomer.payment_source)
    // paymentInfo shipping update
    if (p0Done && !CheckoutPayPalPrice.shipping) {
      const newPrice = await updatePayPalOrderAddress(CheckoutOrderID, CheckoutPayPalCustomer.address!, CheckoutPayPalCustomer.fullName!) //eslint-disable-line @typescript-eslint/no-non-null-assertion 
      CheckoutPayPalPrice = newPrice
    }

    // determining initial checkout stage
    const initialStage: number = (p0Done && p1Done) ? 2 : (p0Done && !p1Done) ? 1 : 0;
    // variables we get now!
    return (
      <CheckoutRoot
        CheckoutPayPalCustomer={CheckoutPayPalCustomer}
        CheckoutOrderProducts={CheckoutOrderProducts}
        CheckoutPayPalPrice={CheckoutPayPalPrice}
        CheckoutOrderID={CheckoutOrderID}
        initialStage={initialStage}
      />
    )
  }
  catch (paypal_error) {
    // logEvent(analytics(), "checkout_error_paypal_SSR") // TODO: server side log error
    return <HandlePayPalError paypal_error={paypal_error} />
  }
}