import { doc, DocumentData, getDoc, DocumentSnapshot, getDocs, collection } from "firebase/firestore";
import { db } from "util/firebase/firestore"
// type
import { FirebaseProduct, Product, ProductWithVariant } from "types/product";

/**
 * Given a Document aquired from firestore, The full product interface
 * @param productDoc Document aquired from firestore
 * @returns The full product interface
 * @throws Error if the product does not exist
 */
const _fillProductDoc = async (productDoc: DocumentSnapshot<DocumentData>): Promise<Product> => {
	const product = productDoc.data() as FirebaseProduct | undefined
	if(!product) {
		throw new Error(`Product ${productDoc.id} does not exist`)
	}
	return {
		...product,
		firestoreID: productDoc.id
	}
}

/**
 * @param productID Product ID
 * @returns The product document from firebase
 * @throws Error if the product does not exist
 */
const _getFirebaseProductDocByID = async (productID: string) => {
	const productDoc = await getDoc(doc(db, "products", productID))
	if (!productDoc.exists()) throw new Error(`Product ${productID} does not exist`)
	return productDoc
}

/**
 * Given a product ID, returns the product object
 * @param pid Product ID
 * @returns product object
 * @throws Error if the product does not exist
 */
export const getProductByID = async (pid: string) => _fillProductDoc(await _getFirebaseProductDocByID(pid))

/**
 * Given a list of product IDs, returns the product objects
 * @param pids List of product IDs
 * @returns The products objects of the given IDs
 * @throws Error if any of the products do not exist
 */
export const getProductsByIDs = async (pids: string[]) => await Promise.all(pids.map(async pid => getProductByID(pid)))

/**
 * @returns All products in the database
 */
export const getAllProducts = async () => {
	const productsQS = await getDocs(collection(db, "products"));
	const products: Product[] = await Promise.all(productsQS.docs.map(doc => _fillProductDoc(doc)))
	return products
}

/**
 * @param p List of products to sort
 * @returns List of sorted products by name
 */
export const sortProductsByName = (p: Product[]) => p.sort((a, b) => {
	if (a.productName.toUpperCase() < b.productName.toUpperCase()) return -1
	else if (a.productName.toUpperCase() > b.productName.toUpperCase()) return 1
	else return 0
})

export const findProductVariant = (p: Product, variantID: string) => p.variants.find(v => v.sku === variantID)

export const flattenProductVariant = async (p: Product, variantSKU: string): Promise<ProductWithVariant> => {
	const { variants, ...productData } = p
		const selectedVariant = variants.find(v => v.sku == variantSKU)
		if (!selectedVariant) throw new Error(`Variant ${variantSKU} does not exist`)
		return {
			...productData,
			...selectedVariant,
		}
}

export const getProductVariant = async (PID: string, SKU: string): Promise<ProductWithVariant> => flattenProductVariant(await getProductByID(PID), SKU)

export const generateNewSKU = () =>
	Array.from({ length: 16 })
		.map(() => Math.floor(Math.random() * 64))
		.map(i => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(i))
		.join("")