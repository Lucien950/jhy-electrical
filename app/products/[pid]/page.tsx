// next
import { redirect, useRouter } from 'next/navigation';
import ProductListing from './listing';
import {getProductByID} from 'util/product';

export default async function ProductID({params}: {params: {pid?: string}}) {
  try {
    console.log(params.pid)
		if (!params.pid) throw new Error("No PID provided")
		const product = await getProductByID(params.pid)
    return <ProductListing product={product} />;
	}
	catch (e) {
    console.error(e)
    redirect("/404")
	}
}