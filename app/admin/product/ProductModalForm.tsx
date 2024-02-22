"use client"
import { use, useState } from "react";
// ui
import { Oval } from "react-loader-spinner";
import { Dialog } from "@headlessui/react";
// types
import { Product, ProductVariantListing } from "types/product";
import { ModalModes } from "./ProductsComponent";
import { toSentenceCase } from "util/string";
import { ImageDragArea } from "./ImageDragArea";
import { stopProp } from "util/stopProp";
import { DeepPartial } from "types/util";
import { useProductImageURL } from "components/hooks/useProduct";

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


const VariantEditor = ({ defaultVariant, handleVariantEdit, deleteVariant, addVariantImageFile, removeVariantImageFile }: {
	defaultVariant: DeepPartial<ProductVariantListing>,
	handleVariantEdit: <K extends keyof ProductVariantListing, V extends ProductVariantListing[K]>(id: K, val: V) => void,
	deleteVariant: (sku: string) => void,

	// image manip
	addVariantImageFile: (s: string, f: File) => void,
	removeVariantImageFile: (s: string) => void
}) => {
	// TODO these two are non-ideal
	const handleChangeString = (id: keyof ProductVariantListing) => (v: string) => handleVariantEdit(id, v)
	const handleChangeNumber = (id: keyof ProductVariantListing) => (v: string) => handleVariantEdit(id, parseFloat(v))
	
	return (
		<div className="bg-neutral-300 rounded-md py-2 px-4" key={defaultVariant.sku}>
			<div className="flex flex-row">
				{defaultVariant.images?.map((img, i) => 
					<ImageDragArea defaultImageURL={img || null} addVariantImageFile={addVariantImageFile} removeVariantImageFile={removeVariantImageFile} />
				)}
			</div>
			<div className="flex flex-row items-center gap-x-4">
				<span> Variant Name:  </span>
				<div className="flex-1">
					<InputField field_key="label" defaultValue={defaultVariant.label} handleChange={handleChangeString('label')} />
				</div>
				<svg onClick={() => deleteVariant(defaultVariant.sku!)} className="h-8 w-8 cursor-pointer" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</div>
			<div className="flex flex-row gap-x-2 items-end">
				<InputField label="Quantity" field_key="quantity" defaultValue={defaultVariant.quantity?.toString()} handleChange={handleChangeNumber("quantity")} />
				<InputField label="Price" field_key="price" defaultValue={defaultVariant.price?.toString()} handleChange={handleChangeNumber("price")} units="$CAD" />
				<InputField label="Color" field_key="color" defaultValue={defaultVariant.color} handleChange={handleChangeString("color")} />
			</div>
			<div className="flex flex-row gap-x-2 items-end">
				{/* 3d empty box type icon */}
				<svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					<path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
				</svg>
				<InputField className="!w-16" label="Weight" field_key="weight" defaultValue={defaultVariant.weight?.toString()} units="kg" handleChange={handleChangeNumber("weight")} />
				<InputField className="!w-16" label="Width" field_key="width" defaultValue={defaultVariant.width?.toString()} units="cm" handleChange={handleChangeNumber("width")} />
				<InputField className="!w-16" label="Height" field_key="height" defaultValue={defaultVariant.height?.toString()} units="cm" handleChange={handleChangeNumber("height")} />
				<InputField className="!w-16" label="Length" field_key="length" defaultValue={defaultVariant.length?.toString()} units="cm" handleChange={handleChangeNumber("length")} />
			</div>
		</div>
	)
}

// THIS COMPONENT ONLY MUTATES THE GIVEN STATE!!!!
export default function ProductModalForm({defaultMode, onFormSubmit, uploading, closeModal, modalProduct, handleProductEdit, createVariant, updateVariantGen, deleteVariant, addVariantImageFile, removeVariantImageFile}: {
  // modal operation
  defaultMode: ModalModes,
  closeModal: () => void,
  // product
  modalProduct: DeepPartial<Product>,
  handleProductEdit: <K extends keyof Product, V extends Product[K]>(id: K, val: V) => void,
  createVariant: () => void,
  updateVariantGen: (sku: string) => <K extends keyof ProductVariantListing, V extends ProductVariantListing[K]>(id: K, val: V) => void,
  deleteVariant: (sku: string) => void,
	addVariantImageFile: (sku: string, s: string, f: File) => void,
	removeVariantImageFile: (sku: string, s: string) => void,
  // submitting
  onFormSubmit: () => Promise<void>,
  uploading: boolean,
}) {
  	// data state
	const [modalMode,] = useState(defaultMode) //just for latching i believe

  return (
    <Dialog.Panel as="form" className="bg-white z-20 max-h-[90vh] overflow-scroll rounded-xl w-[37rem]" onSubmit={(e) => {
      stopProp(e);
      onFormSubmit();
    }}>
      {/* toprow */}
      <div className="sticky top-0 bg-white z-50">
        <div className="flex flex-row p-8 px-12 pb-2 justify-between">
          <Dialog.Title className="text-3xl font-bold">{toSentenceCase(modalMode)} Product</Dialog.Title>
          {/* x button */}
          <svg onClick={closeModal} tabIndex={0} className="w-8 h-8 hover:cursor-pointer focus:outline-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <hr />
      </div>

      {/* grid */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-4 p-8 px-12">
        {/* images */}
        <div className="col-span-2">
          <InputField label="Product Name" field_key="productName" defaultValue={modalProduct.productName} handleChange={(v) => handleProductEdit("productName", v)} />
        </div>
        {/* Pill Row */}
        <div className="flex flex-row gap-x-2 col-span-2 text-lg">
          <Pill label="residential" checked={modalProduct.residential} handleCheck={(v) => handleProductEdit("residential", v)} />
          <Pill label="commercial" checked={modalProduct.commercial} handleCheck={(v) => handleProductEdit("commercial", v)} />
          <Pill label="industrial" checked={modalProduct.industrial} handleCheck={(v) => handleProductEdit("industrial", v)} />
        </div>

        {/* variant editor */}
        <div className="col-span-2 flex flex-col gap-y-4">
          {
            modalProduct.variants?.map(v =>
              <VariantEditor defaultVariant={v} key={v.sku!} handleVariantEdit={updateVariantGen(v.sku!)} deleteVariant={deleteVariant}
								addVariantImageFile={(s, f) => addVariantImageFile(v.sku!, s, f)}
								removeVariantImageFile={(s)=> removeVariantImageFile(v.sku!, s)}
							/>
            )
          }
          <button className="border-2 py-1 outline-none focus:ring rounded-md" onClick={createVariant} type="button">Add Variant</button>
        </div>

        <div className="col-span-2">
          <label className="block text-sm" htmlFor="description">Description</label>
          <textarea className="block border-2 border-zinc-400 w-full max-h-32 rounded-md py-1 px-2 outline-none focus:ring-2 text-lg"
            onChange={(e) => handleProductEdit("description", e.target.value)} name="description" id="description" defaultValue={modalProduct.description} />
        </div>

        {/* bottom row */}
        <div className="col-span-2 grid grid-cols-2 gap-x-4">
          <button className="py-2 rounded-lg outline-none focus:ring-2 border-2 border-zinc-400"
            type="button" onClick={closeModal} disabled={uploading}>Cancel</button>
          {/* submit button */}
          <button className="py-2 rounded-lg outline-none focus:ring-2 bg-blue-600 text-white relative"
            type="submit" disabled={uploading}>
            {
              uploading
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