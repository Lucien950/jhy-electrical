import { doc, DocumentData, getDoc, DocumentSnapshot, getDocs, collection } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db } from "util/firebase/firestore"
import { storage } from "util/firebase/storage";
// type
import { ProductInterface } from "types/product";

export const fillProductDoc = async (productDoc: DocumentSnapshot<DocumentData>)=>{
	const product = productDoc.data() as ProductInterface
	product.firestoreID = productDoc.id
	product.productImageURL = await getDownloadURL(ref(storage, `products/${product.firestoreID}`))
	return product
}

export const getProductByID = async (productID: string)=>{
	const productDoc = await getDoc(doc(db, "products", productID))
	if(!productDoc.exists()) throw new Error(`Product ${productID} does not exist`)
	return fillProductDoc(productDoc)
}

export const getProductsByIDs = async(productList: string[])=>{
	return await Promise.all(productList.map(async pid => getProductByID(pid)))
}

export const getAllProducts = async()=>{
	const productsQS = await getDocs(collection(db, "products"));
	const products: ProductInterface[] = await Promise.all(productsQS.docs.map(doc => fillProductDoc(doc)))
	return products
}