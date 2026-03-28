import { Image, StyleSheet, Text, View } from "react-native";
import type { LostMarker, SightingMarker } from "./types";

const C = 64;
const INNER = C - 8;
const PAD = 4;
const W = C + PAD * 2;

const PIN_CIRCLE = 28;
const PIN_PAD = 3;

const BADGE = 20;

export const MARKER_W = W;
export const MARKER_H = C + 19;
export const PIN_W = PIN_CIRCLE + PIN_PAD * 2;
export const PIN_H = PIN_CIRCLE + 2 + 8;
export const DOT_SIZE = 12;

export const LOST_MARKER_W = MARKER_W;
export const LOST_MARKER_H = MARKER_H;
export const LOST_PIN_W = PIN_W;
export const LOST_PIN_H = PIN_H;

const SIGHTING_COLOR = "#22C55E";
const LOST_COLOR = "#EF4444";

function timeAgo(ts: number): string {
  const minutes = Math.floor((Date.now() - ts) / 60000);
  if (minutes < 1) return "Сега";
  if (minutes < 60) return `Преди ${minutes}м`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Преди ${hours}ч`;
  return `Преди ${Math.floor(hours / 24)} д`;
}

type Props = {
  marker: SightingMarker | LostMarker;
  zoom: "full" | "pin" | "dot";
  variant?: "sighting" | "lost";
};

export default function PetMarker({
  marker,
  zoom,
  variant = "sighting",
}: Props) {
  if (variant === "lost") return <LostPetMarker marker={marker} zoom={zoom} />;
  return <SightingPetMarker marker={marker as SightingMarker} zoom={zoom} />;
}

function SightingPetMarker({
  marker,
  zoom,
}: {
  marker: SightingMarker;
  zoom: "full" | "pin" | "dot";
}) {
  if (zoom === "dot") return <View style={s.dot} />;

  if (zoom === "pin") {
    return (
      <View style={s.pinWrap}>
        <View style={s.pinCircle} />
        <View style={s.pinPointer} />
      </View>
    );
  }

  return (
    <View style={s.wrap}>
      <View style={s.ring}>
        <Image source={{ uri: marker.imageUri }} style={s.img} />
      </View>
      <View style={s.pill}>
        <Text style={s.pillText}>{timeAgo(marker.createdAt)}</Text>
      </View>
      <View style={s.pointer} />
    </View>
  );
}

function LostPetMarker({
  marker,
  zoom,
}: {
  marker: SightingMarker | LostMarker;
  zoom: "full" | "pin" | "dot";
}) {
  if (zoom === "dot") return <View style={l.dot} />;

  if (zoom === "pin") {
    return (
      <View style={l.pinWrap}>
        <View style={l.pinSquare} />
        <View style={l.pinPointer} />
      </View>
    );
  }

  return (
    <View style={l.wrap}>
      <View style={l.badge}>
        <Text style={l.badgeText}>!</Text>
      </View>
      <View style={l.ring}>
        <Image source={{ uri: marker.imageUri }} style={l.img} />
      </View>
      <View style={l.pill}>
        <Text style={l.pillText}>Търси се</Text>
      </View>
      <View style={l.pointer} />
    </View>
  );
}

const s = StyleSheet.create({
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: SIGHTING_COLOR,
    borderWidth: 2,
    borderColor: "#fff",
  },
  pinWrap: { width: PIN_W },
  pinCircle: {
    width: PIN_CIRCLE,
    height: PIN_CIRCLE,
    borderRadius: PIN_CIRCLE / 2,
    backgroundColor: SIGHTING_COLOR,
    borderWidth: 2.5,
    borderColor: "#fff",
    marginLeft: PIN_PAD,
  },
  pinPointer: {
    marginLeft: PIN_PAD + (PIN_CIRCLE - 10) / 2,
    marginTop: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: SIGHTING_COLOR,
  },
  wrap: { width: W },
  ring: {
    width: C,
    height: C,
    borderRadius: C / 2,
    backgroundColor: SIGHTING_COLOR,
    marginLeft: PAD,
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: INNER,
    height: INNER,
    borderRadius: INNER / 2,
  },
  pill: {
    width: C,
    marginLeft: PAD,
    marginTop: -12,
    backgroundColor: SIGHTING_COLOR,
    borderRadius: 10,
    paddingVertical: 3,
    alignItems: "center",
  },
  pillText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  pointer: {
    marginLeft: PAD + (C - 14) / 2,
    marginTop: 3,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: SIGHTING_COLOR,
  },
});

const l = StyleSheet.create({
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: 3,
    backgroundColor: LOST_COLOR,
    borderWidth: 2,
    borderColor: "#fff",
  },
  pinWrap: { width: PIN_W },
  pinSquare: {
    width: PIN_CIRCLE,
    height: PIN_CIRCLE,
    borderRadius: 7,
    backgroundColor: LOST_COLOR,
    borderWidth: 2.5,
    borderColor: "#fff",
    marginLeft: PIN_PAD,
  },
  pinPointer: {
    marginLeft: PIN_PAD + (PIN_CIRCLE - 10) / 2,
    marginTop: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: LOST_COLOR,
  },
  wrap: { width: W },
  badge: {
    position: "absolute",
    top: -(BADGE / 2),
    right: PAD - 2,
    width: BADGE,
    height: BADGE,
    borderRadius: BADGE / 2,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: LOST_COLOR,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    elevation: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: LOST_COLOR,
    lineHeight: 14,
  },
  ring: {
    width: C,
    height: C,
    borderRadius: 14,
    backgroundColor: LOST_COLOR,
    marginLeft: PAD,
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: INNER,
    height: INNER,
    borderRadius: 10,
  },
  pill: {
    width: C,
    marginLeft: PAD,
    marginTop: -12,
    backgroundColor: LOST_COLOR,
    borderRadius: 10,
    paddingVertical: 3,
    alignItems: "center",
  },
  pillText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  pointer: {
    marginLeft: PAD + (C - 14) / 2,
    marginTop: 3,
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: LOST_COLOR,
  },
});
