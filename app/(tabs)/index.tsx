import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";

import CameraScreen from "@/components/map/CameraScreen";
import FabMenu from "@/components/map/FabMenu";
import LostPetDetailSheet from "@/components/map/LostPetDetailSheet";
import LostPetModal from "@/components/map/LostPetModal";
import MatchModal from "@/components/map/MatchModal";
import PathNotification from "@/components/map/PathNotification";
import PetDetailSheet from "@/components/map/PetDetailSheet";
import SightingMatchModal from "@/components/map/SightingMatchModal";
import ThankYouModal from "@/components/map/ThankYouModal";
import PetMarker, {
  DOT_SIZE,
  LOST_MARKER_H,
  LOST_MARKER_W,
  LOST_PIN_H,
  LOST_PIN_W,
  MARKER_H,
  MARKER_W,
  PIN_H,
  PIN_W,
} from "@/components/map/PetMarker";
import ReportModal from "@/components/map/ReportModal";
import type { Coords, LostMarker, SightingMarker } from "@/components/map/types";

type Form = { color: string; breed: string; age: string; note: string };
const EMPTY_FORM: Form = { color: "", breed: "", age: "", note: "" };

type PinnedChain = { id: string; chain: SightingMarker[]; color: string };
const CHAIN_COLORS = ["#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];

const _h1: SightingMarker = {
  id: "seed-husky-1",
  coordinate: { latitude: 42.6525, longitude: 23.3498 },
  imageUri: Image.resolveAssetSource(require("../../assets/testImages/hysky-having-fun-beach-laying-sand-wide-angle-shot-facing-camera-111015855.webp")).uri,
  color: "Сив", breed: "Хъски", age: "Млад (1–3 г.)",
  createdAt: Date.now() - 3 * 60 * 60 * 1000,
  connectedChild: "seed-husky-2",
};
const _h2: SightingMarker = {
  id: "seed-husky-2",
  coordinate: { latitude: 42.6535, longitude: 23.3530 },
  imageUri: Image.resolveAssetSource(require("../../assets/testImages/siberian-hysky-dog-living-belgium-siberian-hysky-dog-living-belgium-animal-shelter-127837488.webp")).uri,
  color: "Сив", breed: "Хъски", age: "Млад (1–3 г.)",
  createdAt: Date.now() - 90 * 60 * 1000,
  connectedParent: "seed-husky-1", connectedChild: "seed-husky-3",
};
const _h3: SightingMarker = {
  id: "seed-husky-3",
  coordinate: { latitude: 42.6522, longitude: 23.3558 },
  imageUri: Image.resolveAssetSource(require("../../assets/testImages/images (1).jpg")).uri,
  color: "Сив", breed: "Хъски", age: "Млад (1–3 г.)",
  createdAt: Date.now() - 20 * 60 * 1000,
  connectedParent: "seed-husky-2",
};
const SEED_HUSKY_CHAIN: PinnedChain = { id: "seed-husky", chain: [_h1, _h2, _h3], color: "#22C55E" };

function buildChain(marker: SightingMarker, allMarkers: SightingMarker[]): SightingMarker[] {
  const chain: SightingMarker[] = [];
  let current: SightingMarker | undefined = marker;
  while (current) {
    chain.unshift(current);
    const parentId: string | undefined = current.connectedParent;
    current = parentId ? allMarkers.find((m) => m.id === parentId) : undefined;
  }
  return chain;
}

export default function HomeScreen() {
  const [initialRegion, setInitialRegion] = useState<Region | null>(null);
  const [userLocation, setUserLocation] = useState<Coords | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [imageUri, setImageUri] = useState("");
  const [reportVisible, setReportVisible] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [sightingLocation, setSightingLocation] = useState<Coords | null>(null);
  const [markers, setMarkers] = useState<SightingMarker[]>(() => [
    _h1, _h2, _h3,
    {
      id: "seed-1",
      coordinate: { latitude: 42.6558, longitude: 23.3522 },
      imageUri: Image.resolveAssetSource(require("../../assets/testImages/images.jpg")).uri,
      color: "Бял",
      breed: "Смесен",
      age: "Млад (1–3 г.)",
      createdAt: Date.now() - 5 * 60 * 1000,
    },
    {
      id: "seed-2",
      coordinate: { latitude: 42.6575, longitude: 23.3548 },
      imageUri: Image.resolveAssetSource(
        require("../../assets/testImages/Australian-Shepherd-breed-sitting-on-the-stone_ChocoPie-Shutterstock.jpg")
      ).uri,
      color: "Пъстър",
      breed: "Друга порода",
      age: "Млад (1–3 г.)",
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
    },
  ]);
  const [lostMarkers, setLostMarkers] = useState<LostMarker[]>(() => [
    {
      id: "lost-seed-1",
      coordinate: { latitude: 42.6408, longitude: 23.3762 },
      imageUri: Image.resolveAssetSource(require("../../assets/testImages/PuppyZiggyAtHome-e1590163382501.jpeg")).uri,
      name: "Зиги",
      color: "Кафяв",
      breed: "Лабрадор",
      age: "Кученце (0–1 г.)",
      phone: "+359 888 123 456",
      createdAt: Date.now() - 3 * 60 * 60 * 1000,
    },
    {
      id: "lost-seed-2",
      coordinate: { latitude: 42.6391, longitude: 23.3795 },
      imageUri: Image.resolveAssetSource(require("../../assets/testImages/Screen-Shot-2019-01-02-at-12.29.17-PM.png")).uri,
      name: "Макс",
      color: "Черен",
      breed: "Немска овчарка",
      age: "Възрастен (3–7 г.)",
      phone: "+359 877 654 321",
      createdAt: Date.now() - 24 * 60 * 60 * 1000,
    },
  ]);
  const [form, setForm] = useState<Form>(EMPTY_FORM);
  const [lostModalVisible, setLostModalVisible] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<SightingMarker | null>(null);
  const [selectedChain, setSelectedChain] = useState<SightingMarker[]>([]);
  const [selectedLostMarker, setSelectedLostMarker] = useState<LostMarker | null>(null);
  const [matchModalVisible, setMatchModalVisible] = useState(false);
  const [matches, setMatches] = useState<LostMarker[]>([]);
  const [pendingSightingId, setPendingSightingId] = useState<string | null>(null);
  const [sightingMatchVisible, setSightingMatchVisible] = useState(false);
  const [sightingMatches, setSightingMatches] = useState<SightingMarker[]>([]);
  const [thankYouVisible, setThankYouVisible] = useState(false);
  const [afterThankYou, setAfterThankYou] = useState<(() => void) | null>(null);
  const [pinnedChains, setPinnedChains] = useState<PinnedChain[]>([SEED_HUSKY_CHAIN]);
  const [points, setPoints] = useState<Record<string, { x: number; y: number }>>({});
  const [latDelta, setLatDelta] = useState(0.01);

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

  const updatePositions = async () => {
    if (!mapRef.current) return;
    const all = [...markers, ...lostMarkers];
    if (all.length === 0) return;
    const entries = await Promise.all(
      all.map(async (m) => {
        const pt = await mapRef.current!.pointForCoordinate(m.coordinate);
        return [m.id, pt] as const;
      })
    );
    setPoints(Object.fromEntries(entries));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { updatePositions(); }, [markers, lostMarkers]);

  const openCamera = () => {
    setSightingLocation(userLocation);
    setForm(EMPTY_FORM);
    setImageUri("");
    setCameraVisible(true);
    setFabOpen(false);
  };

  const handleCapture = (uri: string) => {
    setImageUri(uri);
    setCameraVisible(false);
    setReportVisible(true);
  };

  const handleSightingSubmit = () => {
    if (!form.color || !form.breed || !form.age || !sightingLocation) return;
    const newId = Date.now().toString();
    setPendingSightingId(newId);
    setMarkers((prev) => [
      ...prev,
      {
        id: newId,
        coordinate: sightingLocation,
        imageUri,
        createdAt: Date.now(),
        color: form.color,
        breed: form.breed,
        age: form.age,
        note: form.note || undefined,
      },
    ]);
    setReportVisible(false);
    setForm(EMPTY_FORM);

    const norm = (s: string) => s.trim().toLowerCase();
    const haversine = (a: Coords, b: Coords) => {
      const R = 6371;
      const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
      const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
      const s =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((a.latitude * Math.PI) / 180) *
          Math.cos((b.latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
    };
    const found = lostMarkers
      .filter((m) => !m.connectedChild)
      .map((m) => ({
        marker: m,
        km: haversine(sightingLocation, m.coordinate),
        score:
          (norm(m.breed) === norm(form.breed) ? 2 : 0) +
          (norm(m.color) === norm(form.color) ? 1 : 0),
      }))
      .filter(({ km }) => km <= 20)
      .sort((a, b) => b.score - a.score || a.km - b.km)
      .map(({ marker }) => marker)
      .slice(0, 6);

    const foundSightings = markers
      .filter((m) => !m.connectedChild)
      .map((m) => ({
        marker: m,
        km: haversine(sightingLocation, m.coordinate),
        score:
          (norm(m.breed) === norm(form.breed) ? 2 : 0) +
          (norm(m.color) === norm(form.color) ? 1 : 0),
      }))
      .filter(({ km }) => km <= 20)
      .sort((a, b) => b.score - a.score || a.km - b.km)
      .map(({ marker }) => marker)
      .slice(0, 6);

    if (found.length > 0) {
      setMatches(found);
      setSightingMatches(foundSightings);
      setMatchModalVisible(true);
    } else if (foundSightings.length > 0) {
      setSightingMatches(foundSightings);
      setSightingMatchVisible(true);
    }
  };

  const handleLostSubmit = (
    data: { name: string; color: string; breed: string; age: string; phone: string; note: string; imageUri: string },
    location: Coords
  ) => {
    setLostMarkers((prev) => [
      ...prev,
      {
        id: `lost-${Date.now()}`,
        coordinate: location,
        imageUri: data.imageUri,
        createdAt: Date.now(),
        name: data.name,
        color: data.color,
        breed: data.breed,
        age: data.age,
        phone: data.phone,
        note: data.note || undefined,
      },
    ]);
    setLostModalVisible(false);
  };

  const openSighting = (marker: SightingMarker) => {
    setSelectedChain(buildChain(marker, markers));
    setSelectedMarker(marker);
  };

  const handleAddTip = (markerId: string, comment: string, location: Coords | null) => {
    const tip = {
      id: Date.now().toString(),
      comment,
      location: location ?? undefined,
      createdAt: Date.now(),
    };
    setLostMarkers((prev) =>
      prev.map((m) => (m.id === markerId ? { ...m, tips: [...(m.tips ?? []), tip] } : m))
    );
  };

  if (!initialRegion || !userLocation) return null;

  const pathPinned = pinnedChains.length > 0;
  const selectedChainId = selectedChain.length > 0 ? selectedChain[selectedChain.length - 1].id : null;
  const currentChainPinned = pinnedChains.some((p) => p.id === selectedChainId);
  const previewColor = CHAIN_COLORS[pinnedChains.length % CHAIN_COLORS.length];
  const chainsToRender: PinnedChain[] = [
    ...pinnedChains,
    ...(selectedMarker && !currentChainPinned && selectedChain.length > 0
      ? [{ id: "preview", chain: selectedChain, color: previewColor }]
      : []),
  ];
  const allChainMarkerIds = new Set(chainsToRender.flatMap((pc) => pc.chain.map((m) => m.id)));

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
        onRegionChange={(r) => { setLatDelta(r.latitudeDelta); updatePositions(); }}
        onRegionChangeComplete={(r) => { setLatDelta(r.latitudeDelta); updatePositions(); }}
      />

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {chainsToRender.map(({ id, chain, color }) =>
          chain.slice(1).map((m, i) => {
            const p1 = points[chain[i].id];
            const p2 = points[m.id];
            if (!p1 || !p2) return null;
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View
                key={`line-${id}-${m.id}`}
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: (p1.x + p2.x) / 2 - length / 2,
                  top: (p1.y + p2.y) / 2 - 1,
                  width: length,
                  height: 2,
                  backgroundColor: color,
                  opacity: 0.8,
                  transform: [{ rotate: `${angle}deg` }],
                }}
              />
            );
          })
        )}

        {chainsToRender.map(({ id, chain, color }) =>
          chain.map((m, idx) => {
            const pt = points[m.id];
            if (!pt) return null;
            const isLast = idx === chain.length - 1;
            return (
              <View
                key={`chainDot-${id}-${m.id}`}
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: pt.x - 7,
                  top: pt.y - 7,
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  backgroundColor: isLast ? "#16A34A" : color,
                  borderWidth: 2,
                  borderColor: "#fff",
                }}
              />
            );
          })
        )}

        {markers.filter((m) => !m.connectedChild || allChainMarkerIds.has(m.id)).map((m) => {
          const pt = points[m.id];
          if (!pt) return null;
          const zoom = latDelta < 0.05 ? "full" : latDelta < 0.2 ? "pin" : "dot";
          const w = zoom === "full" ? MARKER_W : zoom === "pin" ? PIN_W : DOT_SIZE;
          const h = zoom === "full" ? MARKER_H : zoom === "pin" ? PIN_H : DOT_SIZE;
          const anchorY = zoom === "dot" ? h / 2 : h;
          return (
            <TouchableOpacity
              key={m.id}
              style={{ position: "absolute", left: pt.x - w / 2, top: pt.y - anchorY }}
              onPress={() => openSighting(m)}
              activeOpacity={0.9}
            >
              <PetMarker marker={m} zoom={zoom} variant="sighting" />
            </TouchableOpacity>
          );
        })}

        {lostMarkers.filter((m) => !m.connectedChild).map((m) => {
          const pt = points[m.id];
          if (!pt) return null;
          const zoom = latDelta < 0.05 ? "full" : latDelta < 0.2 ? "pin" : "dot";
          const w = zoom === "full" ? LOST_MARKER_W : zoom === "pin" ? LOST_PIN_W : DOT_SIZE;
          const h = zoom === "full" ? LOST_MARKER_H : zoom === "pin" ? LOST_PIN_H : DOT_SIZE;
          const anchorY = zoom === "dot" ? h / 2 : h;
          return (
            <TouchableOpacity
              key={m.id}
              style={{ position: "absolute", left: pt.x - w / 2, top: pt.y - anchorY }}
              onPress={() => setSelectedLostMarker(m)}
              activeOpacity={0.9}
            >
              <PetMarker marker={m} zoom={zoom} variant="lost" />
            </TouchableOpacity>
          );
        })}
      </View>

      {pathPinned && !selectedMarker && (
        <PathNotification
          chains={pinnedChains.map((pc) => ({
            color: pc.color,
            onDismiss: () => setPinnedChains((prev) => prev.filter((c) => c.id !== pc.id)),
          }))}
        />
      )}

      <FabMenu
        open={fabOpen}
        onToggle={() => setFabOpen((o) => !o)}
        onSighting={openCamera}
        onLost={() => { setFabOpen(false); setLostModalVisible(true); }}
      />

      <CameraScreen
        visible={cameraVisible}
        onCapture={handleCapture}
        onClose={() => setCameraVisible(false)}
      />

      <LostPetModal
        visible={lostModalVisible}
        userLocation={userLocation}
        onClose={() => setLostModalVisible(false)}
        onSubmit={handleLostSubmit}
      />

      <LostPetDetailSheet
        marker={selectedLostMarker}
        userLocation={userLocation}
        onClose={() => setSelectedLostMarker(null)}
        onSubmitTip={handleAddTip}
      />

      <PetDetailSheet
        marker={selectedMarker}
        userLocation={userLocation}
        onClose={() => { setSelectedMarker(null); setSelectedChain([]); }}
        chain={selectedChain}
        pathPinned={currentChainPinned}
        onTogglePath={(pinned) => {
          const id = selectedChain[selectedChain.length - 1].id;
          if (pinned) {
            const color = CHAIN_COLORS[pinnedChains.length % CHAIN_COLORS.length];
            setPinnedChains((prev) => [...prev, { id, chain: selectedChain, color }]);
          } else {
            setPinnedChains((prev) => prev.filter((p) => p.id !== id));
          }
        }}
        pinnedChainsInfo={pinnedChains.map((pc) => ({
          color: pc.color,
          onDismiss: () => setPinnedChains((prev) => prev.filter((c) => c.id !== pc.id)),
        }))}
      />

      <MatchModal
        visible={matchModalVisible}
        matches={matches}
        onSelect={(marker) => {
          setMatchModalVisible(false);
          const sid = pendingSightingId;
          if (sid) {
            setMarkers((prev) =>
              prev.map((m) => m.id === sid ? { ...m, connectedParent: marker.id } : m)
            );
            setLostMarkers((prev) =>
              prev.map((m) => m.id === marker.id ? { ...m, connectedChild: sid } : m)
            );
            setPendingSightingId(null);
            const newSighting = markers.find((m) => m.id === sid);
            if (newSighting) openSighting(newSighting);
          }
        }}
        onDismiss={() => {
          setMatchModalVisible(false);
          if (sightingMatches.length > 0) {
            setSightingMatchVisible(true);
          } else {
            setThankYouVisible(true);
          }
        }}
      />

      <SightingMatchModal
        visible={sightingMatchVisible}
        matches={sightingMatches}
        onBack={matches.length > 0 ? () => { setSightingMatchVisible(false); setMatchModalVisible(true); } : undefined}
        onSelect={(marker) => {
          setSightingMatchVisible(false);
          const sid = pendingSightingId;
          if (sid) {
            const newSighting = markers.find((m) => m.id === sid);
            const chain = buildChain(marker, markers);
            if (newSighting) chain.push(newSighting);
            setMarkers((prev) =>
              prev.map((m) => {
                if (m.id === sid) return { ...m, connectedParent: marker.id };
                if (m.id === marker.id) return { ...m, connectedChild: sid };
                return m;
              })
            );
            setPendingSightingId(null);
            if (newSighting) {
              setAfterThankYou(() => () => { setSelectedChain(chain); setSelectedMarker(newSighting); });
            }
          }
          setThankYouVisible(true);
        }}
        onDismiss={() => {
          setSightingMatchVisible(false);
          setThankYouVisible(true);
        }}
      />

      <ThankYouModal
        visible={thankYouVisible}
        onClose={() => {
          setThankYouVisible(false);
          if (afterThankYou) {
            afterThankYou();
            setAfterThankYou(null);
          }
        }}
      />

      <ReportModal
        visible={reportVisible}
        imageUri={imageUri}
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
        onSubmit={handleSightingSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
