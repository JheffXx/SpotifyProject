import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    Pressable,
    FlatList,
    SafeAreaView,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient'; // Para crear un fondo con gradiente
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para almacenar datos de forma local (token)
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'; // Iconos de Material Design
import AntDesign from '@expo/vector-icons/AntDesign'; // Iconos de AntDesign
import axios from 'axios'; // Para hacer peticiones HTTP
import ArtistCard from '../components/ArtistCard'; // Componente para mostrar artistas
import RecentlyPlayedCard from '../components/RecentlyPlayedCard'; // Componente para mostrar canciones escuchadas recientemente
import { useNavigation } from '@react-navigation/native'; // Para la navegación entre pantallas

const HomeScreen = () => {
    // Estado para almacenar los datos del perfil del usuario
    const [userProfile, setUserProfile] = useState(null);
    // Navegación de React Navigation
    const Navigation = useNavigation();
    // Estado para almacenar las canciones recientemente reproducidas
    const [recentlyPlayed, setRecentlyPlayed] = useState([]);
    // Estado para almacenar los artistas más escuchados
    const [topArtists, setTopArtists] = useState([]); 

    // Función para mostrar un mensaje de saludo basado en la hora del día
    const greetingMessage = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos Días 🌤️';
        if (hour < 18) return 'Buenas Tardes 🌇';
        return 'Buenas Noches 🌃';
    };

     // Función para obtener el perfil del usuario desde la API de Spotify
    const fetchProfile = async () => {
        const token = await AsyncStorage.getItem('token'); // Obtener token almacenado
        try {
            const response = await axios.get('https://api.spotify.com/v1/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserProfile(response.data); // Guardar los datos del perfil
            console.log('Perfil del usuario:', response.data);
        } catch (error) {
            console.error('Error al obtener el perfil:', error);
        }
    };
    
     // Función para obtener las canciones recientemente reproducidas
    const fetchRecentlyPlayed = async () => {
        const token = await AsyncStorage.getItem('token');// Obtener token almacenado
        try {
            const response = await axios.get(
                'https://api.spotify.com/v1/me/player/recently-played?limit=4',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setRecentlyPlayed(response.data.items);// Guardar canciones recientes
            console.log('Canciones reproducidas recientemente:', response.data.items);
        } catch (error) {
            console.error('Error al obtener canciones:', error);
        }
    };
    
    // Función para obtener los artistas más populares
    const fetchTopArtists = async () => {
        const token = await AsyncStorage.getItem('token');
        try {
            const response = await axios.get(
                'https://api.spotify.com/v1/artists?ids=1dfeR4HaWDbWqFHLkxsg1d,3TVXtAsR1Inumwj472S9r4,06HL4z0CvFAxyc27GXpf02',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setTopArtists(response.data.artists); // Guardar artistas top
            console.log('Artistas top globales:', response.data.artists); 
        } catch (error) {
            console.error('Error al obtener artistas:', error);
        }
    };
    
     // useEffect se ejecuta al montar el componente, obteniendo los datos
    useEffect(() => {
        fetchProfile(); // Obtener perfil de usuario
        fetchRecentlyPlayed(); // Obtener canciones recientemente reproducidas
        fetchTopArtists(); // Obtener artistas top
    }, []);

    // Renderizado de cada ítem en la lista de canciones recientemente reproducidas
    const renderRecentlyPlayed = ({ item }) => (
        <Pressable style={styles.songItem}>
            <Image style={styles.songImage} source={{ uri: item.track.album.images[0].url }} />
            <View style={styles.songInfo}>
                <Text numberOfLines={2} style={styles.songTitle}>
                    {item.track.name}
                </Text>
            </View>
        </Pressable>
    );

     // Si no se ha cargado el perfil del usuario, se muestra un mensaje de carga
    if (!userProfile) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Cargando perfil...</Text>
            </View>
        );
    }

    return (
        <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.profileWrapper}>
                    <View style={styles.profileContent}>
                        {userProfile.images?.[0] && (
                            <Image
                                style={styles.profileImage}
                                source={{ uri: userProfile.images[0].url }}
                            />
                        )}
                        <Text style={styles.greetingText}>{greetingMessage()}</Text>
                        <MaterialCommunityIcons
                            name="lightning-bolt-outline"
                            size={24}
                            color="white"
                        />
                    </View>
                </View>
            </SafeAreaView>

            <ScrollView style={{ marginTop: 20 , marginBottom:80}}>
                <View style={styles.buttonsContainer}>
                <Pressable
                    onPress={() => Navigation.navigate("Music")} // Navega a la pantalla de música
                    style={styles.button}
                >
                        <Text style={styles.buttonText}>Música</Text>
                    </Pressable>
                    <Pressable 
                    onPress={() => Navigation.navigate("LocalPlaylist")} // Navega a la pantalla de playlists locales
                    style={styles.button}>
                        <Text style={styles.buttonText}>Local PlayLists</Text>
                    </Pressable>
                </View>

                <View style={styles.likesContainer}>
                    {/* Botón para acceder a los "Me Gusta" */}
                    <Pressable 
                    onPress={() => Navigation.navigate("Liked")}
                    style={styles.likesButton}>
                        <LinearGradient
                            colors={['#33006F', '#FFFFFF']}
                            style={styles.iconBackground}
                        >
                            <AntDesign name="heart" size={24} color="white" />
                        </LinearGradient>
                        <Text style={styles.likesText}>Tus "Me Gusta"</Text>
                    </Pressable>

                    {/* Botón adicional con una imagen */}
                    <View style={styles.likesButton}>
                        <Image
                            style={{ width: 55, height: 55 }}
                            source={{ uri: 'https://i.pravatar.cc/100' }}
                        />
                        <Text style={styles.likesText}>Hip Hop</Text>
                    </View>
                </View>
                
                {/* Lista de canciones recientemente reproducidas */}
                <FlatList
                    data={recentlyPlayed}
                    renderItem={renderRecentlyPlayed}
                    keyExtractor={(item) => item.track.id}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={{ paddingHorizontal: 10 }}
                    scrollEnabled={false}
                />

                {/* Sección de artistas top */} 
                <Text style={styles.sectionTitle}>Artistas Top</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {topArtists.map((item, index) => (
                        <ArtistCard item={item} key={index} />
                    ))}
                </ScrollView>

                {/* Sección de canciones escuchadas recientemente */}
                <Text style={styles.sectionTitle}>Escuchados Recientemente</Text>
                <FlatList
                    data={recentlyPlayed}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <RecentlyPlayedCard item={item} key={index} />
                    )}
                    keyExtractor={(item) => item.track.id}
                />
            </ScrollView>
        </LinearGradient>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#040306',
    },
    loadingText: {
        color: 'white',
        fontSize: 20,
    },
    safeArea: {
        flex: 0,
    },
    profileWrapper: {
        paddingHorizontal: 20,
    },
    profileContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    greetingText: {
        marginLeft: 10,
        fontSize: 20,
        color: 'white',
        flex: 1,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    button: {
        backgroundColor: '#282828',
        padding: 10,
        borderRadius: 30,
        width: '40%',
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
    likesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginVertical: 10,
    },
    likesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#202020',
        borderRadius: 4,
        padding: 8,
        justifyContent:"space-between",
    },
    iconBackground: {
        width: 55,
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
    },
    likesText: {
        color: 'white',
        marginLeft: 10,
    },
    songItem: {
        flex: 1,
        flexDirection: 'row',
        margin: 8,
        backgroundColor: '#282828',
        borderRadius: 4,
        padding: 8,
        height: 80,
    },
    songImage: {
        width: 55,
        height: 55,
        borderRadius: 4,
    },
    songInfo: {
        flex: 1,
        marginHorizontal: 8,
        justifyContent: 'center',
    },
    songTitle: {
        color: 'white',
        fontWeight: 'bold',
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 22,
        color: 'white',
        marginLeft: 10,
        marginTop: 20,
    },
});