import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import LocationMap from "../components/LocationMap";
import SongPicker from "../components/song-picker";
import { Text } from "../components/ui/text";
import { api } from "../convex/_generated/api";
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
  const createPin = useMutation(api.pins.createPin);

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
  return (
    <View className="flex-1 bg-background">
      <LocationMap onLocationChange={setLocation} />
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
        className="absolute inset-x-0 bottom-12 items-center"
      >
        {location && (
          <View className="p-2">
            <Text className="text-muted-foreground">
              Location: {location.latitude}, {location.longitude}
            </Text>
          </View>
        )}
        {showPicker && (
          <View className="my-2 w-min max-h-[24rem] rounded-2xl border border-border bg-background/95 shadow-lg">
            <SongPicker onSongSelected={handleSongSelected} />
          </View>
        )}
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
  );
}
