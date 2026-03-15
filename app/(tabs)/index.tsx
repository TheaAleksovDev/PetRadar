import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";

import FabMenu from "@/components/map/FabMenu";
import ReportModal from "@/components/map/ReportModal";
import type { Coords, SightingMarker } from "@/components/map/types";

type Form = { color: string; breed: string; age: string };

const EMPTY_FORM: Form = { color: "", breed: "", age: "" };

export default function HomeScreen() {
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [userLocation, setUserLocation] = useState<Coords | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [sightingLocation, setSightingLocation] = useState<Coords | null>(null);
  const [markers, setMarkers] = useState<SightingMarker[]>([]);
  const [form, setForm] = useState<Form>(EMPTY_FORM);

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      const coords: Coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(coords);
      setSightingLocation(coords);
      setInitialRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });
    })();
  }, []);

  const openReport = () => {
    setSightingLocation(userLocation);
    setForm(EMPTY_FORM);
    setReportVisible(true);
    setFabOpen(false);
  };

  const handleSubmit = () => {
    if (!form.color || !form.breed || !form.age || !sightingLocation) return;
    setMarkers((prev) => [
      ...prev,
      { id: Date.now().toString(), coordinate: sightingLocation, ...form },
    ]);
    setReportVisible(false);
    setForm(EMPTY_FORM);
  };

  if (!initialRegion || !userLocation) return null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {markers.map((m) => (
          <Marker
            key={m.id}
            coordinate={m.coordinate}
            title={m.breed}
            description={`${m.color} · ${m.age}`}
            pinColor="#22C55E"
          />
        ))}
      </MapView>

      <FabMenu
        open={fabOpen}
        onToggle={() => setFabOpen((o) => !o)}
        onSighting={openReport}
        onLost={() => setFabOpen(false)}
      />

      <ReportModal
        visible={reportVisible}
        form={form}
        sightingLocation={sightingLocation ?? userLocation}
        userLocation={userLocation}
        pickerVisible={pickerVisible}
        onClose={() => setReportVisible(false)}
        onFormChange={(field, value) => setForm((f) => ({ ...f, [field]: value }))}
        onOpenPicker={() => setPickerVisible(true)}
        onClosePicker={() => setPickerVisible(false)}
        onConfirmLocation={(coords) => {
          setSightingLocation(coords);
          setPickerVisible(false);
        }}
        onResetLocation={() => setSightingLocation(userLocation)}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
