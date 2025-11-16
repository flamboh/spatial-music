import { useQuery } from "convex/react";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
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
  } | null;
};

type LocationMapProps = {
  onLocationChange?: (location: {
    latitude: number;
    longitude: number;
  }) => void;
};

export default function LocationMap({ onLocationChange }: LocationMapProps) {
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
        },
      };
    });
  }, [pins, songs, imageUrls]);

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
        {pinsWithSongs.map((pin) => (
          <Marker
            key={pin._id}
            coordinate={{
              latitude: pin.latitude,
              longitude: pin.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            title={pin.song?.title}
            description={`${pin.song?.artist} - ${pin.song?.album}`}
          >
            {pin.song?.imageUrl ? (
              <RNImage
                source={{ uri: pin.song.imageUrl }}
                style={styles.markerImage}
                resizeMode="cover"
              />
            ) : null}
          </Marker>
        ))}
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
