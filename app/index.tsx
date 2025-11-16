import { Pressable, View } from "react-native";
import SongPicker from "../components/song-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { Text } from "../components/ui/text";
import "../global.css";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-end bg-background px-4 pb-10">
      <Popover>
        <PopoverTrigger asChild>
          <Pressable className="rounded-full bg-primary px-4 py-2">
            <Text className="text-center text-base font-semibold text-primary-foreground">
              Open Song Picker
            </Text>
          </Pressable>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          sideOffset={12}
          className="w-80 max-h-[20rem] p-0"
        >
          <SongPicker />
        </PopoverContent>
      </Popover>
    </View>
  );
}
