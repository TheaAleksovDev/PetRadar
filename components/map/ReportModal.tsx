import { NavArrowLeft, Undo } from "iconoir-react-native";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomSheet from "./BottomSheet";
import Dropdown from "./Dropdown";
import LocationPicker from "./LocationPicker";
import { CAT_AGES, CAT_BREEDS, COLORS, DOG_AGES, DOG_BREEDS } from "./constants";
import type { Coords } from "./types";

const SCREEN_WIDTH = Dimensions.get("window").width;

type Form = { color: string; breed: string; age: string; note: string; petType: string };

type Props = {
  visible: boolean;
  imageUri: string;
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
  imageUri,
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
  const petType = form.petType || "dog";
  const isFormComplete = form.color && form.breed && form.age;
  const isCustomLocation =
    sightingLocation.latitude !== userLocation.latitude ||
    sightingLocation.longitude !== userLocation.longitude;

  const breedOptions = petType === "cat" ? CAT_BREEDS : DOG_BREEDS;
  const ageOptions = petType === "cat" ? CAT_AGES : DOG_AGES;

  return (
    <>
      <LocationPicker
        visible={pickerVisible}
        initialCoords={sightingLocation}
        onConfirm={onConfirmLocation}
        onClose={onClosePicker}
      />

      <BottomSheet visible={visible} onClose={onClose} maxHeight="85%">
          <View style={styles.card}>
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.backBtn}>
                <NavArrowLeft width={26} height={26} color="#2563EB" strokeWidth={2} />
              </TouchableOpacity>
              <Text style={styles.title}>Забелязах любимец</Text>
              <View style={{ width: 36 }} />
            </View>

            <Image source={{ uri: imageUri }} style={styles.photo} />

            <ScrollView
              style={styles.body}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.petTypeCard}>
                <Text style={styles.petTypeLabel}>Вид животно</Text>
                <View style={styles.petTypePills}>
                  {([
                    { val: "dog", label: "Куче", emoji: "🐕" },
                    { val: "cat", label: "Коте", emoji: "🐱" },
                    { val: "other", label: "Друго", emoji: "🐾" },
                  ] as const).map(({ val, label, emoji }) => (
                    <TouchableOpacity
                      key={val}
                      style={[styles.petTypePill, petType === val && styles.petTypePillActive]}
                      onPress={() => {
                        onFormChange("petType", val);
                        onFormChange("breed", "");
                        onFormChange("age", "");
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.petTypeEmoji}>{emoji}</Text>
                      <Text style={[styles.petTypePillText, petType === val && styles.petTypePillTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formCard}>
                <Dropdown
                  label="Цвят"
                  options={COLORS}
                  value={form.color}
                  onChange={(v) => onFormChange("color", v)}
                  allowCustom
                />
                <View style={styles.divider} />
                {petType === "other" ? (
                  <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>Вид</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Опишете животното..."
                      placeholderTextColor="#AEAEB2"
                      value={form.breed}
                      onChangeText={(v) => onFormChange("breed", v)}
                    />
                  </View>
                ) : (
                  <Dropdown
                    label="Порода"
                    options={breedOptions}
                    value={form.breed}
                    onChange={(v) => onFormChange("breed", v)}
                    allowCustom
                  />
                )}
                <View style={styles.divider} />
                <Dropdown
                  label="Възраст"
                  options={ageOptions}
                  value={form.age}
                  onChange={(v) => onFormChange("age", v)}
                  allowCustom
                />
              </View>

              <View style={styles.locationCard}>
                <View style={styles.locationRow}>
                  <View style={styles.locationLeft}>
                    <Text style={styles.locationLabel}>Къде е забелязано?</Text>
                    <Text style={styles.locationValue}>
                      {isCustomLocation
                        ? "Избрана локация"
                        : "Текущата ми локация"}
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
                    <View style={styles.resetBtnRow}>
                      <Undo width={13} height={13} color="#2563EB" strokeWidth={2} />
                      <Text style={styles.resetBtnText}>Върни към текущата ми локация</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.noteCard}>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Допълнителна бележка (по желание)"
                  placeholderTextColor="#AEAEB2"
                  value={form.note}
                  onChangeText={(v) => onFormChange("note", v)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.postBtn,
                !isFormComplete && styles.postBtnDisabled,
              ]}
              onPress={onSubmit}
              disabled={!isFormComplete}
              activeOpacity={0.85}
            >
              <Text style={styles.postBtnText}>Публикувай</Text>
            </TouchableOpacity>
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
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  body: { paddingHorizontal: 16, flex: 1 },
  petTypeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  petTypeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#AEAEB2",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  petTypePills: {
    flexDirection: "row",
    gap: 8,
  },
  petTypePill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    gap: 4,
  },
  petTypePillActive: {
    backgroundColor: "#1C1C1E",
  },
  petTypeEmoji: {
    fontSize: 20,
  },
  petTypePillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  petTypePillTextActive: {
    color: "#fff",
  },
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
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1C1C1E",
    width: 56,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#1C1C1E",
    textAlign: "right",
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
  resetBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
  photo: {
    width: SCREEN_WIDTH,
    height: 260,
    resizeMode: "cover",
  },
  noteCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  noteInput: {
    fontSize: 15,
    color: "#1C1C1E",
    minHeight: 72,
  },
  postBtnDisabled: { backgroundColor: "#93C5FD" },
  postBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
