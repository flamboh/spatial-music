import { useQuery } from "convex/react";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image as RNImage,
  StyleSheet,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import "../global.css";
import { Text } from "./ui/text";

// Type for pin with associated song data
type PinWithSong = {
  _id: Id<"pins">;
  latitude: number;
  longitude: number;
  comment: string;
  songId: Id<"songs">;
  song: {
    _id: Id<"songs">;
    title: string;
    audioStorageId: Id<"_storage">;
    imageStorageId: Id<"_storage">;
    artist: string;
    album: string;
    imageUrl?: string;
    bpm?: number;
  } | null;
};

type LocationMapProps = {
  onLocationChange?: (location: {
    latitude: number;
    longitude: number;
  }) => void;
  activePinId?: Id<"pins"> | null;
  isPlaying?: boolean;
};

export default function LocationMap({
  onLocationChange,
  activePinId,
  isPlaying = false,
}: LocationMapProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  // Query pins and songs from Convex
  const pins = useQuery(api.pins.getAllPins);
  const songs = useQuery(api.songs.getAllSongs);

  const imageUrls = useQuery(api.songs.getAllImageUrls);

  // Match pins with their corresponding songs and add image URLs
  const pinsWithSongs = useMemo(() => {
    if (!pins || !songs || !imageUrls) return [];

    return pins.map((pin): PinWithSong => {
      const song = songs.find((s) => s._id === pin.songId);
      if (!song) {
        return {
          ...pin,
          song: null,
        };
      }

      const imageUrl = imageUrls[song._id];

      return {
        ...pin,
        song: {
          ...song,
          imageUrl: imageUrl ?? undefined,
          bpm: song.bpm,
        },
      };
    });
  }, [pins, songs, imageUrls]);

  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  const activeBpm = useMemo(() => {
    const activePin = pinsWithSongs.find((p) => p._id === activePinId);
    return activePin?.song?.bpm ?? null;
  }, [activePinId, pinsWithSongs]);

  useEffect(() => {
    if (!activePinId || !isPlaying) {
      pulseAnim.setValue(1);
      return;
    }
    const beatMs = activeBpm ? 60000 / activeBpm : 1200;
    const outDuration = Math.max(150, Math.round(beatMs * 0.6));
    const inDuration = Math.max(150, Math.round(beatMs * 0.4));
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: outDuration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: inDuration,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => {
      pulse.stop();
      pulseAnim.setValue(1);
    };
  }, [activePinId, activeBpm, pulseAnim, isPlaying]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        setLocation(currentLocation);
        onLocationChange?.({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        setLoading(false);

        subscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000,
            distanceInterval: 1,
            mayShowUserSettingsDialog: true,
          },
          (newLocation) => {
            setLocation(newLocation);
            onLocationChange?.({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            });
          }
        );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("Failed to get location");
        setLoading(false);
      }
    })();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
      }
    };
  }, [onLocationChange]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2.5 text-base">Finding your location...</Text>
      </View>
    );
  }

  if (error || !location) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-base text-center text-red-500">
          {error || "Location not available"}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapView
        provider="google"
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {pinsWithSongs.map((pin) => {
          const isActive = pin._id === activePinId;
          const MarkerContent = (
            <>
              <View style={styles.markerWrapper}>
                {pin.song?.imageUrl ? (
                  <RNImage
                    source={{ uri: pin.song.imageUrl }}
                    style={styles.markerImage}
                    resizeMode="cover"
                  />
                ) : null}
              </View>
            </>
          );

          return (
            <Marker
              key={pin._id}
              coordinate={{
                latitude: pin.latitude,
                longitude: pin.longitude,
              }}
              anchor={{ x: 0.5, y: 0.5 }}
              title={pin.song?.title}
              description={`${pin.song?.artist} - ${pin.comment ?? ""}`}
              style={{ overflow: "visible" }}
            >
              {isActive ? (
                <Animated.View
                  style={{
                    transform: [{ scale: pulseAnim }],
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "visible",
                    zIndex: 2,
                  }}
                >
                  {MarkerContent}
                </Animated.View>
              ) : (
                MarkerContent
              )}
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  markerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  markerWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "visible",
    alignItems: "center",
    justifyContent: "center",
  },
  calloutContainer: {
    flex: 0,
    padding: 12,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  calloutTitle: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  calloutSubtitle: {
    color: "#000",
    fontSize: 14,
  },
});
