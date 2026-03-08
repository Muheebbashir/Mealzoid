import { useQuery } from "@tanstack/react-query";
import { fetchNearbyRestaurants, fetchRestaurantById } from "../api/restaurantApi";
import type { Restaurant } from "../types/restaurant.types";

export const useNearbyRestaurants = (
  latitude?: number,
  longitude?: number,
  radius?: number,
  search?: string
) => {
  const { data, isLoading, error } = useQuery<{ restaurants: Restaurant[]; count: number }>({
    queryKey: ["nearbyRestaurants", latitude, longitude, radius, search],
    queryFn: () => fetchNearbyRestaurants(latitude!, longitude!, radius, search),
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 30,
  });

  return {
    restaurants: data?.restaurants ?? [],
    count: data?.count ?? 0,
    isLoading,
    error,
  };
};

export const useSingleRestaurant = (restaurantId?: string) => {
  const { data, isLoading, error } = useQuery<{ restaurant: Restaurant; message: string }>({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => fetchRestaurantById(restaurantId!),
    enabled: !!restaurantId,
  });

  return {
    restaurant: data?.restaurant,
    isLoading,
    error,
  };
};  