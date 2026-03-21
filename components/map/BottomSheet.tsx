import { useEffect, useRef } from "react";
import { Animated, Dimensions, Modal, PanResponder, StyleSheet, TouchableOpacity, View } from "react-native";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type Props = {
  visible: boolean;
  onClose: () => void;
  maxHeight?: string | number;
  children: React.ReactNode;
};

function toPixels(h: string | number): number {
  if (typeof h === "number") return h;
  return SCREEN_HEIGHT * (parseFloat(h) / 100);
}

export default function BottomSheet({ visible, onClose, maxHeight = "85%", children }: Props) {
  const sheetHeight = toPixels(maxHeight);
  const translateY = useRef(new Animated.Value(800)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const dismissRef = useRef<() => void>(null!);
  dismissRef.current = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 800, duration: 250, useNativeDriver: true }),
    ]).start(() => onCloseRef.current());
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 100 || g.vy > 0.5) {
          dismissRef.current();
        } else {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 300 }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(800);
      backdropOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(backdropOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 180 }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={() => dismissRef.current()}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => dismissRef.current()}>
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}
          pointerEvents="none"
        />
        <TouchableOpacity activeOpacity={1} onPress={() => {}} style={{ width: "100%" }}>
          <Animated.View style={{ height: sheetHeight, transform: [{ translateY }] }}>
            <View style={styles.handleArea} {...panResponder.panHandlers}>
              <View style={styles.handle} />
            </View>
            {children}
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  handleArea: {
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D1D6",
  },
});
