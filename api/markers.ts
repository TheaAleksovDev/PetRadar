import apiClient from "./client";
import type { LostMarker, SightingMarker, Tip } from "@/components/map/types";

type MarkerPayload = {
  markerType: "SEEN" | "LOST";
  petType?: string;
  breed: string;
  color: string;
  age: string;
  name?: string;
  phone?: string;
  note?: string;
  imageUri?: string;
  latitude: number;
  longitude: number;
  connectedParent?: string;
  connectedChild?: string;
  createdAt: number;
};

type TipPayload = {
  comment: string;
  latitude?: number;
  longitude?: number;
  createdAt: number;
};

function toSightingMarker(m: any): SightingMarker {
  return {
    id: String(m.id),
    coordinate: { latitude: m.latitude, longitude: m.longitude },
    color: m.color,
    breed: m.breed,
    age: m.age,
    imageUri: m.imageUri || "",
    createdAt: m.createdAt,
    note: m.note,
    petType: m.petType,
    connectedParent: m.connectedParent,
    connectedChild: m.connectedChild,
    isFound: m.found ?? false,
  };
}

function toLostMarker(m: any): LostMarker {
  return {
    id: String(m.id),
    coordinate: { latitude: m.latitude, longitude: m.longitude },
    name: m.name || "",
    color: m.color,
    breed: m.breed,
    age: m.age,
    phone: m.phone || "",
    imageUri: m.imageUri || "",
    createdAt: m.createdAt,
    note: m.note,
    petType: m.petType,
    connectedChild: m.connectedChild,
    isFound: m.found ?? false,
    tips: (m.tips || []).map((t: any): Tip => ({
      id: String(t.id),
      comment: t.comment,
      location: t.latitude != null && t.longitude != null
        ? { latitude: t.latitude, longitude: t.longitude }
        : undefined,
      createdAt: t.createdAt,
    })),
  };
}

export async function fetchMyMarkerIds(): Promise<Set<string>> {
  const { data } = await apiClient.get("/api/markers/me");
  return new Set(data.map((m: any) => String(m.id)));
}

export async function fetchMyMarkers(): Promise<{ seen: SightingMarker[]; lost: LostMarker[] }> {
  const { data } = await apiClient.get("/api/markers/me");
  const seen = data.filter((m: any) => m.markerType === "SEEN").map(toSightingMarker);
  const lost = data.filter((m: any) => m.markerType === "LOST").map(toLostMarker);
  return { seen, lost };
}

export async function reopenMarker(id: string): Promise<void> {
  await apiClient.patch(`/api/markers/${id}/reopen`);
}

type UpdatePayload = {
  petType?: string;
  breed?: string;
  color?: string;
  age?: string;
  name?: string;
  phone?: string;
  note?: string;
};

export async function updateMarker(id: string, payload: UpdatePayload): Promise<void> {
  await apiClient.patch(`/api/markers/${id}`, payload);
}

export async function fetchAllMarkers(): Promise<{ sightings: SightingMarker[]; lost: LostMarker[] }> {
  const { data } = await apiClient.get("/api/markers");
  const sightings = data.filter((m: any) => m.markerType === "SEEN").map(toSightingMarker);
  const lost = data.filter((m: any) => m.markerType === "LOST").map(toLostMarker);
  return { sightings, lost };
}

export async function createMarker(payload: MarkerPayload): Promise<{ id: string }> {
  const { data } = await apiClient.post("/api/markers", payload);
  return { id: String(data.id) };
}

export async function deleteMarker(id: string): Promise<void> {
  await apiClient.delete(`/api/markers/${id}`);
}

export async function markAsFound(id: string): Promise<void> {
  await apiClient.patch(`/api/markers/${id}/found`);
}

export async function addTipToMarker(markerId: string, tip: TipPayload): Promise<Tip> {
  const { data } = await apiClient.post(`/api/markers/${markerId}/tips`, tip);
  return {
    id: String(data.id),
    comment: data.comment,
    location: data.latitude != null && data.longitude != null
      ? { latitude: data.latitude, longitude: data.longitude }
      : undefined,
    createdAt: data.createdAt,
  };
}
