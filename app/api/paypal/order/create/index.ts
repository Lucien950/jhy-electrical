import { OrderResponseBody } from '@paypal/paypal-js';
import Joi from 'joi';
import { OrderProduct, orderProductSchema } from 'types/order';
import { attemptSchemaGenerator } from 'util/typeValidate';

export type createOrderProps = { products: OrderProduct[]; express?: boolean; }
const createOrderPropsSchema = Joi.object({
	products: Joi.array().items(orderProductSchema).required().min(1),
	express: Joi.boolean().optional()
})
export type createOrderRes = {
	orderStatus: OrderResponseBody["status"];
	orderID: string;
	redirect_link: string | null;
};
export const attemptCreateOrderProps = attemptSchemaGenerator<createOrderProps>(createOrderPropsSchema)