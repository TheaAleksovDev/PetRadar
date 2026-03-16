import { Check, EditPencil, NavArrowRight } from "iconoir-react-native";
import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  allowCustom?: boolean;
};

export default function Dropdown({
  label,
  options,
  value,
  onChange,
  allowCustom,
}: Props) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");

  const close = () => {
    setOpen(false);
    setCustomMode(false);
    setCustomText("");
  };

  const confirmCustom = () => {
    const trimmed = customText.trim();
    if (trimmed) onChange(trimmed);
    close();
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.row}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.label}>{label}</Text>
        <View style={styles.right}>
          <Text style={[styles.value, !value && styles.placeholder]}>
            {value || "Избери..."}
          </Text>
          <NavArrowRight width={18} height={18} color="#AEAEB2" strokeWidth={2} />
        </View>
      </TouchableOpacity>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable style={styles.overlay} onPress={close}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>{label}</Text>

            {customMode ? (
              <View style={styles.customContainer}>
                <TextInput
                  style={styles.customInput}
                  placeholder={`Въведи ${label.toLowerCase()}...`}
                  placeholderTextColor="#AEAEB2"
                  value={customText}
                  onChangeText={setCustomText}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={confirmCustom}
                />
                <View style={styles.customActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setCustomMode(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelBtnText}>Назад</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.confirmBtn,
                      !customText.trim() && styles.confirmBtnDisabled,
                    ]}
                    onPress={confirmCustom}
                    disabled={!customText.trim()}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.confirmBtnText}>Потвърди</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {options.map((opt, i) => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.option,
                      i < options.length - 1 && styles.optionBorder,
                    ]}
                    onPress={() => {
                      onChange(opt);
                      close();
                    }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        opt === value && styles.optionTextSelected,
                      ]}
                    >
                      {opt}
                    </Text>
                    {opt === value && (
                      <Check width={18} height={18} color="#2563EB" strokeWidth={2.5} />
                    )}
                  </TouchableOpacity>
                ))}

                {allowCustom && (
                  <TouchableOpacity
                    style={styles.customOption}
                    onPress={() => {
                      setCustomText("");
                      setCustomMode(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.customOptionRow}>
                      <EditPencil width={16} height={16} color="#2563EB" strokeWidth={1.8} />
                      <Text style={styles.customOptionText}>Въведи сам...</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 15,
    color: "#1C1C1E",
    fontWeight: "500",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  value: {
    fontSize: 15,
    color: "#1C1C1E",
  },
  placeholder: {
    color: "#AEAEB2",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#AEAEB2",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
    marginBottom: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5EA",
  },
  optionText: {
    fontSize: 16,
    color: "#1C1C1E",
  },
  optionTextSelected: {
    color: "#2563EB",
    fontWeight: "600",
  },
  customOption: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E5EA",
    marginTop: 4,
  },
  customOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  customOptionText: {
    fontSize: 15,
    color: "#2563EB",
    fontWeight: "500",
  },
  customContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 16,
  },
  customInput: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1C1C1E",
  },
  customActions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F2F2F7",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  confirmBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
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
});
