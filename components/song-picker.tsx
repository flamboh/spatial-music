import { useQuery } from "convex/react";
import { ScrollView, Text, View } from "react-native";
import { api } from "../convex/_generated/api";
import { Card } from "./ui/card";

export default function SongPicker() {
  const songs = useQuery(api.songs.getAllSongs);
  return (
    <View className="gap-3 p-4">
      {!songs && <Text className="text-muted-foreground">Loading songs…</Text>}
      {songs?.length === 0 && (
        <Text className="text-muted-foreground">No songs available.</Text>
      )}
      {songs && (
        <ScrollView
          style={{ height: 220, maxHeight: 320 }}
          contentContainerStyle={{ gap: 6, paddingBottom: 8 }}
          showsVerticalScrollIndicator
          scrollEnabled
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          overScrollMode="always"
          bounces
          scrollEventThrottle={16}
        >
          {songs.map((song) => (
            <Card key={song._id} className="gap-0.5">
              <Text className="text-lg font-semibold text-foreground">
                {song.title}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {song.artist}
              </Text>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
