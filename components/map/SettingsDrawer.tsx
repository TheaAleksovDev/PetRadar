import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LogOut, Refresh } from "iconoir-react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.72;

type Props = {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  onRefresh: () => void;
};

export default function SettingsDrawer({ visible, onClose, onLogout, onRefresh }: Props) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateX.setValue(-DRAWER_WIDTH);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(translateX, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 200 }),
      ]).start();
    }
  }, [visible]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -DRAWER_WIDTH, duration: 240, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={dismiss}>
      <View style={styles.root}>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}
          pointerEvents="none"
        />

        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={dismiss} />

        <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
          <View style={styles.top}>
            <MaterialCommunityIcons name="paw" size={40} color="#1C1C1E" />
            <Text style={styles.appName}>PetRadar</Text>
            <Text style={styles.tagline}>Помагай на изгубените любимци</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.bottom}>
            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={() => { dismiss(); setTimeout(onRefresh, 280); }}
              activeOpacity={0.8}
            >
              <Refresh width={18} height={18} color="#1C1C1E" strokeWidth={2} />
              <Text style={styles.refreshText}>Обнови картата</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => { dismiss(); setTimeout(onLogout, 280); }}
              activeOpacity={0.8}
            >
              <LogOut width={18} height={18} color="#EF4444" strokeWidth={2} />
              <Text style={styles.logoutText}>Изход</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "row",
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: "100%",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    paddingTop: 64,
    paddingBottom: 40,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  top: {
    gap: 6,
  },
  paw: {
    fontSize: 40,
    marginBottom: 4,
  },
  appName: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1C1C1E",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: "#AEAEB2",
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E5E5EA",
    marginVertical: 24,
  },
  bottom: {
    marginTop: "auto",
    gap: 10,
  },
  refreshBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#F2F2F7",
    borderRadius: 14,
  },
  refreshText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FEF2F2",
    borderRadius: 14,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },
});
