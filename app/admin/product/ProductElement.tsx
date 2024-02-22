import { CommercialIcon, IndustrialIcon, ResidentialIcon } from "components/categoryIcons";
import { Variants, motion } from "framer-motion";
import { Oval } from "react-loader-spinner";
import ProductComponentsCSS from "./ProductsComponent.module.css";
import { Product } from "types/product";
import { useState } from "react";
import { toast } from "react-toastify";
import { useProductImageURL } from "components/hooks/useProduct";

export const ProductElement = ({ product, deleteProduct, openEditModal, itemVariants }: {
	product: Product;
	deleteProduct: (id: string) => Promise<void>;
	openEditModal: (p: Product) => void;
	itemVariants: Variants;
}) => {
	const [deleteActive, setDeleteActive] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const setConfirmOn = () => {
		setConfirmDelete(true);
		setTimeout(() => setConfirmDelete(false), 3000);
	};
	const handleDeleteProduct = async () => {
		setConfirmDelete(false);
		setDeleteActive(true);
		const deleteToastID = toast.warn("Deleting Product: DO NOT LEAVE THIS PAGE", {
			autoClose: false,
			closeOnClick: false,
			draggable: false,
			hideProgressBar: true,
			pauseOnHover: false
		});
		await deleteProduct(product.firestoreID);
		toast.dismiss(deleteToastID);
		toast.success("Product Deleted");
		setDeleteActive(false);
	};

	const productImageURL = useProductImageURL(product.variants[0].images[0]);
	return (
		<motion.div
			className="flex flex-row flex-wrap lg:flex-nowrap py-4 px-3 items-center gap-x-2 rounded bg-slate-200 shadow-sm"
			variants={itemVariants} transition={{ ease: "easeInOut" }} layout
		>
			{productImageURL && <img src={productImageURL} alt="" className="h-16 relative" />}
			<div className="flex-1">
				<div>
					<p className="inline mr-1">{product.productName}</p>
					<div className="inline-flex flex-row gap-x-1">
						{product.commercial && <CommercialIcon className="w-4 h-4 fill-zinc-700" />}
						{product.industrial && <IndustrialIcon className="w-4 h-4 fill-zinc-700" />}
						{product.residential && <ResidentialIcon className="w-4 h-4 fill-zinc-700" />}
					</div>
				</div>
				<p>Variants: {product.variants.map(v => v.label || "_").join(", ")}</p>
			</div>
			<svg onClick={() => openEditModal(product)} className="h-6 w-6 hover:cursor-pointer shrink-0 fill-transparent stroke-black" aria-hidden="true" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /> </svg>
			<div className="shrink-0">
				{deleteActive
					? <Oval height={24} width={24} strokeWidth={10} color="#28a9fa" secondaryColor="#28a9fa" />
					: confirmDelete
						?
						<div className="relative">
							<svg onClick={handleDeleteProduct} className="h-6 w-6 hover:cursor-pointer fill-black stroke-transparent" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"> <path clipRule="evenodd" fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" /> </svg>
							<div className={`absolute inset-0 rounded-full pointer-events-none ${ProductComponentsCSS.confirmDeleteRound}`}></div>
						</div>
						: <svg onClick={setConfirmOn} className="w-6 h-6 hover:cursor-pointer fill-transparent stroke-black" aria-hidden="true" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"> <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> </svg>}
			</div>
		</motion.div>
	);
};
