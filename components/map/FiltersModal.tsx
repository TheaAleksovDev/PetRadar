import { useEffect, useState } from "react";
import { Xmark } from "iconoir-react-native";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BottomSheet from "./BottomSheet";

export type FilterState = {
  view: "map" | "list";
  show: "all" | "seen" | "missing";
  petType: "all" | "dog" | "cat" | "other";
  sortBy: "recent" | "distance" | "engagement" | "type";
};

export const DEFAULT_FILTERS: FilterState = {
  view: "map",
  show: "all",
  petType: "all",
  sortBy: "recent",
};

type Props = {
  visible: boolean;
  filters: FilterState;
  onApply: (f: FilterState) => void;
  onClose: () => void;
};

export default function FiltersModal({ visible, filters, onApply, onClose }: Props) {
  const [local, setLocal] = useState<FilterState>(filters);

  useEffect(() => {
    if (visible) setLocal(filters);
  }, [visible]);

  const set = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
    setLocal((prev: FilterState) => ({ ...prev, [key]: val }));

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="88%">
      <View style={styles.sheet}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Филтри</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
              <Xmark width={20} height={20} color="#1C1C1E" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

            <Text style={styles.sectionLabel}>Покажи само</Text>
            <View style={styles.pills}>
              {([
                { val: "all", label: "Всички" },
                { val: "seen", label: "Забелязани" },
                { val: "missing", label: "Търсени" },
              ] as const).map(({ val, label }) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.pill, local.show === val && styles.pillActive]}
                  onPress={() => set("show", val)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pillText, local.show === val && styles.pillTextActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>Вид животно</Text>
            <View style={styles.petTypes}>
              {([
                { val: "all", label: "Всички", emoji: "🐾" },
                { val: "dog", label: "Куче", emoji: "🐕" },
                { val: "cat", label: "Коте", emoji: "🐱" },
                { val: "other", label: "Друго", emoji: "🐾" },
              ] as const).map(({ val, label, emoji }) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.petCell, local.petType === val && styles.petCellActive]}
                  onPress={() => set("petType", val)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.petEmoji}>{emoji}</Text>
                  <Text style={[styles.petLabel, local.petType === val && styles.petLabelActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sortRow}>
              <Text style={styles.sectionLabel}>Сортирай по</Text>
              {local.view !== "list" && (
                <Text style={styles.sortDisabledHint}>само в списък</Text>
              )}
            </View>
            <View style={styles.pills}>
              {([
                { val: "recent", label: "Скорошни" },
                { val: "distance", label: "Разстояние" },
                { val: "engagement", label: "Коментари" },
                { val: "type", label: "Тип" },
              ] as const).map(({ val, label }) => {
                const disabled = local.view !== "list";
                return (
                  <TouchableOpacity
                    key={val}
                    style={[styles.pill, local.sortBy === val && !disabled && styles.pillActive, disabled && styles.pillDisabled]}
                    onPress={() => !disabled && set("sortBy", val)}
                    activeOpacity={disabled ? 1 : 0.8}
                  >
                    <Text style={[styles.pillText, local.sortBy === val && !disabled && styles.pillTextActive, disabled && styles.pillTextDisabled]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

          </ScrollView>

          <TouchableOpacity style={styles.applyBtn} onPress={() => { onApply(local); onClose(); }} activeOpacity={0.85}>
            <Text style={styles.applyBtnText}>Приложи филтрите</Text>
          </TouchableOpacity>
        </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: "#fff",
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
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#AEAEB2",
    marginTop: 12,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sortDisabledHint: {
    fontSize: 11,
    color: "#AEAEB2",
    marginTop: 12,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
  },
  pillActive: {
    backgroundColor: "#1C1C1E",
  },
  pillDisabled: {
    opacity: 0.35,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  pillTextActive: {
    color: "#fff",
  },
  pillTextDisabled: {
    color: "#1C1C1E",
  },
  petTypes: {
    flexDirection: "row",
    gap: 10,
  },
  petCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    gap: 6,
  },
  petCellActive: {
    backgroundColor: "#1C1C1E",
  },
  petEmoji: {
    fontSize: 22,
  },
  petLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  petLabelActive: {
    color: "#fff",
  },
  applyBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: "#1C1C1E",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
