import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  Circle,
} from "react-leaflet";
import { BiX, BiCurrentLocation } from "react-icons/bi";
import { useAddAddress } from "../hooks/useAddress";
import { useUserLocation } from "../hooks/useLocation";
import { reverseGeocode } from "../api/locationApi";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/* ===================== */
/* Advanced Map Animation */
/* ===================== */

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }

    // Step 1: Zoom out slightly
    map.flyTo(map.getCenter(), 12, {
      animate: true,
      duration: 0.8,
    });

    // Step 2: Fly to new location
    setTimeout(() => {
      map.flyTo(center, 16, {
        animate: true,
        duration: 1.8,
      });
    }, 800);
  }, [center, map]);

  return null;
}

/* ===================== */
/* Animated Marker       */
/* ===================== */

function LocationMarker({
  position,
  setPosition,
  onLocationChange,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  onLocationChange: (lat: number, lon: number) => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);

  useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position]);

  return (
    <>
      <Marker
        position={position}
        icon={icon}
        ref={(ref) => {
          if (ref) markerRef.current = ref;
        }}
      />
      <Circle
        center={position}
        radius={120} 
        pathOptions={{
          color: "#2563eb",
          fillColor: "#3b82f6",
          fillOpacity: 0.08,
        }}
      />
    </>
  );
}

/* ===================== */
/* Main Modal Component  */
/* ===================== */

const AddAddressModal = ({ isOpen, onClose }: Props) => {
  const { location } = useUserLocation();
  const { addAddress, isLoading } = useAddAddress();

  const defaultPosition: [number, number] = location?.coords
    ? [location.coords.lat, location.coords.lon]
    : [34.0837, 74.7973];

  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [markerPosition, setMarkerPosition] =
    useState<[number, number]>(defaultPosition);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultPosition);
  const [fetchingAddress, setFetchingAddress] = useState(false);

  const fetchAddressFromCoords = async (lat: number, lon: number) => {
    setFetchingAddress(true);
    try {
      const locationData = await reverseGeocode({
        lat,
        lon,
      });
      setAddress(locationData.fullAddress);
    } catch {
      // reverse geocode failed silently
    } finally {
      setFetchingAddress(false);
    }
  };

  const handleUseMyLocation = () => {
    if (location?.coords) {
      const newPosition: [number, number] = [
        location.coords.lat,
        location.coords.lon,
      ];
      setMarkerPosition(newPosition);
      setMapCenter(newPosition);
      if (location.fullAddress) {
        setAddress(location.fullAddress);
      }
    }
  };

  const handleMapClick = (lat: number, lon: number) => {
    fetchAddressFromCoords(lat, lon);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress(
      {
        mobile: Number(mobile),
        formattedAddress: address,
        latitude: markerPosition[0],
        longitude: markerPosition[1],
      },
      {
        onSuccess: () => {
          onClose();
          setMobile("");
          setAddress("");
        },
      },
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold text-gray-900">Add New Address</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <BiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Mobile Number *
            </label>
            <input
              type="tel"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full rounded-lg border px-4 py-2"
            />
          </div>

          <div className="mb-4">
            <div className="mb-2 flex justify-between">
              <label className="text-sm font-semibold">
                Pin Location on Map *
              </label>
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="flex items-center gap-1 text-sm text-[#E23744]"
              >
                <BiCurrentLocation size={16} />
                Use My Location
              </button>
            </div>

            <div className="h-48 sm:h-64 rounded-lg border overflow-hidden">
              <MapContainer
                center={defaultPosition}
                zoom={13}
                style={{
                  height: "100%",
                  width: "100%",
                }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap"
                />
                <RecenterMap center={mapCenter} />
                <LocationMarker
                  position={markerPosition}
                  setPosition={setMarkerPosition}
                  onLocationChange={handleMapClick}
                />
              </MapContainer>
            </div>
          </div>

          <div className="mb-4">
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              disabled={fetchingAddress}
              className="w-full rounded-lg border px-4 py-2"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || fetchingAddress}
              className="flex-1 bg-[#E23744] text-white py-2 rounded-lg"
            >
              {isLoading ? "Adding..." : "Add Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAddressModal;
