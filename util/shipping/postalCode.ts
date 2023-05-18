import Joi from "joi";

interface GeocodeAPI {
	plus_code?: PlusCode;
	results: Result[];
	status: string;
	error_message?: string;
}
interface PlusCode {
	compound_code: string;
	global_code: string;
}
interface Result {
	address_components: AddressComponent[];
	formatted_address: string;
	geometry: Geometry;
	place_id: string;
	plus_code?: PlusCode;
	types: string[];
}
interface AddressComponent {
	long_name: string;
	short_name: string;
	types: string[];
}
interface Geometry {
	location: Location;
	location_type: LocationType;
	viewport: Bounds;
	bounds?: Bounds;
}
interface Bounds {
	northeast: Location;
	southwest: Location;
}
interface Location {
	lat: number;
	lng: number;
}
enum LocationType {
	Approximate = "APPROXIMATE",
	GeometricCenter = "GEOMETRIC_CENTER",
	Rooftop = "ROOFTOP",
}

export const postalCodePattern = "^(?!.*[DFIOQUdfioqu])[A-VXYa-vxy][0-9][A-Za-z][ -]?[0-9][A-Za-z][0-9]$"
export const postalCodeSchema = Joi.string().regex(new RegExp(postalCodePattern)).required()
export const validatePostalCode = (candidate?: string) => (candidate !== undefined) && (postalCodeSchema.validate(candidate).error === undefined)

const getPosition = () => new Promise((res, rej) => { navigator.geolocation.getCurrentPosition(res, rej) }) as Promise<GeolocationPosition>
export const getUserPostcode = async () => {
	if (!navigator.geolocation) {
		console.error("Sorry, Geolocation is not supported by your browser.")
		return
	}

	const position = await getPosition().catch(error=>{
		switch (error.code) {
			case error.PERMISSION_DENIED:
				console.error("User denied the request for Geolocation.")
				break
			case error.POSITION_UNAVAILABLE:
				console.error("Location information is unavailable.")
				break
			case error.TIMEOUT:
				console.error("The request to get user location timed out.")
				break
			default:
				console.error("An unknown error occurred.")
				break
		}
	})
	if(!position) return

	let lat = position.coords.latitude,
		long = position.coords.longitude,
		url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + long + "&key=AIzaSyAoZ63l_01Pq3QnOomUFZEJdVzL3OOWf5o";
	console.log("MAPS API CALL")
	const response = await fetch(url)
	let geocodeResponse = await response.json() as GeocodeAPI, postalCode = '';
	if (geocodeResponse.status == "REQUEST_DENIED"){
		throw geocodeResponse.error_message
	}
	postalCode = geocodeResponse.results
		.filter(res => res.types.includes("postal_code"))[0].address_components
		.filter(res => res.types.includes("postal_code"))[0].long_name
	return postalCode
}