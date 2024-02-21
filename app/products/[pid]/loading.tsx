"use client"
import { Oval } from "react-loader-spinner";

const ProductListingLoading = () => {
  return (
    <div className="grid place-items-center h-screen w-screen">
      <Oval height={100} width={100} color="#28a9fa" secondaryColor="#28a9fa" />
    </div>
  );
}

export default ProductListingLoading;