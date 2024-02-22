"use client"
import { useEffect, useState } from "react";
// ui
import { Oval } from "react-loader-spinner";
import { Dialog } from "@headlessui/react";
import { ThreeDCube, XButton } from "components/icons";
// types
import { Product, ProductVariantListing } from "types/product";
import { ModalModes } from "./ProductsComponent";
import { toSentenceCase } from "util/string";
import { ImageDragArea } from "./ImageDragArea";
import { stopProp } from "util/stopProp";
import { DeepPartial } from "types/util";

function InputField({ field_key, handleChange, label, defaultValue, className = "", units }: {
	field_key: string,
	handleChange: (val: string) => void,
	//optional
	label?: string,
	defaultValue?: string,
	className?: string,
	units?: string,
}) {
	return (
		<div>
			{label && <label className="block font-semibold text-sm" htmlFor={field_key}>{label}</label>}
			<div className="relative">
				<input className={`block border-2 border-zinc-400 rounded-md p-1 focus:outline-none focus:ring-2 w-full text-lg ${className}`}
					onChange={e => handleChange(e.target.value)}
					type="text" id={field_key} defaultValue={defaultValue}
				/>
				{units && <span className="absolute right-2 top-[50%] translate-y-[-50%] text-zinc-500 pointer-events-none text-sm">{units}</span>}
			</div>
		</div>
	)
}

function Pill({ label, checked, handleCheck }: {
	label: string,
	checked?: boolean,
	handleCheck: (val: boolean) => void
}) {
	if (checked === undefined) {
		handleCheck(false)
		return <></>
	}
	return (
		<label tabIndex={0} htmlFor={`pillbox-${label}`}
			className={`block select-none text-sm transition-colors hover:cursor-pointer p-1 px-4 border-2 rounded-xl outline-none focus:ring-2
			${checked ? "text-white bg-blue-600 border-blue-700" : "border-zinc-400"}`}
		> {toSentenceCase(label)}
			<input className="hidden" onChange={(e) => handleCheck(e.target.checked)} type="checkbox" name="" id={`pillbox-${label}`} defaultChecked={checked} />
		</label>
	)
}

const VariantImagePreview = ({img, getVariantImageURL, removeVariantImageFile}: {
	img: string,
	getVariantImageURL: (s: string) => Promise<string | null>,
	removeVariantImageFile: (s: string) => void,
}) => {
	const [url, setUrl] = useState<string | null>(null)
	useEffect(() => {getVariantImageURL(img).then(setUrl)}, [img])
	if(!url) {
		return <span key={`img-preview-${img}`}></span>
	} else {
		return (
			<div className="h-16 hover:cursor-pointer group relative">
				<img src={url} key={`img-preview-${img}`} className="h-full group-hover:opacity-50" onClick={() => removeVariantImageFile(img)}/>
				<p className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute text-sm top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] whitespace-nowrap">Remove Image</p>
			</div>
		)
	}
}

const VariantEditor = ({ defaultVariant, handleVariantEdit, deleteVariant, addVariantImageFile, removeVariantImageFile, getVariantImageURL }: {
	defaultVariant: DeepPartial<ProductVariantListing>,
	handleVariantEdit: <K extends keyof ProductVariantListing, V extends ProductVariantListing[K]>(id: K, val: V) => void,
	deleteVariant: () => void,
	// image manip
	addVariantImageFile: (s: string, f: File) => void,
	removeVariantImageFile: (s: string) => void,
	getVariantImageURL: (s: string) => Promise<string | null>,
}) => {
	// TODO these two are non-ideal
	const handleChangeString = (id: keyof ProductVariantListing) => (v: string) => handleVariantEdit(id, v)
	const handleChangeNumber = (id: keyof ProductVariantListing) => (v: string) => handleVariantEdit(id, parseFloat(v))
	
	return (
		<div className="bg-neutral-300 rounded-md py-6 px-4" key={defaultVariant.sku}>
			<div className="flex flex-row gap-x-2 mb-2">
				{defaultVariant.images?.map(img => <VariantImagePreview key={`image-preview-${img}`} img={img} getVariantImageURL={getVariantImageURL} removeVariantImageFile={removeVariantImageFile}/>)}
				<ImageDragArea addVariantImageFile={addVariantImageFile} dakey={defaultVariant.sku!} />
			</div>
			<div className="flex flex-row items-center gap-x-4">
				<span> Variant Name:  </span>
				<div className="flex-1">
					<InputField field_key="label" defaultValue={defaultVariant.label} handleChange={handleChangeString('label')} />
				</div>
				<XButton onClick={deleteVariant} className="h-8 w-8 cursor-pointer" strokeWidth={1.5} />
			</div>
			<div className="flex flex-row gap-x-2 items-end">
				<InputField label="Quantity" field_key="quantity" defaultValue={defaultVariant.quantity?.toString()} handleChange={handleChangeNumber("quantity")} />
				<InputField label="Price" field_key="price" defaultValue={defaultVariant.price?.toString()} handleChange={handleChangeNumber("price")} units="$CAD" />
				<InputField label="Color" field_key="color" defaultValue={defaultVariant.color} handleChange={handleChangeString("color")} />
			</div>
			<div className="flex flex-row gap-x-2 items-end">
				{/* 3d empty box type icon */}
				<ThreeDCube className="w-8 h-8" strokeWidth={1.5}/>
				<InputField className="!w-16" label="Weight" field_key="weight" defaultValue={defaultVariant.weight?.toString()} units="kg" handleChange={handleChangeNumber("weight")} />
				<InputField className="!w-16" label="Width" field_key="width" defaultValue={defaultVariant.width?.toString()} units="cm" handleChange={handleChangeNumber("width")} />
				<InputField className="!w-16" label="Height" field_key="height" defaultValue={defaultVariant.height?.toString()} units="cm" handleChange={handleChangeNumber("height")} />
				<InputField className="!w-16" label="Length" field_key="length" defaultValue={defaultVariant.length?.toString()} units="cm" handleChange={handleChangeNumber("length")} />
			</div>
		</div>
	)
}

