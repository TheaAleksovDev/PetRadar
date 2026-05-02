import * as Location from "expo-location";
import { ArrowLeft, Xmark } from "iconoir-react-native";
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
import { timeAgo } from "../utils";
import type { SightingMarker } from "../types";
import BottomSheet from "../shared/BottomSheet";

const CELL_W = (Dimensions.get("window").width - 16 * 2 - 12) / 2;


function formatAddress(geo: Location.LocationGeocodedAddress): string {
  const parts: string[] = [];
  if (geo.street)
    parts.push(
      geo.streetNumber ? `${geo.street} ${geo.streetNumber}` : geo.street,
    );
  if (geo.district) parts.push(geo.district);
  if (parts.length === 0 && geo.city) parts.push(geo.city);
  return parts.join(", ") || "Неизвестно";
}

type Props = {
  visible: boolean;
  matches: SightingMarker[];
  onSelect: (marker: SightingMarker) => void;
  onDismiss: () => void;
  onBack?: () => void;
};

export default function SightingMatchModal({
  visible,
  matches,
  onSelect,
  onDismiss,
  onBack,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [preview, setPreview] = useState<SightingMarker | null>(null);
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
      <Modal
        visible={!!preview}
        transparent
        animationType="fade"
        onRequestClose={() => setPreview(null)}
      >
        <TouchableOpacity
          style={styles.previewOverlay}
          activeOpacity={1}
          onPress={() => setPreview(null)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.previewCard}>
              <TouchableOpacity
                style={styles.previewClose}
                onPress={() => setPreview(null)}
                activeOpacity={0.7}
              >
                <Xmark width={18} height={18} color="#6C6C70" strokeWidth={2} />
              </TouchableOpacity>
              <Image
                source={{ uri: preview?.imageUri }}
                style={styles.previewImage}
              />
              <ScrollView contentContainerStyle={styles.previewRows}>
                <Text style={styles.previewBreed}>{preview?.breed}</Text>
                {[
                  ["Цвят", preview?.color],
                  ["Възраст", preview?.age],
                  ["Забелязан", preview ? timeAgo(preview.createdAt) : ""],
                  ["Локация", previewLocation],
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

            {onBack && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={onBack}
                activeOpacity={0.7}
              >
                <ArrowLeft
                  width={18}
                  height={18}
                  color="#16A34A"
                  strokeWidth={2}
                />
                <Text style={styles.backBtnText}>Назад</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.title}>Хора са го виждали!</Text>
            <Text style={styles.subtitle}>
              Тези любимци са забелязани наблизо. Ако е същия — помогни ни да
              проследим пътя му!
            </Text>

            <FlatList
              data={matches}
              keyExtractor={(m) => m.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.grid}
              style={{ flex: 1 }}
              scrollEnabled
              renderItem={({ item }) => {
                const isSelected = item.id === selected;
                return (
                  <TouchableOpacity
                    style={[styles.cell, isSelected && styles.cellSelected]}
                    onPress={() => setSelected(isSelected ? null : item.id)}
                    activeOpacity={0.85}
                  >
                    {isSelected && (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkText}>✓</Text>
                      </View>
                    )}
                    <View>
                      <Image
                        source={{ uri: item.imageUri }}
                        style={styles.cellImage}
                      />
                      <TouchableOpacity
                        style={styles.viewBtn}
                        onPress={() => setPreview(item)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.viewBtnText}>Виж</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.cellBreed} numberOfLines={1}>
                      {item.breed}
                    </Text>
                    <Text style={styles.cellColor} numberOfLines={1}>
                      {item.color}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.dismissBtn}
                onPress={handleDismiss}
                activeOpacity={0.8}
              >
                <Text style={styles.dismissBtnText}>Не е същото</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  !selected && styles.confirmBtnDisabled,
                ]}
                onPress={handleConfirm}
                disabled={!selected}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmBtnText}>Това е то!</Text>
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
    flex: 1,
    overflow: "hidden",
    paddingBottom: 36,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  backBtnText: {
    fontSize: 14,
    color: "#16A34A",
    fontWeight: "600",
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
    borderColor: "#16A34A",
  },
  checkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 1,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#16A34A",
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
  cellBreed: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1C1C1E",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 2,
  },
  cellColor: {
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
    backgroundColor: "#16A34A",
  },
  confirmBtnDisabled: {
    backgroundColor: "#86EFAC",
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
  previewBreed: {
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
