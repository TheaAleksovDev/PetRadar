import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { MediaImage, NavArrowLeft } from "iconoir-react-native";
import { useRef } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  onCapture: (uri: string) => void;
  onClose: () => void;
};

export default function CameraScreen({ visible, onCapture, onClose }: Props) {
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
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />

            <View style={styles.overlay} pointerEvents="box-none">
              <View style={styles.topBar}>
                <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                  <NavArrowLeft
                    width={24}
                    height={24}
                    color="#fff"
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.bottomBar}>
                <TouchableOpacity
                  onPress={pickFromGallery}
                  style={styles.galleryBtn}
                  activeOpacity={0.7}
                >
                  <MediaImage
                    width={28}
                    height={28}
                    color="#fff"
                    strokeWidth={1.5}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={shoot}
                  style={styles.shutter}
                  activeOpacity={0.85}
                >
                  <View style={styles.shutterInner} />
                </TouchableOpacity>

                <View
                  style={{
                    opacity: 0,
                    width: 56,
                  }}
                />
              </View>
            </View>
          </>
        ) : (
          <View style={styles.permissionScreen}>
            <Text style={styles.permissionText}>
              Необходим е достъп до камерата
            </Text>
            <TouchableOpacity
              style={styles.permissionBtn}
              onPress={requestPermission}
            >
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
  bottomBar: {
    position: "absolute",
    bottom: 52,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
    flexDirection: "row",
  },

  galleryBtn: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
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
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#fff",
  },
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
