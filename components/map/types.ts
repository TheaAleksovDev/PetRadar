export type Coords = { latitude: number; longitude: number };

export type SightingMarker = {
  id: string;
  coordinate: Coords;
  color: string;
  breed: string;
  age: string;
  imageUri: string;
  createdAt: number;
  note?: string;
};
