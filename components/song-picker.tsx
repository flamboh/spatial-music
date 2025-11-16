import { useQuery } from "convex/react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { api } from "../convex/_generated/api";
import { Card } from "./ui/card";

type SongPickerProps = {
  onSongSelected?: (song: {
    id: string;
    title?: string;
    artist?: string;
  }) => void;
};

export default function SongPicker({ onSongSelected }: SongPickerProps) {
  const songs = useQuery(api.songs.getAllSongs);
  return (
    <View className="gap-2 bg-transparent p-2">
      {!songs && (
        <Text className="h-[160px] w-72 text-muted-foreground">
          Loading songs…
        </Text>
      )}
      {songs?.length === 0 && (
        <Text className="h-[160px] w-64 text-muted-foreground">
          No songs available.
        </Text>
      )}
      {songs && (
        <ScrollView
          style={{ height: 100, maxHeight: 160, width: 288 }}
          contentContainerStyle={{ gap: 2, paddingBottom: 8 }}
          showsVerticalScrollIndicator
          scrollEnabled
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          overScrollMode="always"
          bounces
          scrollEventThrottle={16}
        >
          {songs.map((song) => (
            <Pressable
              key={song._id}
              onPress={() =>
                onSongSelected?.({
                  id: song._id,
                  title: song.title,
                  artist: song.artist,
                })
              }
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                  backgroundColor: pressed ? "rgba(0,0,0,0.08)" : "transparent",
                },
              ]}
              className="rounded-xl bg-background/95"
            >
              <Card className="m-0 gap-0.5 bg-transparent p-2">
                <Text className="text-lg font-semibold text-foreground">
                  {song.title}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {song.artist}
                </Text>
              </Card>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
