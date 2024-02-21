// next
import { redirect } from 'next/navigation';
import ProductListing from './listing';
import {getProductByID} from 'util/product';
import { Metadata } from 'next';

export async function generateMetadata({params}: {params: {pid?: string}}): Promise<Metadata> {
  if(!params.pid) {
    return {}
  }
  const product = await getProductByID(params.pid)
	return {
    title: product.productName
  }
}

export default async function ProductID({params}: {params: {pid?: string}}) {
  try {
		if (!params.pid) throw new Error("No PID provided")
		const product = await getProductByID(params.pid)
    return <ProductListing product={product} />;
	}
	catch (e) {
    console.error(e)
    redirect("/404")
	}
}