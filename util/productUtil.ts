import { doc, DocumentData, getDoc, DocumentSnapshot, getDocs, collection } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
import { db } from "util/firebase/firestore"
import { storage } from "util/firebase/storage";
// type
import { FirebaseProductInterface, ProductInterface } from "types/product";

/**
 * Given a Document aquired from firestore, The full product interface
 * @param productDoc Document aquired from firestore
 * @returns The full product interface
 */
export const fillProductDoc = async (productDoc: DocumentSnapshot<DocumentData>): Promise<ProductInterface>=>{
	const product = productDoc.data() as FirebaseProductInterface
	return {
		...product,
		firestoreID: productDoc.id,
		productImageURL: await getDownloadURL(ref(storage, `products/${productDoc.id}`)),
	}
}

/**
 * Given a product ID, returns the product object
 * @param productID Product ID
 * @returns product object
 */
export const getProductByID = async (productID: string)=>{
	const productDoc = await getDoc(doc(db, "products", productID))
	if(!productDoc.exists()) throw new Error(`Product ${productID} does not exist`)
	return fillProductDoc(productDoc)
}

/**
 * Given a list of product IDs, returns the product objects
 * @param productList List of product IDs
 * @returns The products objects of the given IDs
 */
export const getProductsByIDs = async(productList: string[])=>{
	return await Promise.all(productList.map(async pid => getProductByID(pid)))
}

/**
 * @returns All products in the database
 */
export const getAllProducts = async()=>{
	const productsQS = await getDocs(collection(db, "products"));
	const products: ProductInterface[] = await Promise.all(productsQS.docs.map(doc => fillProductDoc(doc)))
	return products
}

/**
 * @param p List of products to sort
 * @returns List of sorted products by name
 */
export const sortProductsByName = (p: ProductInterface[]) => p.sort((a, b) => {
	if (a.productName.toUpperCase() < b.productName.toUpperCase()) return -1
	else if (a.productName.toUpperCase() > b.productName.toUpperCase()) return 1
	else return 0
})