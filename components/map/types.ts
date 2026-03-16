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

export type LostMarker = {
  id: string;
  coordinate: Coords;
  name: string;
  color: string;
  breed: string;
  age: string;
  phone: string;
  imageUri: string;
  createdAt: number;
  note?: string;
};
