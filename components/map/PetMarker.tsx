import { Image, StyleSheet, Text, View } from "react-native";
import type { SightingMarker } from "./types";

const C = 64;
const INNER = C - 8;
const PAD = 4;
const W = C + PAD * 2;
const COLOR = "#22C55E";

const PIN_CIRCLE = 28;
const PIN_PAD = 3;

export const MARKER_W = W;
export const MARKER_H = C + 102;
export const PIN_W = PIN_CIRCLE + PIN_PAD * 2;
export const PIN_H = PIN_CIRCLE + 2 + 8; // circle + gap + triangle
export const DOT_SIZE = 12;

function timeAgo(ts: number): string {
  const minutes = Math.floor((Date.now() - ts) / 60000);
  if (minutes < 1) return "Сега";
  if (minutes < 60) return `Преди ${minutes}м`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Преди ${hours}м`;
  return `Преди ${Math.floor(hours / 24)} дена`;
}

type Props = { marker: SightingMarker; zoom: "full" | "pin" | "dot" };

export default function PetMarker({ marker, zoom }: Props) {
  if (zoom === "dot") {
    return <View style={styles.dot} />;
  }

  if (zoom === "pin") {
    return (
      <View style={styles.pinWrap}>
        <View style={styles.pinCircle} />
        <View style={styles.pinPointer} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.ring}>
        <Image source={{ uri: marker.imageUri }} style={styles.img} />
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{timeAgo(marker.createdAt)}</Text>
      </View>
      <View style={styles.pointer} />
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: COLOR,
    borderWidth: 2,
    borderColor: "#fff",
  },
  pinWrap: {
    width: PIN_W,
  },
  pinCircle: {
    width: PIN_CIRCLE,
    height: PIN_CIRCLE,
    borderRadius: PIN_CIRCLE / 2,
    backgroundColor: COLOR,
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
    borderTopColor: COLOR,
  },
  wrap: {
    width: W,
  },
  ring: {
    width: C,
    height: C,
    borderRadius: C / 2,
    backgroundColor: COLOR,
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
    backgroundColor: COLOR,
    borderRadius: 10,
    paddingVertical: 3,
    alignItems: "center",
  },
  pillText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
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
    borderTopColor: COLOR,
  },
});
