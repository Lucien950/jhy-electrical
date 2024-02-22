import { getDownloadURL, ref } from "firebase/storage";
import { DragEventHandler, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { storage } from "util/firebase/storage";
import { generateNewSKU } from "util/product";
import { stopProp } from "util/stopProp";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"]

export function ImageDragArea({ defaultImageURL, addVariantImageFile, removeVariantImageFile }: {
	defaultImageURL: string | null,
	addVariantImageFile: (image: string, imageFile: File) => void,
	removeVariantImageFile: (image: string) => void,
}) {
	const [imagePreviewURL, setDisplayImageURL] = useState<string | null>(null);
	useEffect(() => {
		getDownloadURL(ref(storage, `products/${defaultImageURL}`)).then(setDisplayImageURL)
	}, [defaultImageURL])


	const [imageRef, setImageRef] = useState<string | null>(null);

	function addImage(imageFiles: FileList) {
		if (imageFiles.length > 1) {
			toast.error("Too many files", { theme: "colored" });
			setFileActive(false);
			return;
		}
		const imageFile = imageFiles[0]
		if (!IMAGE_TYPES.includes(imageFile.type)) {
			toast.error("Wrong file type", { theme: "colored" });
			return;
		}

		const imageName = generateNewSKU()
		if(imageRef) {
			removeVariantImageFile(imageRef)
		}
		addVariantImageFile(imageName, imageFile);
		setImageRef(imageName);
		setDisplayImageURL(URL.createObjectURL(imageFile));
	}

	// drag and drop area
	const [fileActive, setFileActive] = useState(false);
	const dragElement = useRef<HTMLLabelElement>(null);
	const dragEnter: DragEventHandler<HTMLElement> = (e) => { stopProp(e); setFileActive(true); };
	const dragLeave: DragEventHandler<HTMLElement> = (e) => {
		if (dragElement.current?.contains(e.relatedTarget as Node)) return; // if a child element was leaved, do nothing
		stopProp(e);
		setFileActive(false);
	};
	const dropListener: DragEventHandler<HTMLElement> = (e) => {
		stopProp(e);
		addImage(e.dataTransfer.files)
		setFileActive(false);
	};
	return (
		<label
			onDrop={dropListener} onDragEnter={dragEnter} onDragLeave={dragLeave} onDragOver={stopProp} onDrag={stopProp}
			className="border-2 border-zinc-400 data-[fileactive='true']:border-blue-500 rounded-xl border-dashed p-10 py-6 grid place-items-center hover:cursor-pointer"
			ref={dragElement} htmlFor="productImageFile" data-fileactive={fileActive}
		>
			{/* Image Preview */}
			{imagePreviewURL &&
				<div className="h-16 mb-4">
					<img id="outImage" src={imagePreviewURL} alt="Product Image" className="h-16" />
				</div>
			}
			{/* Upload Icon */}
			{!imagePreviewURL &&
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
					className="w-6 h-6">
					<path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
				</svg>
			}
			<input className="hidden" type="file" id="productImageFile" accept='image/jpeg, image/png'
				onChange={(e) => { if(!e.target.files) return; addImage(e.target.files); }}
			/>
		</label>
	);
};
