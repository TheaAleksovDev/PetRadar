import { Camera, Compass, Plus, Search, Xmark } from "iconoir-react-native";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  open: boolean;
  onToggle: () => void;
  onSighting: () => void;
  onLost: () => void;
  onRecenter: () => void;
};

export default function FabMenu({ open, onToggle, onSighting, onLost, onRecenter }: Props) {
  return (
    <>
      {open && (
        <Pressable style={StyleSheet.absoluteFill} onPress={onToggle} />
      )}

      {open && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onSighting}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIcon, { backgroundColor: "#1C1C1E" }]}>
              <Camera width={20} height={20} color="#fff" strokeWidth={1.8} />
            </View>
            <Text style={styles.menuLabel}>Забелязах любимец</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={onLost}
            activeOpacity={0.8}
          >
            <View style={[styles.menuIcon, { backgroundColor: "#EF4444" }]}>
              <Search width={20} height={20} color="#fff" strokeWidth={1.8} />
            </View>
            <Text style={styles.menuLabel}>Търся любимец</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.recenter}
        onPress={onRecenter}
        activeOpacity={0.85}
      >
        <Compass width={20} height={20} color="#1C1C1E" strokeWidth={1.8} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fab}
        onPress={onToggle}
        activeOpacity={0.85}
      >
        {open
          ? <Xmark width={24} height={24} color="#fff" strokeWidth={2} />
          : <Plus width={26} height={26} color="#fff" strokeWidth={2} />
        }
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  recenter: {
    position: "absolute",
    bottom: 32,
    right: 88,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  menu: {
    position: "absolute",
    bottom: 100,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    gap: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1C1C1E",
  },
});