// THIS COMPONENT ONLY MUTATES THE GIVEN STATE!!!!
export default function ProductModalForm({defaultMode, formSubmitAction, modalSubmitting, closeModal, defaultModalProduct, handleProductEdit, createVariant, updateVariant, deleteVariant, addVariantImageFile, removeVariantImageFile, getVariantImageURL}: {
	// modal operation
	defaultMode: ModalModes,
	closeModal: () => void,
	// product
	defaultModalProduct: DeepPartial<Product>,
	handleProductEdit: <K extends keyof Product, V extends Product[K]>(id: K, val: V) => void,
	// editing variants
	createVariant: () => void,
	updateVariant: <K extends keyof ProductVariantListing, V extends ProductVariantListing[K]>(sku: string, id: K, val: V) => void,
	deleteVariant: (sku: string) => void,
	// variant images
	addVariantImageFile: (sku: string, s: string, f: File) => void,
	removeVariantImageFile: (sku: string, s: string) => void,
	getVariantImageURL(sku: string, s: string): Promise<string | null>,
	// submitting
	formSubmitAction: () => Promise<void>,
	modalSubmitting: boolean,
}) {
	const [modalMode,] = useState(defaultMode) //just for latching i believe
	return (
		<Dialog.Panel as="form" className="bg-white z-20 rounded-xl overflow-clip w-[37rem]" onSubmit={(e) => { stopProp(e); formSubmitAction(); }}>
			{/* toprow */}
			<div className="sticky top-0 bg-white z-50">
				<div className="flex flex-row p-8 px-12 pb-4 justify-between">
					<Dialog.Title className="text-3xl font-bold">{toSentenceCase(modalMode)} Product</Dialog.Title>
					<XButton onClick={closeModal} tabIndex={0} className="w-8 h-8 hover:cursor-pointer focus:outline-red-500" strokeWidth={2.5}/>
				</div>
				<hr />
			</div>

			{/* Body */}
			<div className="grid grid-cols-2 gap-x-2 gap-y-4 p-8 px-12 max-h-[80vh] overflow-y-scroll">
				<div className="col-span-2">
					<InputField label="Product Name" field_key="productName" defaultValue={defaultModalProduct.productName} handleChange={(v) => handleProductEdit("productName", v)} />
				</div>
				{/* Pill Row */}
				<div className="flex flex-row gap-x-2 col-span-2 text-lg">
					<Pill label="residential" checked={defaultModalProduct.residential} handleCheck={(v) => handleProductEdit("residential", v)} />
					<Pill label="commercial" checked={defaultModalProduct.commercial} handleCheck={(v) => handleProductEdit("commercial", v)} />
					<Pill label="industrial" checked={defaultModalProduct.industrial} handleCheck={(v) => handleProductEdit("industrial", v)} />
				</div>

				{/* variant editor */}
				<div className="col-span-2 flex flex-col gap-y-4">
					{
						defaultModalProduct.variants?.map(defaultVariant =>
							<VariantEditor key={defaultVariant.sku!}
								// editing variants
								defaultVariant={defaultVariant}
								handleVariantEdit={(id, val) => updateVariant(defaultVariant.sku!, id, val)}
								deleteVariant={() => deleteVariant(defaultVariant.sku!)}
								// images
								addVariantImageFile={(s, f) => {console.log(defaultVariant.sku!); addVariantImageFile(defaultVariant.sku!, s, f)}}
								removeVariantImageFile={(s)=> removeVariantImageFile(defaultVariant.sku!, s)}
								getVariantImageURL={(s) => getVariantImageURL(defaultVariant.sku!, s) || null}
							/>
						)
					}
					<button className="border-2 py-1 outline-none focus:ring rounded-md" onClick={createVariant} type="button">Add Variant</button>
				</div>
				
				{/* description */}
				<div className="col-span-2">
					<label className="block text-sm" htmlFor="description">Description</label>
					<textarea className="block border-2 border-zinc-400 w-full max-h-32 rounded-md py-1 px-2 outline-none focus:ring-2 text-lg"
						onChange={(e) => handleProductEdit("description", e.target.value)}
						name="description" id="description" defaultValue={defaultModalProduct.description}
					/>
				</div>

				{/* bottom row */}
				<div className="col-span-2 grid grid-cols-2 gap-x-4">
					<button className="py-2 rounded-lg outline-none focus:ring-2 border-2 border-zinc-400"
						type="button" onClick={closeModal} disabled={modalSubmitting}>Cancel</button>
					{/* submit button */}
					<button className="py-2 rounded-lg outline-none focus:ring-2 bg-blue-600 text-white relative"
						type="submit" disabled={modalSubmitting}>
						{
							modalSubmitting
								? <Oval height={22} strokeWidth={7} color="white" secondaryColor="white"
									wrapperClass="absolute left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%]" />
								: `${modalMode ? toSentenceCase(modalMode) : "..."} Item`
						}
					</button>
				</div>
			</div>
		</Dialog.Panel>
	)
}