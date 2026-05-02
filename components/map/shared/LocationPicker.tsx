import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import type { Coords } from "../types";

type Props = {
  visible: boolean;
  initialCoords: Coords;
  onConfirm: (coords: Coords) => void;
  onClose: () => void;
};

export default function LocationPicker({
  visible,
  initialCoords,
  onConfirm,
  onClose,
}: Props) {
  const [pendingCoords, setPendingCoords] = useState<Coords>(initialCoords);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (visible) setPendingCoords(initialCoords);
  }, [visible, initialCoords]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Къде е забелязано?</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.mapWrapper}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              ...initialCoords,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
            onRegionChange={() => setDragging(true)}
            onRegionChangeComplete={(r) => {
              setDragging(false);
              setPendingCoords({ latitude: r.latitude, longitude: r.longitude });
            }}
          />

          <View style={styles.pinWrapper} pointerEvents="none">
            <Text style={[styles.pinEmoji, dragging && styles.pinLifted]}>
              📍
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.hint}>
            Премести картата, за да зададеш точното място
          </Text>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => onConfirm(pendingCoords)}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmText}>Потвърди локацията</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: "#fff",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 32,
    color: "#2563EB",
    lineHeight: 36,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  mapWrapper: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  pinWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  pinEmoji: { fontSize: 40 },
  pinLifted: { transform: [{ translateY: -8 }] },
  footer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 8,
  },
  hint: {
    fontSize: 13,
    color: "#AEAEB2",
    textAlign: "center",
    marginBottom: 12,
  },
  confirmBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
