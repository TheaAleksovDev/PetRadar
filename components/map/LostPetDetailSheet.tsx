import { ChatLines, Expand, MapPin, Phone, RefreshDouble, ShareAndroid, Xmark } from "iconoir-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Linking,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LeaveCommentModal from "./LeaveCommentModal";
import type { Comment, Coords, LostMarker } from "./types";
import { haversineKm, formatDistance } from "./utils";
import TimeTag from "./TimeTag";

const SHEET_HEIGHT = 600;
const LOST_COLOR = "#EF4444";

type Props = {
  marker: LostMarker | null;
  userLocation: Coords;
  onClose: () => void;
  onSubmitComment?: (markerId: string, comment: string, location: Coords | null) => void;
  isOwner?: boolean;
  onMarkFound?: () => void;
  onReopen?: () => void;
};

export default function LostPetDetailSheet({ marker, userLocation, onClose, onSubmitComment, isOwner, onMarkFound, onReopen }: Props) {
  const [commentVisible, setCommentVisible] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (marker) {
      setComments(marker.comments ?? []);
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

  const handleCall = () => Linking.openURL(`tel:${marker.phone}`);

  const handleShare = () =>
    Share.share({
      message: `Търси се ${marker.name} — ${marker.breed} (${marker.color}), ${marker.age}.\n на собственика: ${marker.phone}${marker.note ? `\n${marker.note}` : ""}`,
    });

  const handleCommentSubmit = (comment: string, location: Coords | null) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      comment,
      location: location ?? undefined,
      createdAt: Date.now(),
    };
    setComments((prev) => [...prev, newComment]);
    setCommentVisible(false);
    onSubmitComment?.(marker.id, comment, location);
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
                <Text style={styles.name} numberOfLines={1}>{marker.name}</Text>
                <View style={[styles.badge, marker.isFound && styles.badgeFound]}>
                  <Text style={[styles.badgeText, marker.isFound && styles.badgeFoundText]}>
                    {marker.isFound ? "НАМЕРЕН" : "ТЪРСИ СЕ"}
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.content}>
                <TouchableOpacity onPress={() => setFullscreen(true)} activeOpacity={0.85}>
                  <Image source={{ uri: marker.imageUri }} style={styles.image} />
                  <View style={styles.expandBtn}>
                    <Expand width={14} height={14} color="#fff" strokeWidth={2} />
                  </View>
                </TouchableOpacity>
                <View style={styles.info}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Порода</Text>
                    <Text style={styles.infoValue} numberOfLines={2}>{marker.breed}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Цвят</Text>
                    <Text style={styles.infoValue}>{marker.color}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Възраст</Text>
                    <Text style={styles.infoValue} numberOfLines={2}>{marker.age}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Обявено</Text>
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

              <View style={styles.actions}>
                {isOwner && marker?.isFound ? (
                  <TouchableOpacity style={styles.reopenBtn} onPress={onReopen} activeOpacity={0.8}>
                    <View style={styles.actionBtnRow}>
                      <RefreshDouble width={18} height={18} color="#1C1C1E" strokeWidth={1.8} />
                      <Text style={[styles.callBtnText, { color: "#1C1C1E" }]}>Отвори отново</Text>
                    </View>
                  </TouchableOpacity>
                ) : isOwner ? (
                  <TouchableOpacity style={styles.foundBtn} onPress={onMarkFound} activeOpacity={0.8}>
                    <Text style={styles.callBtnText}>Отбележи като намерен</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.callBtn} onPress={handleCall} activeOpacity={0.8}>
                    <View style={styles.actionBtnRow}>
                      <Phone width={18} height={18} color="#fff" strokeWidth={1.8} />
                      <Text style={styles.callBtnText}>Обади се</Text>
                    </View>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.iconBtn} onPress={() => setCommentVisible(true)} activeOpacity={0.8}>
                  <ChatLines width={18} height={18} color="#fff" strokeWidth={1.8} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn} onPress={handleShare} activeOpacity={0.8}>
                  <ShareAndroid width={18} height={18} color="#fff" strokeWidth={2} />
                </TouchableOpacity>
              </View>

              {comments.length > 0 && (
                <View style={styles.tipsSection}>
                  <Text style={styles.tipsSectionLabel}>Коментари ({comments.length})</Text>
                  {comments.map((c) => (
                    <View key={c.id} style={styles.tipCard}>
                      <View style={styles.tipRow}>
                        <Text style={styles.tipComment}>{c.comment}</Text>
                        <TimeTag ts={c.createdAt} fontSize={11} />
                      </View>
                      {c.location && (
                        <TouchableOpacity
                          style={styles.tipLocationRow}
                          onPress={() =>
                            Linking.openURL(
                              `https://maps.google.com/maps?q=${c.location!.latitude},${c.location!.longitude}`
                            )
                          }
                          activeOpacity={0.7}
                        >
                          <MapPin width={12} height={12} color="#2563EB" strokeWidth={1.8} />
                          <Text style={styles.tipLocationText}>Виж локацията</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>

        <LeaveCommentModal
          visible={commentVisible}
          userLocation={userLocation}
          onSubmit={handleCommentSubmit}
          onClose={() => setCommentVisible(false)}
        />
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
  badgeFound: {
    backgroundColor: "#DCFCE7",
    borderColor: "#86EFAC",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: LOST_COLOR,
    letterSpacing: 0.5,
  },
  badgeFoundText: {
    color: "#16A34A",
  },
  scroll: { flexShrink: 1 },
  scrollContent: { paddingBottom: 36 },
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
  foundBtn: {
    flex: 1,
    backgroundColor: "#22C55E",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  reopenBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#1C1C1E",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
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
  iconBtn: {
    width: 50,
    backgroundColor: "#1C1C1E",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  tipsSection: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  tipsSectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#AEAEB2",
    marginBottom: 2,
  },
  tipCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 14,
    padding: 12,
    gap: 6,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  tipComment: {
    flex: 1,
    fontSize: 14,
    color: "#1C1C1E",
    lineHeight: 20,
  },
  tipTime: {
    fontSize: 12,
    color: "#AEAEB2",
    flexShrink: 0,
    marginTop: 2,
  },
  tipLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tipLocationText: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "500",
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
