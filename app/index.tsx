import { useQuery } from "convex/react";
import { Text, View } from "react-native";
import { api } from "../convex/_generated/api";

export default function Index() {
  const tasks = useQuery(api.tasks.get);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
      {tasks?.map((task) => (
        <Text key={task._id}>{task.text}</Text>
      ))}
    </View>
  );
}
