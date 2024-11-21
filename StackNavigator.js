import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';// Para crear la navegación en pestañas
import { createNativeStackNavigator } from '@react-navigation/native-stack';// Para crear la navegación con stack (pantallas apiladas)
import { NavigationContainer } from '@react-navigation/native';// Contenedor de navegación principal
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Ionicons from '@expo/vector-icons/Ionicons';

// Importa las pantallas que se usarán en la navegación
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import LikedSongsScreen from './screens/LikedSongsScreen';
import SongInfoScreen from './screens/SongInfoScreen';
import PlaylistDetailsScreen from './screens/PlaylistDetailScreen';
import MusicScreen from './screens/MusicaScreen';
import PlaylistSelectionScreen from './screens/PlaylistSelectionScreen';
import LocalPlaylistScreen from './screens/LocalPlaylistsScreen';
import LocalPlaylistDetail from './screens/LocalPlaylistDetail';

// Crea el componente de navegación en pestañas
const Tab = createBottomTabNavigator();

function BottomTab() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "rgba(0,0,0,5)",
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          shadowOpacity: 0.4,
          shadowRadius: 4,
          elevation: 4,
          shadowOffset: {
            width: 0,
            height: -4,
          },
          borderTopWidth: 0,
        },
        tabBarLabelStyle: { color: "white" },
      }}
    >
      {/* Pantalla de inicio */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <Entypo name="home" size={24} color="white" />
            ) : (
              <AntDesign name="home" size={24} color="gray" />
            ),
        }}
      />
      {/* Pantalla de perfil */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Perfil",
          headerShown: false,
          tabBarIcon: ({ focused }) =>
            focused ? (
              <FontAwesome6 name="person" size={24} color="white" />
            ) : (
              <Ionicons name="person-outline" size={24} color="gray" />
            ),
        }}
      />
    </Tab.Navigator>
  );
}


// Crea el stack de pantallas (navegación apilada)
const Stack = createNativeStackNavigator();

function Navigation() {
  return (
    // Contenedor de navegación que permite gestionar las pantallas de la app
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
            name = "Login" 
            component={LoginScreen} 
            options={{headerShown:false}}/>

        <Stack.Screen
          name="Main"
          component={BottomTab}
          options={{ headerShown: false }}
        />
        

        <Stack.Screen
          name="Liked"
          component={LikedSongsScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Info"
          component={SongInfoScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="PlaylistDetails" 
          component={PlaylistDetailsScreen} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="Music" 
          component={MusicScreen} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="PlaylistSelection" 
          component={PlaylistSelectionScreen} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="LocalPlaylist" 
          component={LocalPlaylistScreen} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen 
          name="LocalPlaylistDetail" 
          component={LocalPlaylistDetail} 
          options={{ headerShown: false }} 
        />  
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Navigation; // Exporta el componente de navegación como predeterminado