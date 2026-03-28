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
  petType?: "dog" | "cat" | "other";
  connectedParent?: string;
  connectedChild?: string;
  isFound?: boolean;
};

export type Tip = {
  id: string;
  comment: string;
  location?: Coords;
  createdAt: number;
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
  petType?: "dog" | "cat" | "other";
  tips?: Tip[];
  connectedChild?: string;
  isFound?: boolean;
};
