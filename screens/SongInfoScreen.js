import { StyleSheet, Text, View, ScrollView, Pressable, Image, Alert } from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Player } from '../PlayerContext';
import { Audio } from 'expo-av';

const SongInfoScreen = () => {
    // Accede a los parámetros de la ruta y a la navegación
    const route = useRoute();
    const navigation = useNavigation();

    // Obtener el ID del álbum desde los parámetros de la ruta
    const albumUrl = route?.params?.item?.track?.album?.uri;
    const albumId = albumUrl ? albumUrl.split(":")[2] : null;


    // Estado para manejar las canciones, si está reproduciendo, canciones favoritas...
    const [tracks, setTracks] = useState([]);
    const { currentTrack, setCurrentTrack } = useContext(Player);
    const [sound, setSound] = useState();
    const [isPlaying, setIsPlaying] = useState(false);
    const [likedSongs, setLikedSongs] = useState([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

    // Fetch y carga las canciones favoritas cuando se obtienen los datos del álbum
    useEffect(() => {
        fetchSongs(); // Obtener las canciones del álbum
        loadLikedSongs(); // Cargar canciones favoritas del usuario
    }, [albumId]); // Dependencia de albumId para hacer las peticiones cuando cambie


    // Función para obtener las canciones de un álbum a partir de la API de Spotify
    const fetchSongs = async () => {
        const accessToken = await AsyncStorage.getItem("token");// Obtener el token de acceso almacenado
        if (!albumId) return console.log("No se encontró el albumId");// Validar si se obtuvo un ID de álbum válido

        try {
            const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
                headers: { Authorization: `Bearer ${accessToken}` }, // Pasar token de autorización
            });
            if (!response.ok) throw new Error("Error al buscar el álbum");

            const data = await response.json();
            setTracks(data.items);// Almacenar las canciones del álbum
        } catch (err) {
            console.log(err.message);// En caso de error, lo mostramos en consola
        }
    };

    // Función para cargar las canciones favoritas del usuario
    const loadLikedSongs = async () => {
        try {
            const accessToken = await AsyncStorage.getItem('token'); // Obtener el token de acceso
            const response = await fetch('https://api.spotify.com/v1/me/tracks?offset=0&limit=50', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (!response.ok) throw new Error('Error al cargar las canciones favoritas');

            const data = await response.json();
            setLikedSongs(data.items.map(item => item.track));// Extraer solo las canciones (sin metadata extra)
        } catch (error) {
            console.error('Error al cargar canciones favoritas:', error);
        }
    };

    // Función para verificar si una canción es favorita
    const isFavorite = (trackId) => likedSongs.some((song) => song.id === trackId);

    // Función para alternar el estado de favorito para una canción
    const toggleFavorite = async (track) => {
        const accessToken = await AsyncStorage.getItem('token'); // Obtenemos el token de acceso del almacenamiento local
        const isFav = isFavorite(track.id); // Verificamos si la canción ya es favorita
    
        try {
            const method = isFav ? 'DELETE' : 'PUT'; // Si ya es favorita, preparamos una solicitud DELETE, de lo contrario, usamos PUT
            const response = await fetch(`https://api.spotify.com/v1/me/tracks?ids=${track.id}`, {
                method, // Usamos el método correspondiente (DELETE o PUT)
                headers: {
                    Authorization: `Bearer ${accessToken}`, // Autorización con el token de acceso
                    'Content-Type': 'application/json', // Especificamos el tipo de contenido
                },
            });
    
            if (!response.ok) 
                {
                    const e = await response.json();
                    throw new Error(JSON.stringify(e));
                 } // Si la respuesta no es exitosa, lanzamos un error
            
            const updatedSongs = isFav
                ? likedSongs.filter((song) => song.id !== track.id) // Si es favorita, eliminamos de la lista
                : [...likedSongs, track]; // Si no es favorita, la añadimos a la lista
    
            setLikedSongs(updatedSongs); // Actualizamos el estado con la nueva lista de canciones favoritas
            Alert.alert(isFav ? 'Eliminado' : 'Agregado', `${track.name} ha sido ${isFav ? 'eliminado' : 'agregado'} de tus favoritos.`); // Mostramos un mensaje al usuario
        } catch (error) {
            console.error('Error al actualizar favorito:', error); // Imprimimos el error en la consola
        }
    };

    const playTrack = async (track, index) => {
        try {
            if (!track.preview_url) {
                console.log("No preview URL disponible para esta canción");
                return; // Salir si no hay URL de vista previa
            }
    
            if (sound) {
                await sound.unloadAsync(); // Libera el sonido previo
                setIsPlaying(false); // Asegúrate de que el estado se actualice
            }
    
            // Crear un nuevo sonido
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: track.preview_url },
                { shouldPlay: true }
            );
    
            setSound(newSound); // Establece el sonido actual
            setCurrentTrack(track); // Establece la canción actual
            setCurrentTrackIndex(index); // Establece el índice de la pista
            setIsPlaying(true); // Marca como en reproducción
    
            newSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate); // Actualiza el estado de la reproducción
    
            console.log(`Reproduciendo: ${track.name}`);
        } catch (error) {
            console.error('Error al reproducir la pista:', error);
        }
    };

        // Función de actualización del estado de la reproducción
    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            console.log(`Progreso: ${status.positionMillis} / ${status.durationMillis}`);
            if (status.didJustFinish) {
                playNextTrack();// Reproducir la siguiente pista si terminó
            }
        } else if (status.error) {
            console.error('Error en la reproducción:', status.error);
        }
    };

    // Función para reproducir la siguiente canción en la lista
    const playNextTrack = () => {
        const nextIndex = (currentTrackIndex + 1) % tracks.length;
        playTrack(tracks[nextIndex], nextIndex);// Reproducir la siguiente canción
    };

    // Función para alternar entre reproducir y pausar
    const togglePlayPause = async () => {
        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync(); // Pausar la reproducción
                setIsPlaying(false);
            } else {
                await sound.playAsync();// Reanudar la reproducción
                setIsPlaying(true);
            }
        }
    };

     // Verificar si la canción actual está siendo reproducida
    const isPlayingTrack = (trackId) => currentTrack && currentTrack.id === trackId;

    return (
        <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
            <ScrollView style={{ marginTop: 50 }}>
                <View style={{ flexDirection: 'row', padding: 12 }}>
                    <Ionicons onPress={() => navigation.goBack()} name="arrow-back" size={24} color="white" />
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Image
                            style={{ width: 200, height: 200, borderRadius: 8 }}
                            source={{ uri: route?.params?.item?.track?.album.images[0]?.url }}
                        />
                    </View>
                </View>

                <Text style={styles.title}>{route?.params?.item?.track?.album?.name}</Text>

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
                            <View>
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
            </ScrollView>
        </LinearGradient>
    );
};

export default SongInfoScreen;

const styles = StyleSheet.create({
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        marginHorizontal: 12,
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
        flexWrap: 'wrap',
    },
    artist: {
        color: '#909090',
        fontSize: 13,
    },
});