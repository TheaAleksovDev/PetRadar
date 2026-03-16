import * as ImagePicker from "expo-image-picker";
import { MediaImage, NavArrowLeft, Undo } from "iconoir-react-native";
import { useState } from "react";
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Dropdown from "./Dropdown";
import LocationPicker from "./LocationPicker";
import { AGES, BREEDS, COLORS } from "./constants";
import type { Coords } from "./types";

const SCREEN_WIDTH = Dimensions.get("window").width;

type LostForm = {
  name: string;
  color: string;
  breed: string;
  age: string;
  phone: string;
  note: string;
};

const EMPTY: LostForm = {
  name: "",
  color: "",
  breed: "",
  age: "",
  phone: "",
  note: "",
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

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.card}>
            {/* Header */}
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
              {/* Photo picker */}
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

              {/* Name + phone */}
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
                  <Text style={styles.inputLabel}>Контакт телефон</Text>
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

              {/* Dropdowns */}
              <View style={styles.formCard}>
                <Dropdown
                  label="Цвят"
                  options={COLORS}
                  value={form.color}
                  onChange={(v) => set("color", v)}
                  allowCustom
                />
                <View style={styles.divider} />
                <Dropdown
                  label="Порода"
                  options={BREEDS}
                  value={form.breed}
                  onChange={(v) => set("breed", v)}
                  allowCustom
                />
                <View style={styles.divider} />
                <Dropdown
                  label="Възраст"
                  options={AGES}
                  value={form.age}
                  onChange={(v) => set("age", v)}
                  allowCustom
                />
              </View>

              {/* Last seen location */}
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

              {/* Note */}
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
    maxHeight: "92%",
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
  body: { paddingHorizontal: 16 },

  // Photo
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

  // Cards
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

  // Location
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

  // Note
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

  // Submit
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
