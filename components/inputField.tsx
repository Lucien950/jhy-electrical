import { JSX } from "react"
import InputMask, { Props } from "react-input-mask";

interface InputFieldProps {
	field_id: string,
	setField: (id: string, value: string) => void,
	label?: string,
	mask?: string
}
// type HTMLInputProps = JSX.IntrinsicAttributes & ClassAttributes<HTMLInputElement> & InputHTMLAttributes<HTMLInputElement>
type InputMaskProps = JSX.IntrinsicAttributes & JSX.IntrinsicClassAttributes<InputMask> & Omit<Readonly<Props>, "mask">
export const InputField = ({ field_id, setField, label, className: moreClassNames, mask = "", placeholder, ...rest }: InputMaskProps & InputFieldProps ) => {
	return (
		<label htmlFor={field_id} className={moreClassNames + " text-sm group"}>
			{
				label &&
					<span className="inline-block mb-1 group-focus-within:text-blue-500 transition-colors">
					{label}	
					</span>
			}

			<InputMask mask={mask} type="text" name={field_id} id={field_id} onChange={(e) => setField(field_id, e.target.value)}
				className="border-2 w-full" placeholder={placeholder}
				{...rest} />

			{/* <input type="text" name={field_id} id={field_id} onChange={(e) => setField(field_id, e.target.value)}
				className="px-3 py-4 border-2 rounded-lg focus:outline-none focus:ring-2 w-full" placeholder={placeholder}
				{...rest}/> */}
		</label>
	)
}