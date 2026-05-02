import { Undo } from "iconoir-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import LocationPicker from "../shared/LocationPicker";
import type { Coords } from "../types";

type Props = {
  visible: boolean;
  userLocation: Coords;
  onSubmit: (comment: string, location: Coords | null) => void;
  onClose: () => void;
};

export default function LeaveCommentModal({
  visible,
  userLocation,
  onSubmit,
  onClose,
}: Props) {
  const [comment, setComment] = useState("");
  const [location, setLocation] = useState<Coords | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  const isCustomLocation = location !== null;

  const handleSubmit = () => {
    if (!comment.trim()) return;
    onSubmit(comment.trim(), location);
    setComment("");
    setLocation(null);
  };

  const handleClose = () => {
    setComment("");
    setLocation(null);
    onClose();
  };

  return (
    <>
      <LocationPicker
        visible={pickerVisible}
        initialCoords={location ?? userLocation}
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
            <View style={styles.handle} />

            <Text style={styles.title}>Видял ли си го?</Text>
            <Text style={styles.subtitle}>
              Помогни на стопанина да намери своя любимец
            </Text>

            <View style={styles.body}>
              <View style={styles.inputCard}>
                <TextInput
                  style={styles.input}
                  placeholder="Напиши съобщение..."
                  placeholderTextColor="#AEAEB2"
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.locationCard}>
                <View style={styles.locationRow}>
                  <View style={styles.locationLeft}>
                    <Text style={styles.locationLabel}>
                      Локация (по желание)
                    </Text>
                    <Text style={styles.locationValue}>
                      {isCustomLocation ? "Избрана локация" : "Не е добавена"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.changeBtn}
                    onPress={() => setPickerVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.changeBtnText}>
                      {isCustomLocation ? "Промени" : "Добави"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {isCustomLocation && (
                  <TouchableOpacity
                    onPress={() => setLocation(null)}
                    style={styles.resetBtn}
                  >
                    <View style={styles.resetBtnRow}>
                      <Undo
                        width={13}
                        height={13}
                        color="#EF4444"
                        strokeWidth={2}
                      />
                      <Text style={styles.resetBtnText}>
                        Премахни локацията
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Откажи</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  !comment.trim() && styles.submitBtnDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!comment.trim()}
                activeOpacity={0.85}
              >
                <Text style={styles.submitBtnText}>Изпрати</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6C6C70",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  body: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  inputCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
  },
  input: {
    fontSize: 15,
    color: "#1C1C1E",
    minHeight: 96,
  },
  locationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
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
  actions: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#E5E5EA",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    backgroundColor: "#EF4444",
  },
  submitBtnDisabled: {
    backgroundColor: "#FCA5A5",
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
