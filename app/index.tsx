import { useState } from "react";
import { Pressable, View } from "react-native";
import LocationMap from "../components/LocationMap";
import SongPicker from "../components/song-picker";
import { Text } from "../components/ui/text";
import "../global.css";

export default function Index() {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <View className="flex-1 bg-background">
      <LocationMap />
      <View
        pointerEvents="box-none"
        className="absolute inset-x-0 bottom-12 items-center"
      >
        {showPicker && (
          <View className="my-2 w-min max-h-[24rem] rounded-2xl border border-border bg-background/95 shadow-lg">
            <SongPicker />
          </View>
        )}
        <Pressable
          className="rounded-full px-4 py-2 border-2 bg-background/95"
          onPress={() => setShowPicker((prev) => !prev)}
        >
          <Text className="text-center text-base font-semibold text-primary">
            {showPicker ? "Close Song Picker" : "Open Song Picker"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
