import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { MediaImage, NavArrowLeft, Undo } from "iconoir-react-native";
import { useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomSheet from "../shared/BottomSheet";
import Dropdown from "../shared/Dropdown";
import LocationPicker from "../shared/LocationPicker";
import { CAT_AGES, CAT_BREEDS, COLORS, DOG_AGES, DOG_BREEDS } from "../constants";
import type { Coords } from "../types";

const SCREEN_WIDTH = Dimensions.get("window").width;

type LostForm = {
  name: string;
  color: string;
  breed: string;
  age: string;
  phone: string;
  note: string;
  petType: "dog" | "cat" | "other";
};

const EMPTY: LostForm = {
  name: "",
  color: "",
  breed: "",
  age: "",
  phone: "",
  note: "",
  petType: "dog",
};

type Props = {
  visible: boolean;
  userLocation: Coords;
  onClose: () => void;
  onSubmit: (form: LostForm & { imageUri: string }, location: Coords) => void;
};

export default function LostPetModal({
  visible,
  userLocation,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<LostForm>(EMPTY);
  const [imageUri, setImageUri] = useState("");
  const [location, setLocation] = useState<Coords>(userLocation);
  const [pickerVisible, setPickerVisible] = useState(false);

  const set = (field: keyof LostForm, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const isCustomLocation =
    location.latitude !== userLocation.latitude ||
    location.longitude !== userLocation.longitude;

  const isComplete =
    !!imageUri && !!form.name && !!form.color && !!form.breed && !!form.phone;

  const breedOptions = form.petType === "cat" ? CAT_BREEDS : DOG_BREEDS;
  const ageOptions = form.petType === "cat" ? CAT_AGES : DOG_AGES;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleClose = () => {
    setForm(EMPTY);
    setImageUri("");
    setLocation(userLocation);
    onClose();
  };

  const handleSubmit = () => {
    if (!isComplete) return;
    onSubmit({ ...form, imageUri }, location);
    setForm(EMPTY);
    setImageUri("");
    setLocation(userLocation);
  };

  return (
    <>
      <LocationPicker
        visible={pickerVisible}
        initialCoords={location}
        onConfirm={(coords) => {
          setLocation(coords);
          setPickerVisible(false);
        }}
        onClose={() => setPickerVisible(false)}
      />

      <BottomSheet visible={visible} onClose={handleClose} maxHeight="92%">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View style={styles.card}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.backBtn}>
                <NavArrowLeft width={26} height={26} color="#EF4444" strokeWidth={2} />
              </TouchableOpacity>
              <Text style={styles.title}>Търся любимеца си!</Text>
              <View style={{ width: 36 }} />
            </View>

            <ScrollView
              style={styles.body}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TouchableOpacity
                style={styles.photoPicker}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                {imageUri ? (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.photoPreview}
                  />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <MediaImage width={40} height={40} color="#AEAEB2" strokeWidth={1.5} />
                    <Text style={styles.photoPlaceholderText}>
                      Избери снимка от галерията
                    </Text>
                  </View>
                )}
                {imageUri && (
                  <View style={styles.changePhotoBtn}>
                    <Text style={styles.changePhotoBtnText}>Смени</Text>
                  </View>
                )}
              </TouchableOpacity>

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
                      style={[styles.petTypePill, form.petType === val && styles.petTypePillActive]}
                      onPress={() => {
                        setForm((f) => ({ ...f, petType: val, breed: "", age: "" }));
                      }}
                      activeOpacity={0.8}
                    >
                      {emoji === "🐾"
                        ? <MaterialCommunityIcons name="paw" size={20} color={form.petType === val ? "#fff" : "#1C1C1E"} />
                        : <Text style={styles.petTypeEmoji}>{emoji}</Text>}
                      <Text style={[styles.petTypePillText, form.petType === val && styles.petTypePillTextActive]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formCard}>
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Име</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Макс, Рекс..."
                    placeholderTextColor="#AEAEB2"
                    value={form.name}
                    onChangeText={(v) => set("name", v)}
                    returnKeyType="next"
                  />
                </View>
                <View style={styles.divider} />
                <View style={styles.inputRow}>
                  <Text style={styles.inputLabel}>Контакт</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="+359 ..."
                    placeholderTextColor="#AEAEB2"
                    value={form.phone}
                    onChangeText={(v) => set("phone", v)}
                    keyboardType="phone-pad"
                    returnKeyType="done"
                  />
                </View>
              </View>

              <View style={styles.formCard}>
                <Dropdown
                  label="Цвят"
                  options={COLORS}
                  value={form.color}
                  onChange={(v) => set("color", v)}
                  allowCustom
                />
                <View style={styles.divider} />
                {form.petType === "other" ? (
                  <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>Вид</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Опишете животното..."
                      placeholderTextColor="#AEAEB2"
                      value={form.breed}
                      onChangeText={(v) => set("breed", v)}
                    />
                  </View>
                ) : (
                  <Dropdown
                    label="Порода"
                    options={breedOptions}
                    value={form.breed}
                    onChange={(v) => set("breed", v)}
                    allowCustom
                  />
                )}
                <View style={styles.divider} />
                <Dropdown
                  label="Възраст"
                  options={ageOptions}
                  value={form.age}
                  onChange={(v) => set("age", v)}
                  allowCustom
                />
              </View>

              <View style={styles.locationCard}>
                <View style={styles.locationRow}>
                  <View style={styles.locationLeft}>
                    <Text style={styles.locationLabel}>Последно видян на</Text>
                    <Text style={styles.locationValue}>
                      {isCustomLocation
                        ? "Избрана локация"
                        : "Текущата ми локация"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.changeBtn}
                    onPress={() => setPickerVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.changeBtnText}>Промени</Text>
                  </TouchableOpacity>
                </View>
                {isCustomLocation && (
                  <TouchableOpacity
                    onPress={() => setLocation(userLocation)}
                    style={styles.resetBtn}
                  >
                    <View style={styles.resetBtnRow}>
                      <Undo width={13} height={13} color="#EF4444" strokeWidth={2} />
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
                  onChangeText={(v) => set("note", v)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.postBtn, !isComplete && styles.postBtnDisabled]}
              onPress={handleSubmit}
              disabled={!isComplete}
              activeOpacity={0.85}
            >
              <Text style={styles.postBtnText}>Публикувай</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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

  photoPicker: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  photoPreview: {
    width: SCREEN_WIDTH - 32,
    height: 220,
    resizeMode: "cover",
  },
  photoPlaceholder: {
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  photoPlaceholderText: {
    fontSize: 15,
    color: "#AEAEB2",
    fontWeight: "500",
  },
  changePhotoBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  changePhotoBtnText: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "600",
  },

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
    width: 70,
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
    marginBottom: 12,
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
    backgroundColor: "#FEF2F2",
    borderRadius: 20,
  },
  changeBtnText: {
    fontSize: 14,
    color: "#EF4444",
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
    color: "#EF4444",
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

  postBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#EF4444",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  postBtnDisabled: { backgroundColor: "#FCA5A5" },
  postBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
