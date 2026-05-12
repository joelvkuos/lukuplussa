import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#D1F0FD',
        tabBarInactiveTintColor: '#5c5a54',
        tabBarStyle: {
          backgroundColor: '#292825',
          position: 'absolute',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Koti',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="terminology"
        options={{
          title: 'Terminologia',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="flashcards"
        options={{
          title: 'Muistikortit',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'layers' : 'layers-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Kirjasto",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "library" : "library-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}