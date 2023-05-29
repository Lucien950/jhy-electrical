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

const getPosition = (): Promise<GeolocationPosition> => new Promise((res, rej) => {
	navigator.geolocation.getCurrentPosition(res, rej)
})

// TODO make this a api endpoint
export const getUserPostcode = async () => {
	if (!navigator.geolocation) return console.error("Sorry, Geolocation is not supported by your browser.")

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

	const lat = position.coords.latitude,
				long = position.coords.longitude,
				url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
	
	const response = await fetch(url)
	let geocodeResponse = await response.json() as GeocodeAPI, postalCode = '';
	if (geocodeResponse.status == "REQUEST_DENIED") throw geocodeResponse.error_message
	postalCode = geocodeResponse.results
		.filter(res => res.types.includes("postal_code"))[0].address_components
		.filter(res => res.types.includes("postal_code"))[0].long_name
	return postalCode
}