"use client"
import { PayPalWhiteSVG } from 'components/paypalSVG';
import { Oval } from 'react-loader-spinner';

export const PayPalCartButton = ({has_stock, handlePayPalExpressCheckout, selectedQuantity, paypalProcessing}:
  {has_stock: boolean, handlePayPalExpressCheckout: ()=>void, selectedQuantity: number, paypalProcessing: boolean}) => {
  return (
    <button
      onClick={handlePayPalExpressCheckout} disabled={!has_stock || paypalProcessing}
      className={
        `mt-2 p-3 w-full relative grid place-items-center
								font-bold bg-blue-700 text-white 
								hover:scale-[102%] transition-transform active:scale-[97%]
								${!has_stock ? "disabled:bg-blue-300 disabled:scale-100" : ""}`
      }
    >
      <Oval height={18} width={18} strokeWidth={10} strokeWidthSecondary={10} color="white" secondaryColor="white"
        wrapperClass={`ml-3 mr-2 opacity-0 transition-[opacity] ${paypalProcessing && "opacity-100"} justify-self-start`} />
      <div className={`absolute flex justify-center items-center group-disabled:opacity-60 transition-[transform,opacity] duration-200 delay-300 ${paypalProcessing && "translate-x-[14px] !delay-[0s]"}`}>
        <PayPalWhiteSVG className="h-4 translate-y-[2px]" />
        <span className="ml-1 font-bold font-paypal italic leading-none">Express Checkout </span>
        {
          has_stock &&
          <span className="ml-2">with {selectedQuantity} element{selectedQuantity > 1 && "s"}</span>
        }
      </div>
    </button>
  )
}