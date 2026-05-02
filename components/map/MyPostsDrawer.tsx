import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BinFull, EditPencil } from "iconoir-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { LostMarker, SightingMarker } from "./types";
import TimeTag from "./shared/TimeTag";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.82;

type Tab = "all" | "seen" | "lost";

export type MyPostItem =
  | { kind: "seen"; marker: SightingMarker }
  | { kind: "lost"; marker: LostMarker };

type Props = {
  visible: boolean;
  onClose: () => void;
  myMarkers: MyPostItem[];
  onSelect: (
    kind: "seen" | "lost",
    marker: SightingMarker | LostMarker,
  ) => void;
  onEdit: (kind: "seen" | "lost", marker: SightingMarker | LostMarker) => void;
  onDelete: (
    kind: "seen" | "lost",
    marker: SightingMarker | LostMarker,
  ) => void;
};

export default function MyPostsDrawer({
  visible,
  onClose,
  myMarkers,
  onSelect,
  onEdit,
  onDelete,
}: Props) {
  const translateX = useRef(new Animated.Value(DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    if (visible) {
      translateX.setValue(DRAWER_WIDTH);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 200,
        }),
      ]).start();
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: DRAWER_WIDTH,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const items = myMarkers
    .filter(
      (item) =>
        tab === "all" || item.kind === (tab === "seen" ? "seen" : "lost"),
    )
    .sort((a, b) => b.marker.createdAt - a.marker.createdAt);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={dismiss}
    >
      <View style={styles.root}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.backdrop,
            { opacity: backdropOpacity },
          ]}
          pointerEvents="none"
        />
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={dismiss}
        />

        <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Моите публикации</Text>
            <Text style={styles.subtitle}>{myMarkers.length} общо</Text>
          </View>

          <View style={styles.tabs}>
            {(["all", "seen", "lost"] as Tab[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, tab === t && styles.tabActive]}
                onPress={() => setTab(t)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.tabText, tab === t && styles.tabTextActive]}
                >
                  {t === "all"
                    ? "Всички"
                    : t === "seen"
                      ? "Забелязани"
                      : "Изгубени"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {items.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="paw" size={40} color="#C7C7CC" />
              <Text style={styles.emptyText}>Нямаш публикации</Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => `${item.kind}-${item.marker.id}`}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isLost = item.kind === "lost";
                const m = item.marker;
                const found = m.isFound === true;
                const label = isLost
                  ? (m as LostMarker).name || m.breed
                  : m.breed;
                const sub = `${m.color} · ${m.breed}`;
                return (
                  <TouchableOpacity
                    style={[styles.card, found && styles.cardFound]}
                    activeOpacity={0.7}
                    onPress={() => onSelect(item.kind, m)}
                  >
                    {m.imageUri ? (
                      <Image
                        source={{ uri: m.imageUri }}
                        style={[styles.img, found && styles.imgFound]}
                      />
                    ) : (
                      <View
                        style={[
                          styles.img,
                          styles.imgPlaceholder,
                          found && styles.imgFound,
                        ]}
                      >
                        <MaterialCommunityIcons
                          name="paw"
                          size={24}
                          color="#C7C7CC"
                        />
                      </View>
                    )}
                    <View style={styles.info}>
                      <View style={styles.topRow}>
                        <Text
                          style={[styles.label, found && styles.labelFound]}
                          numberOfLines={1}
                        >
                          {label}
                        </Text>
                        {found ? (
                          <View style={styles.badgeFound}>
                            <Text style={styles.badgeFoundText}>НАМЕРЕН</Text>
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.badge,
                              isLost ? styles.badgeLost : styles.badgeSeen,
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeText,
                                isLost
                                  ? styles.badgeTextLost
                                  : styles.badgeTextSeen,
                              ]}
                            >
                              {isLost ? "ТЪРСИ СЕ" : "ЗАБЕЛЯЗАН"}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[styles.sub, found && styles.subFound]}
                        numberOfLines={1}
                      >
                        {sub}
                      </Text>
                      <View style={styles.metaRow}>
                        <TimeTag ts={m.createdAt} fontSize={11} />
                        <View style={styles.cardActions}>
                          {!found && (
                            <TouchableOpacity
                              onPress={() => onEdit(item.kind, m)}
                              activeOpacity={0.6}
                              hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
                            >
                              <EditPencil
                                width={13}
                                height={13}
                                color="#AEAEB2"
                                strokeWidth={1.8}
                              />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            onPress={() =>
                              Alert.alert(
                                "Изтрий публикация",
                                "Сигурен ли си, че искаш да изтриеш тази публикация?",
                                [
                                  { text: "Откажи", style: "cancel" },
                                  {
                                    text: "Изтрий",
                                    style: "destructive",
                                    onPress: () => onDelete(item.kind, m),
                                  },
                                ],
                              )
                            }
                            activeOpacity={0.6}
                            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                          >
                            <BinFull
                              width={13}
                              height={13}
                              color="#AEAEB2"
                              strokeWidth={1.8}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: "100%",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    paddingTop: 60,
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1C1C1E",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: "#AEAEB2",
    marginTop: 2,
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 3,
    gap: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6C6C70",
  },
  tabTextActive: {
    color: "#1C1C1E",
    fontWeight: "700",
  },
  list: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9F9FB",
    borderRadius: 14,
    padding: 10,
  },
  cardFound: {
    opacity: 0.55,
  },
  img: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  imgFound: {
    opacity: 0.7,
  },
  imgPlaceholder: {
    backgroundColor: "#E5E5EA",
    alignItems: "center",
    justifyContent: "center",
  },
  imgPlaceholderText: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#1C1C1E",
    textAlign: "center",
  },
  labelFound: {
    color: "#8E8E93",
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeSeen: {
    backgroundColor: "#DCFCE7",
  },
  badgeLost: {
    backgroundColor: "#FEE2E2",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  badgeTextSeen: {
    color: "#16A34A",
  },
  badgeTextLost: {
    color: "#DC2626",
  },
  badgeFound: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#E5E5EA",
  },
  badgeFoundText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
    color: "#6C6C70",
  },
  sub: {
    fontSize: 12,
    color: "#6C6C70",
  },
  subFound: {
    color: "#AEAEB2",
  },
  meta: {
    flex: 1,
    fontSize: 11,
    color: "#AEAEB2",
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardActions: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#AEAEB2",
    fontWeight: "500",
  },
});
