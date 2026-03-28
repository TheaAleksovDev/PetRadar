import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomSheet from "./BottomSheet";
import Dropdown from "./Dropdown";
import { CAT_AGES, CAT_BREEDS, COLORS, DOG_AGES, DOG_BREEDS } from "./constants";
import type { LostMarker, SightingMarker } from "./types";

type EditForm = {
  petType: string;
  breed: string;
  color: string;
  age: string;
  note: string;
  name: string;
  phone: string;
};

type Props = {
  visible: boolean;
  kind: "seen" | "lost" | null;
  marker: SightingMarker | LostMarker | null;
  onClose: () => void;
  onSave: (id: string, kind: "seen" | "lost", form: EditForm) => void;
};

export default function EditMarkerSheet({ visible, kind, marker, onClose, onSave }: Props) {
  const [form, setForm] = useState<EditForm>({
    petType: "dog",
    breed: "",
    color: "",
    age: "",
    note: "",
    name: "",
    phone: "",
  });

  const set = (field: keyof EditForm, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  // Sync form when marker changes
  const [lastId, setLastId] = useState<string | null>(null);
  if (marker && marker.id !== lastId) {
    setLastId(marker.id);
    setForm({
      petType: marker.petType ?? "dog",
      breed: marker.breed ?? "",
      color: marker.color ?? "",
      age: marker.age ?? "",
      note: marker.note ?? "",
      name: kind === "lost" ? (marker as LostMarker).name ?? "" : "",
      phone: kind === "lost" ? (marker as LostMarker).phone ?? "" : "",
    });
  }

  const breedOptions = form.petType === "cat" ? CAT_BREEDS : DOG_BREEDS;
  const ageOptions = form.petType === "cat" ? CAT_AGES : DOG_AGES;
  const isComplete =
    !!form.breed && !!form.color && !!form.age &&
    (kind !== "lost" || (!!form.name && !!form.phone));

  if (!marker || !kind) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="88%">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Редактирай публикация</Text>

          {/* Pet type */}
          <View style={styles.pillRow}>
            {(["dog", "cat", "other"] as const).map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.pill, form.petType === val && styles.pillActive]}
                onPress={() => { set("petType", val); set("breed", ""); set("age", ""); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, form.petType === val && styles.pillTextActive]}>
                  {val === "dog" ? "🐶 Куче" : val === "cat" ? "🐱 Коте" : "🐾 Друго"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.formCard}>
            {kind === "lost" && (
              <>
                <Text style={styles.label}>Име</Text>
                <TextInput
                  style={styles.input}
                  value={form.name}
                  onChangeText={(v) => set("name", v)}
                  placeholder="Например: Макс"
                  placeholderTextColor="#AEAEB2"
                />
                <Text style={styles.label}>Телефон</Text>
                <TextInput
                  style={styles.input}
                  value={form.phone}
                  onChangeText={(v) => set("phone", v)}
                  placeholder="+359 888 123 456"
                  placeholderTextColor="#AEAEB2"
                  keyboardType="phone-pad"
                />
              </>
            )}

            <Text style={styles.label}>Цвят</Text>
            <Dropdown
              label="Цвят"
              options={COLORS}
              value={form.color}
              onChange={(v) => set("color", v)}
            />

            <Text style={styles.label}>Порода</Text>
            <Dropdown
              label="Порода"
              options={breedOptions}
              value={form.breed}
              onChange={(v) => set("breed", v)}
            />

            <Text style={styles.label}>Възраст</Text>
            <Dropdown
              label="Възраст"
              options={ageOptions}
              value={form.age}
              onChange={(v) => set("age", v)}
            />

            <Text style={styles.label}>Бележка (по избор)</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={form.note}
              onChangeText={(v) => set("note", v)}
              placeholder="Допълнителна информация..."
              placeholderTextColor="#AEAEB2"
              multiline
              numberOfLines={3}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, !isComplete && styles.saveBtnDisabled]}
            onPress={() => isComplete && onSave(marker.id, kind, form)}
            activeOpacity={0.8}
          >
            <Text style={styles.saveBtnText}>Запази промените</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1C1C1E",
    marginBottom: 4,
  },
  pillRow: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
  },
  pillActive: {
    backgroundColor: "#1C1C1E",
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6C6C70",
  },
  pillTextActive: {
    color: "#fff",
  },
  formCard: {
    backgroundColor: "#F9F9FB",
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6C6C70",
    marginTop: 4,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1C1C1E",
  },
  noteInput: {
    minHeight: 72,
    textAlignVertical: "top",
  },
  saveBtn: {
    backgroundColor: "#1C1C1E",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnDisabled: {
    opacity: 0.35,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
