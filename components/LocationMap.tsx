import { useQuery } from "convex/react";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import "../global.css";

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

  // Match pins with their corresponding songs
  const pinsWithSongs = useMemo<PinWithSong[]>(() => {
    if (!pins || !songs) return [];

    return pins.map((pin) => {
      const song = songs.find((s) => s._id === pin.songId);
      return {
        ...pin,
        song: song || null,
      };
    });
  }, [pins, songs]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Permission to access location was denied");
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        onLocationChange?.({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
        setLoading(false);

        subscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (newLocation) => {
            setLocation(newLocation);
            onLocationChange?.({
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            });
          }
        );
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
            title={pin.song?.title || "Unknown Song"}
            description={
              pin.song ? `${pin.song.artist} - ${pin.song.album}` : pin.comment
            }
          />
        ))}
      </MapView>
    </View>
  );
}
