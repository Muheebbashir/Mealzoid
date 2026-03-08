export interface Address {
  _id: string;
  userId: string;
  mobile: number;
  formattedAddress: string;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: Date;
  updatedAt: Date;
}