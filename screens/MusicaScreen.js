import React, { useState, useEffect, useRef } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    Pressable,
    FlatList,
    Alert,
    TextInput,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker'; // Importamos DocumentPicker para seleccionar archivos de audio
import { Audio } from 'expo-av'; // Importamos el módulo para reproducir audio
import AsyncStorage from '@react-native-async-storage/async-storage'; // Usamos AsyncStorage para almacenar datos localmente
import { useNavigation } from '@react-navigation/native'; // Para la navegación en la aplicación
import { Ionicons } from '@expo/vector-icons'; // Iconos de Ionicons para la interfaz
import Slider from '@react-native-community/slider'; // Slider para mostrar el progreso de la canción

const MusicScreen = () => {
    const navigation = useNavigation(); // Inicializamos la navegación
    const [songs, setSongs] = useState([]); // Estado para almacenar las canciones
    const [filteredSongs, setFilteredSongs] = useState([]); // Estado para almacenar las canciones filtradas por búsqueda
    const [searchTerm, setSearchTerm] = useState(''); // Estado para almacenar el término de búsqueda
    const [currentSound, setCurrentSound] = useState(null); // Estado para manejar el sonido actual que se reproduce
    const [currentSong, setCurrentSong] = useState(null); // Estado para manejar la canción actual
    const [playing, setPlaying] = useState(false); // Estado para determinar si la canción está reproduciéndose
    const [progress, setProgress] = useState(0); // Estado para mostrar el progreso de la canción
    const intervalRef = useRef(null); // Referencia para controlar el intervalo de actualización del progreso


    // Nueva variable de estado para las playlists
    const [playlists, setPlaylists] = useState([]);

    // useEffect que carga las canciones y playlists cuando la pantalla se monta
    useEffect(() => {
        loadSongs(); // Carga las canciones desde AsyncStorage
        loadPlaylists();  // Carga las playlists desde AsyncStorage
    }, []);

    // useEffect para actualizar el estado cuando el sonido cambia
    useEffect(() => {
        if (currentSound) {
            currentSound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate); // Establece el callback para el estado de la reproducción
        }
    }, [currentSound]);

   // useEffect que filtra las canciones según el término de búsqueda
    useEffect(() => {
        const filtered = songs.filter((song) =>
            song.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSongs(filtered); // Actualiza las canciones filtradas
    }, [searchTerm, songs]);

    // Función para cargar las canciones desde AsyncStorage
    const loadSongs = async () => {
        try {
            const storedSongs = await AsyncStorage.getItem('songs');
            if (storedSongs) setSongs(JSON.parse(storedSongs)); // Establece las canciones si existen
        } catch (error) {
            console.error('Error al cargar canciones:', error); // Maneja el error si falla la carga
        }
    };

    // Función para guardar las canciones en AsyncStorage
    const saveSongs = async (newSongs) => {
        try {
            await AsyncStorage.setItem('songs', JSON.stringify(newSongs)); // Guarda las canciones actualizadas
        } catch (error) {
            console.error('Error al guardar canciones:', error); // Maneja el error si falla la guardada
        }
    };

     // Función para cargar las playlists desde AsyncStorage
     const loadPlaylists = async () => {
        try {
            const storedPlaylists = await AsyncStorage.getItem('localPlaylists');
            if (storedPlaylists) setPlaylists(JSON.parse(storedPlaylists)); // Establece las playlists si existen
        } catch (error) {
            console.error('Error al cargar playlists:', error); // Maneja el error si falla la carga
        }
    };

     // Función para guardar las playlists en AsyncStorage
     const savePlaylists = async (newPlaylists) => {
        if (!newPlaylists || newPlaylists.length === 0) {
            console.error('No hay playlists para guardar'); // Si no hay playlists, no guardamos nada
            return;
        }
        try {
            await AsyncStorage.setItem('localPlaylists', JSON.stringify(newPlaylists)); // Guarda las playlists actualizadas
        } catch (error) {
            console.error('Error al guardar las playlists locales:', error); // Maneja el error si falla la guardada
        }
    };

    // Función para seleccionar un archivo de audio (MP3 o WAV) desde el dispositivo
    const selectFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['audio/mpeg', 'audio/wav'],
            });

            if (!result.canceled) {
                const { uri, name } = result.assets[0];
                const newSong = {
                    uri,
                    name,
                    artist: 'Artista Desconocido',
                };
                const updatedSongs = [...songs, newSong]; // Agrega la nueva canción al estado
                setSongs(updatedSongs);
                await saveSongs(updatedSongs); // Guarda las canciones actualizadas en AsyncStorage
            } else {
                Alert.alert('No se seleccionó ningún archivo'); // Muestra un mensaje si no se seleccionó ningún archivo
            }
        } catch (error) {
            console.error('Error al seleccionar el archivo:', error); // Maneja el error si ocurre algún problema al seleccionar el archivo
        }
    };


    // Función para reproducir una canción
    const playSong = async (song) => {
        if (currentSound) {
            await currentSound.unloadAsync(); // Si ya hay una canción sonando, la descargamos
            setCurrentSound(null);
            setPlaying(false);
        }

        const { sound } = await Audio.Sound.createAsync(
            { uri: song.uri },
            { shouldPlay: true } // Inicia la reproducción de la canción
        );
        setCurrentSound(sound);
        setCurrentSong(song);
        setPlaying(true); // Marca que estamos reproduciendo
    };

    // Función que actualiza el progreso de la canción en reproducción
    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setProgress(status.positionMillis / status.durationMillis); // Calcula el progreso como el porcentaje de la duración
            if (status.didJustFinish) {
                playNextTrack(); // Reproduce la siguiente canción automáticamente cuando la actual termine
            }
        }
    };

    // Función para pausar o reanudar la canción dependiendo del estado
    const togglePlayPause = async () => {
        if (currentSound) {
            if (playing) {
                await currentSound.pauseAsync(); // Pausa la canción si está reproduciéndose
            } else {
                await currentSound.playAsync(); // Reanuda la canción si está pausada
            }
            setPlaying(!playing); // Cambia el estado de reproducción
        }
    };

    // Función para reproducir la siguiente canción
    const playNextTrack = async () => {
        try {
            if (!currentSong) {
                Alert.alert('Error', 'Debes reproducir una canción primero para poder adelantarla.');
                return;
            }
    
            const currentIndex = songs.findIndex((s) => s.uri === currentSong.uri); // Encuentra la canción actual
            const nextIndex = (currentIndex + 1) % songs.length; // Calcula el índice de la siguiente canción
            await playSong(songs[nextIndex]); // Reproduce la siguiente canción
        } catch (error) {
            console.error('Error al adelantar la canción:', error);
            Alert.alert('Error', 'Ocurrió un problema al adelantar la canción.');
        }
    };
    
    // Función para reproducir la canción anterior
    const playPreviousTrack = async () => {
        try {
            if (!currentSong) {
                Alert.alert('Error', 'Debes reproducir una canción primero para poder retrocederla.');
                return;
            }
    
            const currentIndex = songs.findIndex((s) => s.uri === currentSong.uri); // Encuentra la canción actual
            const prevIndex = (currentIndex - 1 + songs.length) % songs.length; // Calcula el índice de la canción anterior
            await playSong(songs[prevIndex]); // Reproduce la canción anterior
        } catch (error) {
            console.error('Error al retroceder la canción:', error);
            Alert.alert('Error', 'Ocurrió un problema al retroceder la canción.');
        }
    };

    // Función para renderizar cada canción en la lista
    const renderItem = ({ item }) => (
        <Pressable onPress={() => playSong(item)} style={styles.songItem}>
            <View>
                <Text
                    style={[
                        styles.songName,
                        currentSong?.uri === item.uri && styles.playingSong,
                    ]}
                >
                    {item.name}
                </Text>
                <Text style={styles.artistName}>{item.artist}</Text>
            </View>
            <View style={{justifyContent: 'space-around'}}>
                <Pressable
                    onPress={() => navigation.navigate('PlaylistSelection', { songToAdd: item })}
                    style={styles.addToPlaylistButton}
                >
                    <Ionicons name="add" size={24} color="white" />
                </Pressable>

                <Pressable onPress={() => deleteSong(item)} style={styles.deleteButton}>
                    <Ionicons name="trash" size={24} color="white" />
                </Pressable>
            </View>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </Pressable>
                <Text style={styles.title}>Música Local</Text>
            </View>

            <TextInput
                style={styles.searchInput}
                placeholder="Buscar canción..."
                placeholderTextColor="gray"
                value={searchTerm}
                onChangeText={setSearchTerm}
            />

            <View style={styles.controls}>
                <Pressable onPress={playPreviousTrack}>
                    <Ionicons name="play-skip-back" size={40} color="white" />
                </Pressable>

                <Pressable onPress={togglePlayPause} style={styles.playButton}>
                    <Ionicons 
                        name={playing ? 'pause' : 'play'} 
                        size={50} 
                        color="white" 
                    />
                </Pressable>

                <Pressable onPress={playNextTrack}>
                    <Ionicons name="play-skip-forward" size={40} color="white" />
                </Pressable>
            </View>

            <Slider
                style={styles.progressBar}
                value={progress}
                minimumValue={0}
                maximumValue={1}
                minimumTrackTintColor="#1DB954"
                maximumTrackTintColor="#b3b3b3"
                thumbTintColor="#1DB954"
                disabled
            />

            <FlatList
                data={filteredSongs}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.songList}
            />

            <Pressable style={styles.addButton} onPress={selectFile}>
                <Text style={styles.addButtonText}>Agregar Canción</Text>
            </Pressable>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#040306', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    backButton: { justifyContent: 'center', alignItems: 'center', padding: 10 },
    backButtonText: { color: 'white', fontSize: 18 },
    title: { fontSize: 24, color: 'white' },
    searchInput: { backgroundColor: '#2a2a2a', color: 'white', padding: 10, borderRadius: 5, marginBottom: 20 },
    songItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15 },
    songName: { color: 'white', fontSize: 18 },
    artistName: { color: 'gray', fontSize: 14 },
    addToPlaylistButton: { marginLeft: 10, padding: 10, backgroundColor: '#1DB954', borderRadius: 20 },
    deleteButton: { marginLeft: 10, padding: 10, backgroundColor: '#E50914', borderRadius: 20 },
    controls: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
    playButton: { paddingHorizontal: 20 },
    progressBar: { marginVertical: 10 },
    songList: { paddingBottom: 100 },
    addButton: { marginTop: 20, backgroundColor: '#1DB954', padding: 15, borderRadius: 5 },
    addButtonText: { color: 'white', textAlign: 'center', fontSize: 16 },
    playingSong: { fontWeight: 'bold' },
});

export default MusicScreen;