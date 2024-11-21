import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  Button, 
  Alert, 
  TouchableOpacity 
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  // Estado para almacenar los datos del perfil del usuario y sus playlists
  const [userProfile, setUserProfile] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const navigation = useNavigation(); // Hook para navegar entre pantallas

  // Función que obtiene el perfil del usuario desde la API de Spotify
  const fetchProfile = async () => {
    const accessToken = await AsyncStorage.getItem("token");

    if (!accessToken) {
      console.error("No se encontró el token de acceso");
      return;
    }

    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` }, // Token de acceso en el encabezado
      });
      setUserProfile(response.data);// Almacena los datos del perfil en el estado
      console.log('Perfil del usuario:', response.data);
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
    }
  };

  // Función que obtiene las playlists del usuario desde la API de Spotify
  const getPlaylists = async () => {
    const accessToken = await AsyncStorage.getItem("token");
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
        headers: { Authorization: `Bearer ${accessToken}` },// Token de acceso en el encabezado
      });
      setPlaylists(response.data.items);// Almacena las playlists en el estado
      console.log('Playlists:', response.data.items);
    } catch (err) {
      console.log('Error al obtener las playlists:', err.message);
    }
  };

  // Función para cerrar sesión y eliminar el token de AsyncStorage
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");// Elimina el token de AsyncStorage
      Alert.alert("Sesión cerrada", "Has cerrado sesión correctamente.");// Muestra un mensaje de alerta
      navigation.replace("Login"); // Redirige a la pantalla de inicio de sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar sesión. Inténtalo de nuevo.");
    }
  };

  // useEffect para cargar el perfil y las playlists cuando se carga la pantalla
  useEffect(() => {
    fetchProfile(); // Obtiene los datos del perfil
    getPlaylists(); // Obtiene las playlists del usuario
  }, []);

  return (
    <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
      <View style={{ padding: 20 }}>
        <ScrollView style={{ marginTop: 50, marginBottom: 60 }}>
          <Text style={styles.title}>Perfil del Usuario</Text>
          <View style={{ padding: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Image
                style={{ width: 40, height: 40, borderRadius: 20 }}
                source={{ uri: userProfile?.images[0]?.url }}
              />
              <View>
                {userProfile && (
                  <View style={{ marginVertical: 10 }}>
                    <Text style={styles.userName}>{userProfile.display_name}</Text>
                    <Text style={styles.userEmail}>{userProfile.email}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Botón de Cerrar Sesión */}
          <Button title="Cerrar Sesión" onPress={logout} color="#FF5C5C" />

          {/* Mostrar playlists del usuario */}
          <Text style={styles.subtitle}>Tus Playlists:</Text>
          {playlists.map((playlist, index) => (
            <TouchableOpacity
              key={index}
              style={styles.playlistContainer}
              onPress={() =>
                navigation.navigate('PlaylistDetails', {
                  playlistId: playlist.id,
                  playlistName: playlist.name,
                })
              }
            >
              <Image 
                source={{ uri: playlist.images[0]?.url }} 
                style={styles.playlistImage} 
              />
              <View>
                <Text style={styles.playlistText}>{playlist.name}</Text>
                {playlist.followers?.total !== undefined && (
                  <Text style={styles.followersText}>
                    {playlist.followers.total} seguidores
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    color: 'gray',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 10,
  },
  playlistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  playlistImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  playlistText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  followersText: {
    fontSize: 14,
    color: 'gray',
  },
});