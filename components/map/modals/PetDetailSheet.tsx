import { useEffect, useRef, useState } from "react";
import { Expand, ShareAndroid, Xmark } from "iconoir-react-native";
import {
  Animated,
  Image,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Coords, SightingMarker } from "../types";
import { haversineKm, formatDistance } from "../utils";
import TimeTag from "../shared/TimeTag";

const SHEET_HEIGHT = 420;


type Props = {
  marker: SightingMarker | null;
  userLocation: Coords;
  onClose: () => void;
  chain?: SightingMarker[];
  pathPinned?: boolean;
  onTogglePath?: (pinned: boolean) => void;
};

export default function PetDetailSheet({ marker, userLocation, onClose, chain, pathPinned, onTogglePath }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
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


  if (!marker) return null;

  const km = haversineKm(userLocation, marker.coordinate);
  const dist = formatDistance(km);
  const parents = chain && chain.length > 1 ? chain.slice(0, -1) : [];

  const handleShare = async () => {
    await Share.share({
      message: `Забелязан ${marker.breed} (${marker.color}) — ${dist}.${marker.note ? `\n${marker.note}` : ""}`,
    });
  };

  return (
    <>
      <Modal visible={fullscreen} transparent animationType="fade" onRequestClose={() => setFullscreen(false)}>
        <View style={styles.fsOverlay}>
          <Image source={{ uri: marker.imageUri }} style={styles.fsImage} resizeMode="contain" />
          <TouchableOpacity style={styles.fsClose} onPress={() => setFullscreen(false)} activeOpacity={0.8}>
            <Xmark width={20} height={20} color="#fff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible transparent animationType="none" onRequestClose={dismiss}>
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={dismiss} />
          <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
            <View>
              <View style={styles.handle} />
              <View style={styles.header}>
                <Text style={styles.breed} numberOfLines={1}>{marker.breed}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>ЗАБЕЛЯЗАН</Text>
                </View>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              <View style={styles.content}>
                <TouchableOpacity onPress={() => setFullscreen(true)} activeOpacity={0.85}>
                  <Image source={{ uri: marker.imageUri }} style={styles.image} />
                  <View style={styles.expandBtn}>
                    <Expand width={14} height={14} color="#fff" strokeWidth={2} />
                  </View>
                </TouchableOpacity>
                <View style={styles.info}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Цвят</Text>
                    <Text style={styles.infoValue}>{marker.color}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Възраст</Text>
                    <Text style={styles.infoValue}>{marker.age}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Кога</Text>
                    <TimeTag ts={marker.createdAt} color="#1C1C1E" fontSize={13} />
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Разстояние</Text>
                    <Text style={styles.infoValue} numberOfLines={2}>{dist}</Text>
                  </View>
                </View>
              </View>

              {marker.note ? (
                <View style={styles.noteBox}>
                  <Text style={styles.noteLabel}>Бележка</Text>
                  <Text style={styles.noteText}>{marker.note}</Text>
                </View>
              ) : null}

              {parents.length > 0 && (
                <View style={styles.pathSection}>
                  <View style={styles.pathHeader}>
                    <Text style={styles.pathLabel}>Маршрут ({chain!.length} засичания)</Text>
                    <TouchableOpacity
                      onPress={() => onTogglePath?.(!pathPinned)}
                      style={[styles.pinBtn, pathPinned && styles.pinBtnActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.pinBtnText}>
                        {pathPinned ? "Скрий" : "Покажи на картата"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {parents.map((item, i) => (
                    <View key={item.id} style={styles.pathItem}>
                      <View style={styles.pathDotCol}>
                        <View style={styles.pathDot} />
                        {i < parents.length - 1 && <View style={styles.pathLine} />}
                      </View>
                      <Image source={{ uri: item.imageUri }} style={styles.pathImage} />
                      <TimeTag ts={item.createdAt} fontSize={10} />
                    </View>
                  ))}
                  <View style={styles.pathItem}>
                    <View style={styles.pathDotCol}>
                      <View style={[styles.pathDot, styles.pathDotCurrent]} />
                    </View>
                    <Image source={{ uri: marker.imageUri }} style={styles.pathImage} />
                    <TimeTag ts={marker.createdAt} fontSize={10} />
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
                <View style={styles.shareBtnRow}>
                  <ShareAndroid width={16} height={16} color="#fff" strokeWidth={2} />
                  <Text style={styles.shareBtnText}>Сподели</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "88%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
  breed: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1C1C1E",
    flex: 1,
    marginRight: 10,
  },
  badge: {
    backgroundColor: "#DCFCE7",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A",
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingBottom: 36,
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
    borderRadius: 16,
  },
  expandBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
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
    paddingVertical: 9,
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
  pathSection: {
    marginHorizontal: 16,
    marginBottom: 14,
  },
  pathHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  pathLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#AEAEB2",
  },
  pinBtn: {
    backgroundColor: "#F59E0B",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pinBtnActive: {
    backgroundColor: "#1C1C1E",
  },
  pinBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  pathItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 4,
  },
  pathDotCol: {
    alignItems: "center",
    width: 12,
    paddingTop: 6,
  },
  pathDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F59E0B",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  pathDotCurrent: {
    backgroundColor: "#16A34A",
  },
  pathLine: {
    width: 2,
    flex: 1,
    minHeight: 24,
    backgroundColor: "#F59E0B",
    opacity: 0.4,
    marginTop: 2,
  },
  pathImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  pathTime: {
    flex: 1,
    fontSize: 13,
    color: "#6C6C70",
    paddingTop: 4,
  },
  shareBtn: {
    marginHorizontal: 16,
    backgroundColor: "#1C1C1E",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  shareBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  fsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  fsImage: {
    width: "100%",
    height: "100%",
  },
  fsClose: {
    position: "absolute",
    top: 52,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
