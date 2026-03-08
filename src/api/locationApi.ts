import axios from "axios";
import type { Coordinates, Location } from "../types/location.types";

export const reverseGeocode = async ({ lat, lon }: Coordinates): Promise<Location> => {
  const res = await axios.get("https://mealzoid-auth.onrender.com/api/location/geocode", {
    params: {
      lat,
      lon,
    },
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const address = res.data.address;
  
  const parts = [
    address.suburb || address.neighbourhood,
    address.city || address.town || address.village,
    address.postcode,
    address.state,
    address.country
  ].filter(Boolean);

  return {
    city: address.city || address.town || address.village || "Unknown",
    suburb: address.suburb || address.neighbourhood || null,
    country: address.country,
    postcode: address.postcode || null,
    display: address.suburb || address.city || address.town || "Your Location",
    fullAddress: parts.join(", "),
    coords: { lat, lon },
  };
};