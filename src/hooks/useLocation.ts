import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { reverseGeocode } from "../api/locationApi";
import type { Coordinates, Location } from "../types/location.types";

export const useUserLocation = () => {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Location permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Location unavailable");
            break;
          case error.TIMEOUT:
            setGeoError("Location request timed out");
            break;
          default:
            setGeoError("Unknown location error");
        }
      }
    );
  }, []);

  const {
    data: location,
    isLoading,
  } = useQuery<Location>({
    queryKey: ["location", coords?.lat, coords?.lon],
    queryFn: () => reverseGeocode(coords!),
    enabled: !!coords,
    staleTime: 1000 * 60 * 60,
    retry: false,
  });

  return {
    location,
    isLoading: isLoading && !!coords,
    geoError,
    coords,
  };
};