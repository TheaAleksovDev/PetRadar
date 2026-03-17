import { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { SightingMarker } from "./types";

type Props = {
  visible: boolean;
  matches: SightingMarker[];
  onSelect: (marker: SightingMarker) => void;
  onDismiss: () => void;
};

export default function SightingMatchModal({ visible, matches, onSelect, onDismiss }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleConfirm = () => {
    const match = matches.find((m) => m.id === selected);
    if (match) onSelect(match);
  };

  const handleDismiss = () => {
    setSelected(null);
    onDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.handle} />

          <Text style={styles.title}>Хора са го виждали!</Text>
          <Text style={styles.subtitle}>
            Тези кучета са забелязани наблизо. Ако е същото — помогни ни да проследим пътя му!
          </Text>

          <FlatList
            data={matches}
            keyExtractor={(m) => m.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
            scrollEnabled={matches.length > 4}
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
                  <Image source={{ uri: item.imageUri }} style={styles.cellImage} />
                  <Text style={styles.cellBreed} numberOfLines={1}>{item.breed}</Text>
                  <Text style={styles.cellColor} numberOfLines={1}>{item.color}</Text>
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
              style={[styles.confirmBtn, !selected && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={!selected}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnText}>Това е то!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#F2F2F7",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    maxHeight: "85%",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D1D6",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 18,
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
    flex: 1,
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
});
