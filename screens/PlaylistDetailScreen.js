import { StyleSheet, Text, View, ScrollView, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Player } from '../PlayerContext';  // Importa el contexto del reproductor para manejar la canción actual
import { Audio } from 'expo-av';  // Importa la API de Expo para la reproducción de audio

const PAGE_SIZE = 25;  // Número de canciones por página para cargar

const PlaylistDetailsScreen = () => {
    // Obtiene los parámetros de la ruta, como el ID y nombre de la playlist
    const route = useRoute();
    const navigation = useNavigation();
    const { playlistId, playlistName } = route.params;

    // Estados de la aplicación
    const [tracks, setTracks] = useState([]);  // Lista de canciones de la playlist
    const [isLoading, setIsLoading] = useState(false);  // Estado de carga de canciones
    const [hasMore, setHasMore] = useState(true);  // Si hay más canciones por cargar
    const [currentPage, setCurrentPage] = useState(0);  // Página actual de canciones

    const { currentTrack, setCurrentTrack } = useContext(Player);  // Reproductor
    const [sound, setSound] = useState();  // Reproductor de sonido
    const [isPlaying, setIsPlaying] = useState(false);  // Si está reproduciendo una canción
    const [likedSongs, setLikedSongs] = useState([]);  // Canciones favoritas
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);  // Índice de la canción actual


    // Carga las canciones de la playlist y las canciones favoritas cuando cambia la página
    useEffect(() => {
        fetchTracks();
        loadLikedSongs();
    }, [currentPage]);

    // Función para obtener las canciones de la playlist
    const fetchTracks = async () => {
        if (isLoading || !hasMore) return; // No hace nada si está cargando o no hay más canciones
        setIsLoading(true);

        try {
            const accessToken = await AsyncStorage.getItem("token");  // Obtiene el token de acceso
            if (!playlistId) return console.log("No se encontró el playlistId");  // Verifica si existe el ID de la playlist

            // Calcula el offset para la paginación
            const offset = currentPage * PAGE_SIZE;
            const response = await fetch(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=${PAGE_SIZE}`,
                {
                    headers: { Authorization: `Bearer ${accessToken}` },  // Autenticación con el token
                }
            );

            if (!response.ok) throw new Error("Error al buscar la playlist");  // Si la respuesta no es OK, lanza un error

            const data = await response.json();  // Convierte la respuesta a JSON
            setTracks((prevTracks) => [...prevTracks, ...data.items.map(item => item.track)]);  // Añade las canciones al estado
            setHasMore(data.items.length === PAGE_SIZE);  // Verifica si hay más canciones para cargar
        } catch (err) {
            console.log(err.message);  // Si ocurre un error, lo muestra
        } finally {
            setIsLoading(false);  // Finaliza el estado de carga
        }
    };

    // Función para cargar las canciones favoritas del usuario
    const loadLikedSongs = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('token');
            const response = await fetch('https://api.spotify.com/v1/me/tracks?offset=0&limit=50', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!response.ok) throw new Error('Error al cargar las canciones favoritas');

            const data = await response.json();
            setLikedSongs(data.items.map(item => item.track)); // Guarda las canciones favoritas en el estado
        } catch (error) {
            console.error('Error al cargar canciones favoritas:', error);
        }
    };

    // Función para verificar si una canción es favorita
    const isFavorite = (trackId) => likedSongs.some((song) => song.id === trackId);

    // Función para agregar o quitar una canción de las favoritas
    const toggleFavorite = async (track) => {
        const accessToken = await AsyncStorage.getItem('token');
        const isFav = isFavorite(track.id);

        try {
            const method = isFav ? 'DELETE' : 'PUT'; // Define el método HTTP dependiendo de si es favorito o no
            const response = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${track.id}`, {
                method,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const e = await response.json();
                throw new Error(JSON.stringify(e));
            }
            
            // Actualiza la lista de canciones favoritas
            const updatedSongs = isFav
                ? likedSongs.filter((song) => song.id !== track.id)
                : [...likedSongs, track];

            setLikedSongs(updatedSongs);
            Alert.alert(isFav ? 'Eliminado' : 'Agregado', `${track.name} ha sido ${isFav ? 'eliminado' : 'agregado'} de tus favoritos.`);
        } catch (error) {
            console.error('Error al actualizar favorito:', error);
        }
    };

    // Función para reproducir una canción
    const playTrack = async (track, index) => {
        try {
            if (sound) {
                await sound.unloadAsync(); // Detiene la reproducción de la canción anterior
                setIsPlaying(false);
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: track.preview_url }, // Crea una instancia de sonido con la URL de la canción
                { shouldPlay: true }
            );

            setSound(newSound);
            setCurrentTrack(track);
            setCurrentTrackIndex(index);
            setIsPlaying(true);

            newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate); // Actualiza el estado de la reproducción

            console.log(`Reproduciendo: ${track.name}`);
        } catch (error) {
            console.error('Error al reproducir la pista:', error);
        }
    };

    // Función para actualizar el estado de la reproducción
    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            if (status.didJustFinish) {
                playNextTrack(); // Si terminó la canción, reproduce la siguiente
            }
        } else if (status.error) {
            console.error('Error en la reproducción:', status.error);
        }
    };

    // Función para reproducir la siguiente canción
    const playNextTrack = () => {
        const nextIndex = (currentTrackIndex + 1) % tracks.length;  // Cicla entre las canciones
        playTrack(tracks[nextIndex], nextIndex);
    };

    // Función para pausar o reproducir la canción actual
    const togglePlayPause = async () => {
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync(); // Si está reproduciendo, pausa la canción
                setIsPlaying(false);
            } else {
                await sound.playAsync(); // Si está pausado, reproduce la canción
                setIsPlaying(true);
            }
        }
    };

    // Función para verificar si la canción actual está siendo reproducida
    const isPlayingTrack = (trackId) => currentTrack && currentTrack.id === trackId;

    // Función para cargar más canciones al hacer scroll
    const loadMoreTracks = () => {
        if (hasMore && !isLoading) {
            setCurrentPage((prevPage) => prevPage + 1); // Aumenta la página actual
        }
    };

    return (
        <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
            <ScrollView 
                style={{ marginTop: 50 }}
                onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                    // Verifica si se llegó al final de la lista para cargar más canciones
                    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
                        loadMoreTracks();
                    }
                }}
                scrollEventThrottle={400}
            >
                <View style={{ flexDirection: 'row', padding: 12 }}>
                    <Ionicons onPress={() => navigation.goBack()} name="arrow-back" size={24} color="white" />
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Text style={styles.title}>{playlistName}</Text>
                    </View>
                </View>

                <Pressable onPress={togglePlayPause} style={styles.playButton}>
                    <AntDesign name={isPlaying ? "pause" : "play"} size={48} color="white" />
                </Pressable>

                <View>
                    {tracks.map((track, index) => (
                        <Pressable
                            key={index}
                            onPress={() => playTrack(track, index)}
                            style={styles.trackItem}
                        >
                            <Image
                                style={styles.trackImage}
                                source={{ uri: track.album?.images[0]?.url }}
                            />
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text
                                    style={[
                                        styles.trackName,
                                        isPlayingTrack(track.id) && styles.playingTrackName
                                    ]}
                                >
                                    {track.name}
                                </Text>
                                <View style={styles.artistContainer}>
                                    {track.artists.map((artist, artistIndex) => (
                                        <Text key={artistIndex} style={styles.artist}>
                                            {artist.name + (artistIndex < track.artists.length - 1 ? ', ' : '')}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                            <AntDesign
                                name={isFavorite(track.id) ? 'heart' : 'hearto'}
                                size={24}
                                color={isFavorite(track.id) ? '#1DB954' : 'white'}
                                onPress={() => toggleFavorite(track)}
                            />
                        </Pressable>
                    ))}
                </View>

                {isLoading && <ActivityIndicator size="large" color="#1DB954" style={{ marginVertical: 20 }} />}
            </ScrollView>
        </LinearGradient>
    );
};

export default PlaylistDetailsScreen;

const styles = StyleSheet.create({
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        marginHorizontal: 12,
        textAlign: 'center',
    },
    playButton: {
        alignItems: 'center',
        marginVertical: 20,
    },
    trackItem: {
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    trackName: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    playingTrackName: {
        color: '#1DB954',
        fontWeight: 'bold',
    },
    artistContainer: {
        flexDirection: 'row',
    },
    artist: {
        color: 'grey',
        fontSize: 12,
    },
    trackImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
});