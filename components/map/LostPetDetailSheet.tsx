import { useEffect, useRef } from "react";
import { Phone, ShareAndroid } from "iconoir-react-native";
import {
  Animated,
  Image,
  Linking,
  Modal,
  PanResponder,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Coords, LostMarker } from "./types";

const SHEET_HEIGHT = 460;
const DRAG_THRESHOLD = 60;
const LOST_COLOR = "#EF4444";

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

function formatDistance(km: number): string {
  if (km < 1) return `На ${Math.round(km * 1000)}м. от теб`;
  return `На ${km.toFixed(1)}км. от теб`;
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "Току-що";
  if (diff < 3600) return `Преди ${Math.floor(diff / 60)}м.`;
  if (diff < 86400) return `Преди ${Math.floor(diff / 3600)}ч.`;
  return `Преди ${Math.floor(diff / 86400)}д.`;
}

type Props = {
  marker: LostMarker | null;
  userLocation: Coords;
  onClose: () => void;
};

export default function LostPetDetailSheet({
  marker,
  userLocation,
  onClose,
}: Props) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (marker) {
      translateY.setValue(SHEET_HEIGHT);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 220,
      }).start();
    }
  }, [marker?.id]);

  const dismiss = () => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onCloseRef.current());
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DRAG_THRESHOLD || g.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: SHEET_HEIGHT,
            duration: 220,
            useNativeDriver: true,
          }).start(() => onCloseRef.current());
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 220,
          }).start();
        }
      },
    }),
  ).current;

  if (!marker) return null;

  const km = haversineKm(userLocation, marker.coordinate);
  const dist = formatDistance(km);
  const time = timeAgo(marker.createdAt);

  const handleCall = () => Linking.openURL(`tel:${marker.phone}`);

  const handleShare = () =>
    Share.share({
      message: `Търси се ${marker.name} — ${marker.breed} (${marker.color}), ${marker.age}.\n на собственика: ${marker.phone}${marker.note ? `\n${marker.note}` : ""}`,
    });

  return (
    <Modal visible transparent animationType="none" onRequestClose={dismiss}>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={dismiss}
        />

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          {/* Drag zone */}
          <View {...panResponder.panHandlers}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.name} numberOfLines={1}>
                {marker.name}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>ТЪРСИ СЕ</Text>
              </View>
            </View>
          </View>

          {/* Image + info grid */}
          <View style={styles.content}>
            <Image source={{ uri: marker.imageUri }} style={styles.image} />
            <View style={styles.info}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Порода</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {marker.breed}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Цвят</Text>
                <Text style={styles.infoValue}>{marker.color}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Възраст</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {marker.age}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Обявено</Text>
                <Text style={styles.infoValue}>{time}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Разстояние</Text>
                <Text style={styles.infoValue} numberOfLines={2}>
                  {dist}
                </Text>
              </View>
            </View>
          </View>

          {/* Note */}
          {marker.note ? (
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>Бележка</Text>
              <Text style={styles.noteText}>{marker.note}</Text>
            </View>
          ) : null}

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.callBtn}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <View style={styles.actionBtnRow}>
                <Phone width={18} height={18} color="#fff" strokeWidth={1.8} />
                <Text style={styles.callBtnText}>Обади се</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <ShareAndroid width={18} height={18} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D1D6",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1C1E",
    flex: 1,
    marginRight: 10,
  },
  badge: {
    backgroundColor: "#FEE2E2",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: LOST_COLOR,
    letterSpacing: 0.5,
  },
  content: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 14,
    marginBottom: 14,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 14,
  },
  info: {
    flex: 1,
    backgroundColor: "#F9F9F9",
    borderRadius: 14,
    overflow: "hidden",
    paddingVertical: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  infoLabel: {
    fontSize: 12,
    color: "#AEAEB2",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 13,
    color: "#1C1C1E",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E5EA",
    marginHorizontal: 12,
  },
  noteBox: {
    marginHorizontal: 16,
    backgroundColor: "#F9F9F9",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    gap: 4,
  },
  noteLabel: {
    fontSize: 12,
    color: "#AEAEB2",
    fontWeight: "500",
  },
  noteText: {
    fontSize: 14,
    color: "#1C1C1E",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    marginHorizontal: 16,
    gap: 10,
  },
  actionBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  callBtn: {
    flex: 1,
    backgroundColor: LOST_COLOR,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  callBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  shareBtn: {
    width: 50,
    backgroundColor: "#1C1C1E",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
});
