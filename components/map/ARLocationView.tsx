import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { Accelerometer } from "expo-sensors";
import { NavArrowLeft } from "iconoir-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Coords, LostMarker, SightingMarker } from "./types";

type Props = {
  lostMarkers: LostMarker[];
  sightings: SightingMarker[];
  userLocation: Coords;
  onSelectLost: (m: LostMarker) => void;
  onSelectSighting: (m: SightingMarker) => void;
  onClose: () => void;
};

type ARMarker =
  | { kind: "lost"; data: LostMarker }
  | { kind: "sighting"; data: SightingMarker };

const { width: SW, height: SH } = Dimensions.get("window");
const FOV = 60;
const MAX_DIST_KM = 2;

function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) *
      Math.cos((b.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function bearing(from: Coords, to: Coords): number {
  const lat1 = (from.latitude * Math.PI) / 180;
  const lat2 = (to.latitude * Math.PI) / 180;
  const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function formatDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}м` : `${km.toFixed(1)}км`;
}

export default function ARLocationView({
  lostMarkers,
  sightings,
  userLocation,
  onSelectLost,
  onSelectSighting,
  onClose,
}: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [heading, setHeading] = useState(0);
  const [pitch, setPitch] = useState(0); // device tilt -90..90
  const [location, setLocation] = useState<Coords>(userLocation);
  const headingBuf = useRef<number[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const markerAnimsRef = useRef<Record<string, { x: Animated.Value; y: Animated.Value }>>({});

  // Compass
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    Location.watchHeadingAsync((h) => {
      const raw = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
      headingBuf.current.push(raw);
      if (headingBuf.current.length > 8) headingBuf.current.shift();
      const sinSum = headingBuf.current.reduce((s, h) => s + Math.sin((h * Math.PI) / 180), 0);
      const cosSum = headingBuf.current.reduce((s, h) => s + Math.cos((h * Math.PI) / 180), 0);
      const avg = ((Math.atan2(sinSum, cosSum) * 180) / Math.PI + 360) % 360;
      setHeading(avg);
    }).then((s) => { sub = s; });
    return () => { sub?.remove(); };
  }, []);

  // GPS
  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 2000, distanceInterval: 2 },
      (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
    ).then((s) => { sub = s; });
    return () => { sub?.remove(); };
  }, []);

  // Accelerometer for pitch
  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      const p = Math.atan2(-y, Math.sqrt(x * x + z * z)) * (180 / Math.PI);
      setPitch(p);
    });
    return () => sub.remove();
  }, []);

  // Pulsing animation
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  if (!permission) return null;
  if (!permission.granted) {
    return (
      <Modal visible animationType="fade" statusBarTranslucent onRequestClose={onClose}>
        <View style={styles.permScreen}>
          <Text style={styles.permText}>AR изисква достъп до камерата</Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Разреши достъп</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 12 }}>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Назад</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  // Build marker list
  const allMarkers: ARMarker[] = [
    ...lostMarkers.map((m): ARMarker => ({ kind: "lost", data: m })),
    ...sightings.map((m): ARMarker => ({ kind: "sighting", data: m })),
  ];

  // Compute screen positions
  const positioned = allMarkers
    .map((marker) => {
      const km = haversineKm(location, marker.data.coordinate);
      if (km > MAX_DIST_KM) return null;
      const b = bearing(location, marker.data.coordinate);
      const angleDiff = ((b - heading + 540) % 360) - 180;
      const x = SW / 2 + angleDiff * (SW / FOV);
      // Vertical: center of screen adjusted by device pitch
      // pitch=0 (flat phone) → marker at screen center
      // pitch=90 (upright) → marker near horizon (upper half)
      const pitchOffset = (pitch - 60) * (SH / 90); // 60° is roughly upright
      const y = SH / 2 - pitchOffset;
      const inFOV = Math.abs(angleDiff) < FOV / 2;
      // Scale by distance: 50m → big, 2km → small
      const scale = Math.max(0.45, 1 - km / MAX_DIST_KM * 0.6);
      return { marker, km, x, y, angleDiff, inFOV, scale };
    })
    .filter(Boolean) as NonNullable<ReturnType<typeof positioned[0]>>[];

  const inView = positioned.filter((p) => p.inFOV);
  const offLeft = positioned.filter((p) => !p.inFOV && p.angleDiff < 0);
  const offRight = positioned.filter((p) => !p.inFOV && p.angleDiff > 0);

  // Spring-animate each marker to its new screen position
  inView.forEach(({ marker, x, y, scale }) => {
    const id = marker.data.id;
    const cardW = 130 * scale;
    const cardH = 56 * scale;
    const targetLeft = x - cardW / 2;
    const targetTop = Math.max(80, Math.min(SH - 180, y)) - cardH - 32;
    if (!markerAnimsRef.current[id]) {
      markerAnimsRef.current[id] = {
        x: new Animated.Value(targetLeft),
        y: new Animated.Value(targetTop),
      };
    } else {
      Animated.spring(markerAnimsRef.current[id].x, {
        toValue: targetLeft,
        useNativeDriver: false,
        tension: 50,
        friction: 12,
      }).start();
      Animated.spring(markerAnimsRef.current[id].y, {
        toValue: targetTop,
        useNativeDriver: false,
        tension: 50,
        friction: 12,
      }).start();
    }
  });

  return (
    <Modal visible animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.container}>
        <CameraView style={StyleSheet.absoluteFill} facing="back" />

        {/* In-view markers */}
        {inView.map(({ marker, km, x, y, scale }, i) => {
          const isLost = marker.kind === "lost";
          const name = isLost
            ? (marker.data as LostMarker).name
            : `${marker.data.breed}`;
          const color = isLost ? "#EF4444" : "#22C55E";
          const cardW = 130 * scale;
          const cardH = 56 * scale;

          const anim = markerAnimsRef.current[marker.data.id];
          return (
            <Animated.View
              key={marker.data.id}
              style={[
                styles.markerContainer,
                anim
                  ? { left: anim.x, top: anim.y }
                  : { left: x - cardW / 2, top: Math.max(80, Math.min(SH - 180, y)) - cardH - 32 },
              ]}
              pointerEvents="box-none"
            >
            <TouchableOpacity
              onPress={() => {
                onClose();
                if (isLost) onSelectLost(marker.data as LostMarker);
                else onSelectSighting(marker.data as SightingMarker);
              }}
              activeOpacity={0.85}
              style={{ alignItems: "center" }}
            >
              {/* 3D arrow pointing down */}
              <View style={[styles.arrowWrapper, { transform: [{ perspective: 400 }, { rotateX: "30deg" }] }]}>
                <View style={[styles.arrowShaft, { backgroundColor: color, width: 3 * scale, height: 24 * scale }]} />
                <View style={[
                  styles.arrowHead,
                  {
                    borderTopWidth: 10 * scale,
                    borderLeftWidth: 7 * scale,
                    borderRightWidth: 7 * scale,
                    borderTopColor: color,
                  }
                ]} />
              </View>

              {/* Card */}
              <Animated.View style={[
                styles.card,
                {
                  borderColor: color,
                  width: cardW,
                  transform: [{ scale: pulseAnim }],
                }
              ]}>
                <Image
                  source={{ uri: marker.data.imageUri }}
                  style={[styles.cardImg, { width: cardH, height: cardH }]}
                />
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardLabel, { color, fontSize: 9 * scale }]}>
                    {isLost ? "ТЪРСИ СЕ" : "ЗАБЕЛЯЗАН"}
                  </Text>
                  <Text style={[styles.cardName, { fontSize: 11 * scale }]} numberOfLines={1}>
                    {name}
                  </Text>
                  <Text style={[styles.cardDist, { fontSize: 10 * scale }]}>
                    📍 {formatDist(km)}
                  </Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Off-screen edge arrows */}
        {offLeft.length > 0 && (
          <View style={styles.edgeLeft}>
            <View style={[styles.edgeArrow, { transform: [{ rotate: "180deg" }] }]}>
              <Text style={styles.edgeArrowText}>▶</Text>
            </View>
            <Text style={styles.edgeCount}>{offLeft.length}</Text>
          </View>
        )}
        {offRight.length > 0 && (
          <View style={styles.edgeRight}>
            <View style={styles.edgeArrow}>
              <Text style={styles.edgeArrowText}>▶</Text>
            </View>
            <Text style={styles.edgeCount}>{offRight.length}</Text>
          </View>
        )}

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <NavArrowLeft width={22} height={22} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {positioned.length === 0
                ? "Няма любимци в 2км"
                : `${positioned.length} любим${positioned.length === 1 ? "ец" : "еца"} в 2км`}
            </Text>
          </View>
        </View>

        {/* Compass indicator */}
        <View style={styles.compass}>
          <Text style={styles.compassText}>{Math.round(heading)}°</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  markerContainer: {
    position: "absolute",
    alignItems: "center",
  },
  arrowWrapper: {
    alignItems: "center",
  },
  arrowShaft: {
    borderRadius: 2,
  },
  arrowHead: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.78)",
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
    alignItems: "center",
  },
  cardImg: { resizeMode: "cover" },
  cardInfo: { flex: 1, paddingHorizontal: 8, paddingVertical: 6, gap: 2 },
  cardLabel: { fontWeight: "700", letterSpacing: 0.4 },
  cardName: { color: "#fff", fontWeight: "700" },
  cardDist: { color: "rgba(255,255,255,0.65)" },

  edgeLeft: {
    position: "absolute",
    left: 12,
    top: "50%",
    alignItems: "center",
    gap: 4,
  },
  edgeRight: {
    position: "absolute",
    right: 12,
    top: "50%",
    alignItems: "center",
    gap: 4,
  },
  edgeArrow: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 8,
  },
  edgeArrowText: { color: "#fff", fontSize: 16 },
  edgeCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  topBar: {
    position: "absolute",
    top: 52,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center", justifyContent: "center",
  },
  badge: {
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  badgeText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  compass: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  compassText: { color: "#fff", fontSize: 13, fontWeight: "600" },

  permScreen: {
    flex: 1, backgroundColor: "#000",
    alignItems: "center", justifyContent: "center",
    gap: 16, paddingHorizontal: 32,
  },
  permText: { color: "#fff", fontSize: 16, textAlign: "center" },
  permBtn: {
    backgroundColor: "#2563EB", borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 32,
  },
  permBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
