import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ChainInfo = { color: string; onDismiss: () => void };

type Props = {
  chains: ChainInfo[];
};

export default function PathNotification({ chains }: Props) {
  if (chains.length === 0) return null;
  return (
    <View style={styles.notification}>
      {chains.map((c, i) => (
        <View key={i} style={styles.chip}>
          <View style={[styles.dot, { backgroundColor: c.color }]} />
          <TouchableOpacity onPress={c.onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.x}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Text style={styles.label}>{chains.length === 1 ? "Маршрут" : "Маршрути"}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  notification: {
    position: "absolute",
    top: 52,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  x: {
    fontSize: 13,
    color: "#AEAEB2",
    fontWeight: "600",
  },
});
