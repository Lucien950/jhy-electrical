/**
 * 
 * @param displayError Error to display to the client
 * @returns Function that throws a given error: THROWN ERROR IS THE DISPLAY ERROR
 */
export const clientErrorFactory = (displayError: string) => {
	return (error: string) => {
		console.error(error)
		throw new Error(displayError)
	}
}