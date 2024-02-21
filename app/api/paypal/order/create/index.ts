import { OrderResponseBody } from '@paypal/paypal-js';
import { OrderProduct } from 'types/order';


export type createOrderProps = { products: OrderProduct[]; express?: boolean; }
export type createOrderRes = {
	orderStatus: OrderResponseBody["status"];
	orderID: string;
	redirect_link: string | null;
};