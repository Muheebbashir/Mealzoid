declare module "leaflet-routing-machine" {
  import * as L from "leaflet";
  export function control(options: any): any;
  export function waypoint(latLng: L.LatLng, name?: string, options?: any): any;
}
