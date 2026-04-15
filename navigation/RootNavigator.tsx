import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import { useAuth } from "../context/AuthContext";
import { ActivityIndicator, View } from "react-native";
import ParticipantsScreen from "@/screens/ParticipantsScreen";
import FeedbackScreen from "@/screens/FeedbackScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading, isParticipant } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size={30} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        isParticipant ? (
          // <Stack.Screen name="Participants" component={ParticipantsScreen} />
          <>
            <Stack.Screen name="Participants" component={ParticipantsScreen} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} />
          </>
        ) : (
          <Stack.Screen name="Home" component={HomeScreen} />
        )
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
