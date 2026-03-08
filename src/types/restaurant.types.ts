export interface Restaurant {
    _id: string;
    name: string;
    description?: string;
    image: string;
    ownerId: string;
    phone:number;
    isVerified: boolean;

    autoLocation: {
        type: "Point";
        coordinates: [number, number]; // [longitude, latitude]
        formattedAddress: string;
    };
  isOpen: boolean;
  distance?: number;    
  distanceKm?: number;   
  createdAt: Date;
  updatedAt: Date;
}
