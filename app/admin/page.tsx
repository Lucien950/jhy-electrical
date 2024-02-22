import { Metadata } from 'next';
import AdminRoot from './AdminRoot';

export const metadata: Metadata = {
	title: "Admin"
}
export default function Admin() {
	return <AdminRoot />
} 