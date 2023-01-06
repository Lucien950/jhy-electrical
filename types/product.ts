type cm = number
type kg = number
export default interface product{
	productName: string,
	quantity: number,
	price: number,
	description: string,
	productImage: string, // name of file inside firebase storage
	
	commercial: boolean,
	industrial: boolean,
	residential: boolean,

	length: cm,
	width: cm,
	height: cm,
	weight: kg,


	// THESE MUST BE SUPPLEMENTED
	productImageURL?: string, //for fetching from storage
	productImageFile?: File, // for uploading

	firestoreID: string,
}