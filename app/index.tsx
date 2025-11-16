import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Pause, Play } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import LocationMap from "../components/LocationMap";
import SongPicker from "../components/song-picker";
import { Text } from "../components/ui/text";
import { api } from "../convex/_generated/api";
import { useCrossfadeAudio } from "../hooks/useCrossfadeAudio";
import "../global.css";

export default function Index() {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedSong, setSelectedSong] = useState<{
    id: string;
    title?: string;
    artist?: string;
  } | null>(null);
  const [comment, setComment] = useState("");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const pins = useQuery(api.pins.getAllPins);
  const createPin = useMutation(api.pins.createPin);
  const { crossfadeTo, togglePause, isPaused } = useCrossfadeAudio();
  const lastUrlRef = useRef<string | null>(null);

  const handleSongSelected = (song: {
    id: string;
    title?: string;
    artist?: string;
  }) => {
    setSelectedSong(song);
  };

  const handlePostPin = async () => {
    if (!location || !selectedSong) return;
    try {
      await createPin({
        latitude: location.latitude,
        longitude: location.longitude,
        comment: comment.trim() || "Pinned from song picker",
        songId: selectedSong.id as Id<"songs">,
      });
      setComment("");
      setSelectedSong(null);
      setShowPicker(false);
    } catch (error) {
      console.error("Failed to create pin", error);
    }
  };

  const nearestPin = useMemo(() => {
    if (!pins || !location) return null;
    return pins.reduce<null | (typeof pins)[number]>((closest, pin) => {
      if (!closest) return pin;
      const d1 =
        Math.pow(pin.latitude - location.latitude, 2) +
        Math.pow(pin.longitude - location.longitude, 2);
      const d2 =
        Math.pow(closest.latitude - location.latitude, 2) +
        Math.pow(closest.longitude - location.longitude, 2);
      return d1 < d2 ? pin : closest;
    }, null);
  }, [pins, location]);

  const nearestSong = useQuery(
    api.songs.getSong,
    nearestPin ? { id: nearestPin.songId as Id<"songs"> } : "skip"
  );
  const audioUrl = useQuery(
    api.songs.getAudioUrl,
    nearestSong?.audioStorageId
      ? { id: nearestSong.audioStorageId as Id<"_storage"> }
      : "skip"
  );

  useEffect(() => {
    if (audioUrl && audioUrl !== lastUrlRef.current) {
      lastUrlRef.current = audioUrl;
      crossfadeTo(audioUrl, {
        currentBpm: nearestSong?.bpm,
        nextBpm: nearestSong?.bpm,
      });
    }
  }, [audioUrl, crossfadeTo, nearestSong?.bpm]);

  return (
    <View className="flex-1 bg-background">
      <LocationMap
        onLocationChange={setLocation}
        activePinId={nearestPin?._id ?? null}
        isPlaying={!isPaused && !!audioUrl}
      />
      {/* Centered form overlay */}
      <View
        pointerEvents="box-none"
        className="absolute inset-0 items-center justify-center"
      >
        {selectedSong && (
          <View className="pointer-events-auto w-80 max-w-full rounded-2xl border border-border bg-background/95 p-4 shadow-lg">
            <Text className="text-base font-semibold text-foreground">
              {selectedSong.title || "Selected song"}
            </Text>
            {selectedSong.artist && (
              <Text className="text-sm text-muted-foreground">
                {selectedSong.artist}
              </Text>
            )}
            <TextInput
              className="mt-3 rounded-lg border border-border bg-background px-3 py-2 text-foreground"
              placeholder="Add a comment"
              placeholderTextColor="#6b7280"
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <Pressable
              className="mt-3 rounded-full bg-primary px-4 py-2 disabled:opacity-50"
              onPress={handlePostPin}
              disabled={!location}
            >
              <Text className="text-center text-base font-semibold text-primary-foreground">
                Post pin
              </Text>
            </Pressable>
            <Pressable
              className="absolute right-3 top-3 rounded-full border border-border bg-background px-2 py-1"
              onPress={() => setSelectedSong(null)}
            >
              <Text className="text-sm font-semibold text-foreground">✕</Text>
            </Pressable>
            {!location && (
              <Text className="mt-2 text-xs text-red-500">
                Waiting for location before posting.
              </Text>
            )}
          </View>
        )}
      </View>
      {/* Bottom controls */}
      <View
        pointerEvents="box-none"
        className="absolute inset-x-0 bottom-12 items-center px-4 w-full"
      >
        {showPicker && (
          <View className="my-2 w-min max-h-[24rem] rounded-2xl border border-border bg-background/95 shadow-lg">
            <SongPicker onSongSelected={handleSongSelected} />
          </View>
        )}
        <View className="relative w-full items-center justify-center">
          <Pressable
            className="absolute left-0 rounded-full bg-black p-4"
            onPress={async () => {
              if (!audioUrl) return;
              togglePause();
            }}
            disabled={!audioUrl}
          >
            {isPaused ? (
              <Play color="#fff" size={18} />
            ) : (
              <Pause color="#fff" size={18} />
            )}
          </Pressable>
          <Pressable
            className="rounded-full border-2 bg-background/95 px-4 py-2"
            onPress={() => {
              setShowPicker((prev) => {
                const next = !prev;
                if (!next) {
                  setSelectedSong(null);
                }
                return next;
              });
            }}
          >
            <Text className="text-center text-base font-semibold text-primary">
              Song Picker
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
