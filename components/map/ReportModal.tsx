import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Dropdown from "./Dropdown";
import LocationPicker from "./LocationPicker";
import { AGES, BREEDS, COLORS } from "./constants";
import type { Coords } from "./types";

type Form = { color: string; breed: string; age: string };

type Props = {
  visible: boolean;
  form: Form;
  sightingLocation: Coords;
  userLocation: Coords;
  pickerVisible: boolean;
  onClose: () => void;
  onFormChange: (field: keyof Form, value: string) => void;
  onOpenPicker: () => void;
  onClosePicker: () => void;
  onConfirmLocation: (coords: Coords) => void;
  onResetLocation: () => void;
  onSubmit: () => void;
};

export default function ReportModal({
  visible,
  form,
  sightingLocation,
  userLocation,
  pickerVisible,
  onClose,
  onFormChange,
  onOpenPicker,
  onClosePicker,
  onConfirmLocation,
  onResetLocation,
  onSubmit,
}: Props) {
  const isFormComplete = form.color && form.breed && form.age;
  const isCustomLocation =
    sightingLocation.latitude !== userLocation.latitude ||
    sightingLocation.longitude !== userLocation.longitude;

  return (
    <>
      <LocationPicker
        visible={pickerVisible}
        initialCoords={sightingLocation}
        onConfirm={onConfirmLocation}
        onClose={onClosePicker}
      />

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.backBtn}>
                <Text style={styles.backIcon}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Забелязах любимец</Text>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
              <View style={styles.formCard}>
                <Dropdown
                  label="Цвят"
                  options={COLORS}
                  value={form.color}
                  onChange={(v) => onFormChange("color", v)}
                />
                <View style={styles.divider} />
                <Dropdown
                  label="Порода"
                  options={BREEDS}
                  value={form.breed}
                  onChange={(v) => onFormChange("breed", v)}
                />
                <View style={styles.divider} />
                <Dropdown
                  label="Възраст"
                  options={AGES}
                  value={form.age}
                  onChange={(v) => onFormChange("age", v)}
                />
              </View>

              <View style={styles.locationCard}>
                <View style={styles.locationRow}>
                  <View style={styles.locationLeft}>
                    <Text style={styles.locationLabel}>Къде е забелязано?</Text>
                    <Text style={styles.locationValue}>
                      {isCustomLocation ? "Избрана локация" : "Текущата ми локация"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.changeBtn}
                    onPress={onOpenPicker}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.changeBtnText}>Промени</Text>
                  </TouchableOpacity>
                </View>
                {isCustomLocation && (
                  <TouchableOpacity
                    onPress={onResetLocation}
                    style={styles.resetBtn}
                  >
                    <Text style={styles.resetBtnText}>
                      ↩ Върни към текущата ми локация
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.postBtn, !isFormComplete && styles.postBtnDisabled]}
              onPress={onSubmit}
              disabled={!isFormComplete}
              activeOpacity={0.85}
            >
              <Text style={styles.postBtnText}>Публикувай</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#F2F2F7",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    fontSize: 30,
    color: "#2563EB",
    lineHeight: 34,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  body: { paddingHorizontal: 16 },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E5EA",
    marginLeft: 16,
  },
  locationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  locationLeft: { flex: 1, gap: 2 },
  locationLabel: {
    fontSize: 13,
    color: "#AEAEB2",
    fontWeight: "500",
  },
  locationValue: {
    fontSize: 15,
    color: "#1C1C1E",
    fontWeight: "500",
  },
  changeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
  },
  changeBtnText: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
  },
  resetBtn: {
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5EA",
  },
  resetBtnText: {
    fontSize: 13,
    color: "#2563EB",
  },
  postBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  postBtnDisabled: { backgroundColor: "#93C5FD" },
  postBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
