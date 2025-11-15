import { useQuery } from "convex/react";
import { useAudioPlayer } from "expo-audio";
import { Button, Text, View } from "react-native";
import { api } from "../convex/_generated/api";
import "../global.css";

export default function Index() {
  const pins = useQuery(api.pins.getAllPins);
  // Convex function that uses the id from the first pin, but only runs if the id is present
  const song = useQuery(
    api.songs.getSong,
    pins && pins[0] && pins[0].songId ? { id: pins[0].songId } : "skip"
  );
  const audioUrl = useQuery(
    api.songs.getAudioUrl,
    song && song.storageId ? { id: song.storageId } : "skip"
  );
  const player = useAudioPlayer(audioUrl);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text className="text-red-500 text-2xl font-bold">
        Edit app/index.tsx to edit this screen.
      </Text>
      {pins?.map((pin) => (
        <Text key={pin._id}>
          {pin.comment} {pin.songId} {pin.latitude} {pin.longitude}
        </Text>
      ))}
      {song && <Text>{song.title}</Text>}
      {audioUrl && <Text>{audioUrl}</Text>}
      <View>
        <Button title="Play Sound" onPress={() => player.play()} />
        <Button
          title="Replay Sound"
          onPress={() => {
            player.seekTo(0);
            player.play();
          }}
        />
      </View>
    </View>
  );
}
