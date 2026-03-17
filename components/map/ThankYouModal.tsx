import { HeartSolid } from "iconoir-react-native";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ThankYouModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <HeartSolid width={80} height={80} color="#EF4444" />
          <Text style={styles.title}>Благодаря ти!</Text>
          <Text style={styles.subtitle}>
            Помагаш на изгубено куче да намери дома си. Всяко съобщение е от значение!
          </Text>
          <TouchableOpacity style={styles.btn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.btnText}>Затвори</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: "100%",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1C1C1E",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#6C6C70",
    textAlign: "center",
    lineHeight: 22,
  },
  btn: {
    marginTop: 8,
    backgroundColor: "#EF4444",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: "center",
    width: "100%",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
