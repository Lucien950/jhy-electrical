export interface GeocodeAPI {
	plus_code?: PlusCode;
	results: Result[];
	status: string;
	error_message?: string;
}

export interface PlusCode {
	compound_code: string;
	global_code: string;
}

export interface Result {
	address_components: AddressComponent[];
	formatted_address: string;
	geometry: Geometry;
	place_id: string;
	plus_code?: PlusCode;
	types: string[];
}

export interface AddressComponent {
	long_name: string;
	short_name: string;
	types: string[];
}

export interface Geometry {
	location: Location;
	location_type: LocationType;
	viewport: Bounds;
	bounds?: Bounds;
}

export interface Bounds {
	northeast: Location;
	southwest: Location;
}

export interface Location {
	lat: number;
	lng: number;
}

export enum LocationType {
	Approximate = "APPROXIMATE",
	GeometricCenter = "GEOMETRIC_CENTER",
	Rooftop = "ROOFTOP",
}

function getPosition(): Promise<GeolocationPosition>{
	// Simple wrapper
	return new Promise((res, rej) => {
		navigator.geolocation.getCurrentPosition(res, rej);
	});
}

const getUserPostcode = async () => {
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
	postalCode = geocodeResponse.results.filter(res => res.types.includes("postal_code"))[0].address_components.filter(res => res.types.includes("postal_code"))[0].long_name
	return postalCode
}

export { getUserPostcode }