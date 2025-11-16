import { useQuery } from "convex/react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { api } from "../convex/_generated/api";
import { Card } from "./ui/card";

export default function SongPicker() {
  const songs = useQuery(api.songs.getAllSongs);
  return (
    <View className="gap-2 p-2 bg-transparent">
      {!songs && <Text className="text-muted-foreground">Loading songs…</Text>}
      {songs?.length === 0 && (
        <Text className="text-muted-foreground">No songs available.</Text>
      )}
      {songs && (
        <ScrollView
          style={{ height: 120, maxHeight: 180 }}
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
              onPress={() => {
                Alert.alert("Song selected", `${song.title} by ${song.artist}`);
              }}
            >
              <Card className="gap-0.5 m-0 p-2 bg-transparent">
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
