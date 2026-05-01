import { Clock } from "iconoir-react-native";
import { StyleSheet, Text, View } from "react-native";
import { timeAgo } from "./utils";

type Props = {
  ts: number;
  color?: string;
  fontSize?: number;
};

export default function TimeTag({
  ts,
  color = "#AEAEB2",
  fontSize = 12,
}: Props) {
  return (
    <View style={styles.row}>
      <Clock
        width={fontSize}
        height={fontSize}
        color={color}
        strokeWidth={1.8}
      />
      <Text style={[styles.text, { color, fontSize }]}>{timeAgo(ts)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  text: {
    fontWeight: "500",
  },
});
