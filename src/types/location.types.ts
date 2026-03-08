export interface Coordinates {
  lat: number;
  lon: number;
}

// types/location.types.ts
export interface Location {
  city: string;
  suburb: string | null;
  country: string;
  postcode: string | null;
  display: string;
  fullAddress: string;
  coords: Coordinates;
}