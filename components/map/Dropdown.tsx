import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
};

export default function Dropdown({ label, options, value, onChange }: Props) {
  const [open, setOpen] = useState(false);

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
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            {options.map((opt, i) => (
              <TouchableOpacity
                key={opt}
                style={[styles.option, i < options.length - 1 && styles.optionBorder]}
                onPress={() => {
                  onChange(opt);
                  setOpen(false);
                }}
              >
                <Text style={[styles.optionText, opt === value && styles.optionTextSelected]}>
                  {opt}
                </Text>
                {opt === value && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
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
  chevron: {
    fontSize: 20,
    color: "#AEAEB2",
    lineHeight: 22,
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
  check: {
    fontSize: 17,
    color: "#2563EB",
    fontWeight: "700",
  },
});
