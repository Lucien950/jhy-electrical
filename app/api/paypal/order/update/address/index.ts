import { Address } from "types/address";
import { FormPrice } from "types/price";

export type updateOrderAddressProps = { token: string; address: Address; fullName: string; }
export type updateOrderAddressRes = { newPrice: FormPrice; }

