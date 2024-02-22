import { useRef, useState } from "react";
// ui
import { UploadIcon } from "components/icons";
import { toast } from "react-toastify";
// util
import { generateNewSKU } from "util/product";
import { stopProp } from "util/stopProp";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"]

export function ImageDragArea({ addVariantImageFile, dakey }: {
	addVariantImageFile: (image: string, imageFile: File) => void, dakey: string
}) {
	function addImageFileHandler(imageFiles: FileList) {
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
		addVariantImageFile(generateNewSKU(), imageFile);
	}
	// drag and drop area
	const [fileActive, setFileActive] = useState(false);
	const dragElement = useRef<HTMLLabelElement>(null);
	return (
		<label
			onDragEnter={(e) => { stopProp(e); setFileActive(true); }}
			onDrop={(e) => { stopProp(e); addImageFileHandler(e.dataTransfer.files); setFileActive(false); }}
			onDragLeave={(e) => {
				if (dragElement.current?.contains(e.relatedTarget as Node)) return; // if a child element was leaved, do nothing
				stopProp(e); setFileActive(false);
			}}
			onDragOver={stopProp} onDrag={stopProp}
			className="border-2 border-zinc-400 data-[fileactive='true']:border-blue-500 rounded-xl border-dashed p-10 py-6 grid place-items-center hover:cursor-pointer"
			ref={dragElement} htmlFor={`product_image_file-${dakey}`} data-fileactive={fileActive}
		>
			{/* Image Preview */}
			<UploadIcon className="w-6 h-6" strokeWidth={2}/>
			<input className="hidden" type="file" id={`product_image_file-${dakey}`} accept='image/jpeg, image/png'
				onChange={(e) => { if(!e.target.files) return; addImageFileHandler(e.target.files); }}
			/>
		</label>
	);
}
