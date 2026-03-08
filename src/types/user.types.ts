export interface User {
    _id: string;
    name: string;
    email: string;
    image: string;
    role: string | null;
    restaurantId?: string; // added after fetchMyRestaurant issues new JWT
}