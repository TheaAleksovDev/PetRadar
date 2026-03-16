import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  onCapture: (uri: string) => void;
  onClose: () => void;
};

export default function CameraScreen({ visible, onCapture, onClose }: Props) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const shoot = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (photo?.uri) onCapture(photo.uri);
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      onCapture(result.assets[0].uri);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {permission?.granted ? (
          <>
            <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

            <View style={styles.overlay} pointerEvents="box-none">
              <View style={styles.topBar}>
                <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                  <Text style={styles.iconText}>‹</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
                  style={styles.iconBtn}
                >
                  <Text style={styles.iconText}>⟳</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomBar}>
                <TouchableOpacity
                  onPress={pickFromGallery}
                  style={styles.galleryBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.galleryText}>Галерия</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={shoot} style={styles.shutter} activeOpacity={0.85}>
                  <View style={styles.shutterInner} />
                </TouchableOpacity>

                <View style={styles.iconBtn} />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.permissionScreen}>
            <Text style={styles.permissionText}>Необходим е достъп до камерата</Text>
            <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
              <Text style={styles.permissionBtnText}>Разреши достъп</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  topBar: {
    position: "absolute",
    top: 56,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  iconText: { color: "#fff", fontSize: 26, fontWeight: "300", lineHeight: 30 },
  bottomBar: {
    position: "absolute",
    bottom: 52,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 36,
  },
  galleryBtn: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  galleryText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 3,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: "#fff" },
  permissionScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  permissionText: { color: "#fff", fontSize: 16, textAlign: "center" },
  permissionBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  permissionBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
