import { ChangeEventHandler, FormEventHandler, JSX, forwardRef, useState } from "react"
import InputMask, { Props } from "react-input-mask";

interface InputFieldProps {
	field_id?: string,
	setField?: (id: string, value: string) => void,
	label?: string,
	mask?: string,
}
// type HTMLInputProps = JSX.IntrinsicAttributes & ClassAttributes<HTMLInputElement> & InputHTMLAttributes<HTMLInputElement>
type InputMaskProps = JSX.IntrinsicAttributes & JSX.IntrinsicClassAttributes<InputMask> & Omit<Readonly<Props>, "mask">
export const InputField = ({ field_id, setField, label, className: moreClassNames, mask="", placeholder, ref, ...rest }: Partial<InputMaskProps> & InputFieldProps) => {
	const [selfInvalid, setSelfInvalid] = useState(false)
	const onInvalidEvent: FormEventHandler<HTMLInputElement> = (e)=>{
		setSelfInvalid(true)
	}
	const onChangeEvent: ChangeEventHandler<HTMLInputElement> = (e) => {
		if(setField && field_id) setField(field_id, e.target.value)
		if (e.target.checkValidity()) setSelfInvalid(false)
	}

	return (
		<label htmlFor={field_id} className={moreClassNames + " text-sm group"}>
			{
				label &&
				<span className="inline-block mb-1 group-focus-within:text-blue-500 transition-colors">
					{label}
				</span>
			}
			<InputMask mask={mask} type="text" name={field_id} id={field_id} onChange={onChangeEvent} onInvalid={onInvalidEvent}
				className={`w-full border-2 px-3 py-4 rounded-lg text-base focus:outline-none focus:ring-2 transition-colors ${selfInvalid ? "border-red-400 bg-red-50" : ""}`}
				placeholder={placeholder} ref={ref} {...rest} />
		</label>
	)
}