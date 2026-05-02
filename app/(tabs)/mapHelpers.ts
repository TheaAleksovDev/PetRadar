import type { SightingMarker } from "@/components/map/types";

export type Form = {
  color: string;
  breed: string;
  age: string;
  note: string;
  petType: string;
};

export const EMPTY_FORM: Form = {
  color: "",
  breed: "",
  age: "",
  note: "",
  petType: "dog",
};

export type PinnedChain = { id: string; chain: SightingMarker[]; color: string };

export const CHAIN_COLORS = [
  "#F59E0B",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

export function getFullChainIds(
  markerId: string,
  allMarkers: SightingMarker[],
): Set<string> {
  const ids = new Set<string>();
  let current = allMarkers.find((m) => m.id === markerId);
  while (current?.connectedParent) {
    current = allMarkers.find((m) => m.id === current!.connectedParent);
  }
  while (current) {
    ids.add(current.id);
    current = current.connectedChild
      ? allMarkers.find((m) => m.id === current!.connectedChild)
      : undefined;
  }
  return ids;
}

export function buildChain(
  marker: SightingMarker,
  allMarkers: SightingMarker[],
): SightingMarker[] {
  const chain: SightingMarker[] = [];
  let current: SightingMarker | undefined = marker;
  while (current) {
    chain.unshift(current);
    const parentId: string | undefined = current.connectedParent;
    current = parentId ? allMarkers.find((m) => m.id === parentId) : undefined;
  }
  return chain;
}
