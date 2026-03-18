import { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Location from "expo-location";
import { Xmark } from "iconoir-react-native";
import type { LostMarker } from "./types";
import BottomSheet from "./BottomSheet";

const CELL_W = (Dimensions.get("window").width - 16 * 2 - 12) / 2;

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "Току-що";
  if (diff < 3600) return `Преди ${Math.floor(diff / 60)}м.`;
  if (diff < 86400) return `Преди ${Math.floor(diff / 3600)}ч.`;
  return `Преди ${Math.floor(diff / 86400)}д.`;
}

function formatAddress(geo: Location.LocationGeocodedAddress): string {
  const parts: string[] = [];
  if (geo.street) parts.push(geo.streetNumber ? `${geo.street} ${geo.streetNumber}` : geo.street);
  if (geo.district) parts.push(geo.district);
  if (parts.length === 0 && geo.city) parts.push(geo.city);
  return parts.join(", ") || "Неизвестно";
}

type Props = {
  visible: boolean;
  matches: LostMarker[];
  onSelect: (marker: LostMarker) => void;
  onDismiss: () => void;
};

export default function MatchModal({ visible, matches, onSelect, onDismiss }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [preview, setPreview] = useState<LostMarker | null>(null);
  const [previewLocation, setPreviewLocation] = useState("...");

  useEffect(() => {
    if (!preview) return;
    setPreviewLocation("...");
    Location.reverseGeocodeAsync(preview.coordinate).then((res) => {
      setPreviewLocation(res[0] ? formatAddress(res[0]) : "Неизвестно");
    });
  }, [preview?.id]);

  const handleConfirm = () => {
    const match = matches.find((m) => m.id === selected);
    if (match) onSelect(match);
  };

  const handleDismiss = () => {
    setSelected(null);
    onDismiss();
  };

  return (
    <>
      <Modal visible={!!preview} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
        <TouchableOpacity style={styles.previewOverlay} activeOpacity={1} onPress={() => setPreview(null)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.previewCard}>
              <TouchableOpacity style={styles.previewClose} onPress={() => setPreview(null)} activeOpacity={0.7}>
                <Xmark width={18} height={18} color="#6C6C70" strokeWidth={2} />
              </TouchableOpacity>
              <Image source={{ uri: preview?.imageUri }} style={styles.previewImage} />
              <ScrollView contentContainerStyle={styles.previewRows}>
                <Text style={styles.previewName}>{preview?.name}</Text>
                {[
                  ["Порода", preview?.breed],
                  ["Цвят", preview?.color],
                  ["Възраст", preview?.age],
                  ["Телефон", preview?.phone],
                  ["Локация", previewLocation],
                  ["Обявено", preview ? timeAgo(preview.createdAt) : ""],
                  ...(preview?.note ? [["Бележка", preview.note]] : []),
                ].map(([label, value]) => (
                  <View key={label} style={styles.previewRow}>
                    <Text style={styles.previewLabel}>{label}</Text>
                    <Text style={styles.previewValue}>{value}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <BottomSheet visible={visible} onClose={handleDismiss} maxHeight="85%">
          <View style={styles.card}>
            <Text style={styles.title}>Познаваш ли го?</Text>
            <Text style={styles.subtitle}>
              Тези кучета са обявени за изгубени наблизо. Видя ли някое от тях?
            </Text>

            <FlatList
              data={matches}
              keyExtractor={(m) => m.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.grid}
              scrollEnabled
              renderItem={({ item }) => {
                const isSelected = item.id === selected;
                return (
                  <TouchableOpacity
                    style={[styles.cell, isSelected && styles.cellSelected]}
                    onPress={() => setSelected(isSelected ? null : item.id)}
                    activeOpacity={0.85}
                  >
                    {isSelected && <View style={styles.checkBadge}><Text style={styles.checkText}>✓</Text></View>}
                    <View>
                      <Image source={{ uri: item.imageUri }} style={styles.cellImage} />
                      <TouchableOpacity style={styles.viewBtn} onPress={() => setPreview(item)} activeOpacity={0.8}>
                        <Text style={styles.viewBtnText}>Виж</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cellName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.cellBreed} numberOfLines={1}>{item.breed}</Text>
                  </TouchableOpacity>
                );
              }}
            />

            <View style={styles.actions}>
              <TouchableOpacity style={styles.dismissBtn} onPress={handleDismiss} activeOpacity={0.8}>
                <Text style={styles.dismissBtnText}>Не виждам моя</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, !selected && styles.confirmBtnDisabled]}
                onPress={handleConfirm}
                disabled={!selected}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmBtnText}>Намерих го!</Text>
              </TouchableOpacity>
            </View>
          </View>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F2F2F7",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    maxHeight: "85%",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    textAlign: "center",
    marginBottom: 6,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 14,
    color: "#6C6C70",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  grid: {
    paddingHorizontal: 16,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  cell: {
    width: CELL_W,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  cellSelected: {
    borderColor: "#2563EB",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  cellImage: {
    width: "100%",
    aspectRatio: 1,
  },
  viewBtn: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewBtnText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  cellName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1C1C1E",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 2,
  },
  cellBreed: {
    fontSize: 12,
    color: "#AEAEB2",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 8,
  },
  dismissBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#E5E5EA",
  },
  dismissBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#2563EB",
  },
  confirmBtnDisabled: {
    backgroundColor: "#93C5FD",
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  previewCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    width: 300,
  },
  previewClose: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: 180,
  },
  previewRows: {
    padding: 16,
    gap: 8,
  },
  previewName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  previewLabel: {
    fontSize: 13,
    color: "#AEAEB2",
    fontWeight: "500",
  },
  previewValue: {
    fontSize: 13,
    color: "#1C1C1E",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginLeft: 8,
  },
});
