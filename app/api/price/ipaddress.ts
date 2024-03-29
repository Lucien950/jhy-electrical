import { subAddr } from "types/address";

interface ipAPILocation {
	ip: string;
	network: string;
	version: string;
	city: string;
	region: string;
	region_code: string;
	country: string;
	country_name: string;
	country_code: string;
	country_code_iso3: string;
	country_capital: string;
	country_tld: string;
	continent_code: string;
	in_eu: boolean;
	postal: string;
	latitude: number;
	longitude: number;
	timezone: string;
	utc_offset: string;
	country_calling_code: string;
	currency: string;
	currency_name: string;
	languages: string;
	country_area: number;
	country_population: number;
	asn: string;
	org: string;
}

const invalidIps = ["::1", "::ffff:127.0.0.1"]

export const getAddressFromIP = async (clientIP: string): Promise<subAddr> => {
	const fetchURL = !invalidIps.includes(clientIP) ? `https://ipapi.co/${clientIP}/json` : "https://ipapi.co/198.96.61.52/json"
  // address
  const ipRes = await fetch(fetchURL)
  if (!ipRes.ok) throw await ipRes.json()
  const data: ipAPILocation = await ipRes.json()
  if (data.country_code != "CA") throw new Error("Not in Canada")
  return {
    postal_code: `${data.postal}1A1`,
    admin_area_1: data.region,
  }
}