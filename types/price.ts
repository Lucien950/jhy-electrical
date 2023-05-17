export interface FinalPriceInterface {
	subtotal: number;
	shipping: number;
	tax: number;
	total: number;
}

export interface PriceInterface {
	subtotal: number;
	shipping?: number;
	tax: number;
	total: number;
}