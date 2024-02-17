// next
import { useRouter } from 'next/navigation';
import ProductListing from './listing';
import {getProductByID} from 'util/product/productUtil';

export default async function ProductID({params}: {params: {pid?: string}}) {
  const router = useRouter()
  try {
    console.log(params.pid)
		if (!params.pid) throw new Error("No PID provided")
		const product = await getProductByID(params.pid)
    return <ProductListing product={product} />;
	}
	catch (e) {
    router.push("/products")
    console.error(e)
    return;
	}
}