import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable, FlatList, Alert, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const LocalPlaylistsScreen = () => {
    // Estados locales para gestionar playlists, estado de audio, playlist seleccionada, y creación de playlist
    const navigation = useNavigation();
    const [playlists, setPlaylists] = useState([]);
    const [audioState, setAudioState] = useState({
        sound: null,
        currentSong: null,
        playing: false,
        progress: 0,
    });
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [creatingPlaylist, setCreatingPlaylist] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');

    // Cargar las playlists almacenadas al montar el componente
    useEffect(() => {
        loadPlaylists();
    }, []);

    // Función para cargar las playlists desde AsyncStorage
    const loadPlaylists = async () => {
        try {
            const storedPlaylists = await AsyncStorage.getItem('localPlaylists');
            if (storedPlaylists) {
                const parsedPlaylists = JSON.parse(storedPlaylists);
                const filteredPlaylists = parsedPlaylists.map(playlist => ({
                    ...playlist,
                    songs: playlist.songs.filter(song => song && song.uri),
                }));
                setPlaylists(filteredPlaylists);
            }
        } catch (error) {
            console.error('Error al cargar las playlists locales:', error);
        }
    };

    // Función para crear una nueva playlist
    const createPlaylist = async () => {
        if (!newPlaylistName.trim()) {
            Alert.alert('Error', 'El nombre de la playlist no puede estar vacío.');
            return;
        }

        const newPlaylist = {
            name: newPlaylistName.trim(),
            songs: [],
        };

        // Actualizar el estado de playlists con la nueva playlist
        const updatedPlaylists = [...playlists, newPlaylist];
        setPlaylists(updatedPlaylists);
        setNewPlaylistName('');
        setCreatingPlaylist(false);

        try {
            // Guardar la nueva playlist en AsyncStorage
            await AsyncStorage.setItem('localPlaylists', JSON.stringify(updatedPlaylists));
        } catch (error) {
            console.error('Error al guardar la nueva playlist:', error);
        }
    };

     // Función para cancelar la creación de una playlist
    const cancelCreatingPlaylist = () => {
        setCreatingPlaylist(false);
        setNewPlaylistName('');
    };

     // Función para reproducir una canción seleccionada
    const playSong = async (song) => {
        if (audioState.sound) {
            await audioState.sound.unloadAsync(); // Descartar la canción actual si existe
        }

        // Crear un nuevo objeto de sonido con la URI de la canción
        const { sound } = await Audio.Sound.createAsync(
            { uri: song.uri },
            { shouldPlay: true }
        );

        // Establecer un callback para actualizar el progreso de la canción
        sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);

        // Actualizar el estado con la canción actual y su progreso
        setAudioState({
            sound,
            currentSong: song,
            playing: true,
            progress: 0,
        });
    };

    // Función que se ejecuta para actualizar el progreso de la canción y verificar si terminó
    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setAudioState(prevState => ({
                ...prevState,
                progress: status.positionMillis / status.durationMillis,
            }));

            // Reproducir la siguiente canción si la actual ha terminado
            if (status.didJustFinish) {
                playNextTrack();
            }
        }
    };

     // Función para pausar o reanudar la reproducción
    const togglePlayPause = async () => {
        if (audioState.sound) {
            if (audioState.playing) {
                await audioState.sound.pauseAsync();
            } else {
                await audioState.sound.playAsync();
            }
            setAudioState(prevState => ({ ...prevState, playing: !prevState.playing }));
        }
    };

    // Función para reproducir la siguiente canción en la playlist
    const playNextTrack = async () => {
        if (!selectedPlaylist || !audioState.currentSong) return;

        const currentIndex = selectedPlaylist.songs.findIndex(s => s.uri === audioState.currentSong.uri);
        const nextIndex = (currentIndex + 1) % selectedPlaylist.songs.length;
        await playSong(selectedPlaylist.songs[nextIndex]);
    };

    // Función para reproducir la canción anterior en la playlist
    const playPreviousTrack = async () => {
        if (!selectedPlaylist || !audioState.currentSong) return;

        const currentIndex = selectedPlaylist.songs.findIndex(s => s.uri === audioState.currentSong.uri);
        const previousIndex = currentIndex === 0 ? selectedPlaylist.songs.length - 1 : currentIndex - 1;
        await playSong(selectedPlaylist.songs[previousIndex]);
    };

    // Función para eliminar una playlist
    const handleDeletePlaylist = (playlist) => {
        Alert.alert(
            'Confirmar eliminación',
            `¿Estás seguro de que deseas eliminar la playlist "${playlist.name}"? Esta acción no se puede deshacer.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        const updatedPlaylists = playlists.filter(pl => pl.name !== playlist.name);
                        setPlaylists(updatedPlaylists);
                        AsyncStorage.setItem('localPlaylists', JSON.stringify(updatedPlaylists));
                    },
                },
            ]
        );
    };

    // Función para renderizar cada elemento de la lista de playlists
    const renderPlaylistItem = ({ item }) => (
        <Pressable
            onPress={() => {
                setSelectedPlaylist(item);
            }}
            style={styles.playlistItem}
        >
            <Text style={styles.playlistName}>{item.name}</Text>
            <Pressable onPress={() => handleDeletePlaylist(item)} style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Eliminar Playlist</Text>
            </Pressable>
        </Pressable>
    );

    // Función para renderizar cada elemento de la lista de canciones
    const renderSongItem = ({ item }) => (
        <Pressable onPress={() => playSong(item)} style={styles.songItem}>
            <Text
                style={[
                    styles.songTitle,
                    item.uri === audioState.currentSong?.uri && audioState.playing && styles.playingSong,
                ]}
            >
                {item.name}
            </Text>
            <Text style={styles.songArtist}>{item.artist}</Text>
        </Pressable>
    );

     // Renderizado de la pantalla
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </Pressable>
                <Text style={styles.title}>Playlists Locales</Text>
            </View>

            {creatingPlaylist ? (
                <View style={styles.createPlaylistContainer}>
                    <Text style={styles.createPlaylistTitle}>Nueva Playlist</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nombre de la Playlist"
                        placeholderTextColor="#666"
                        value={newPlaylistName}
                        onChangeText={setNewPlaylistName}
                    />
                    <View style={styles.createPlaylistButtons}>
                        <Pressable onPress={createPlaylist} style={styles.createButton}>
                            <Text style={styles.createButtonText}>Crear</Text>
                        </Pressable>
                        <Pressable onPress={cancelCreatingPlaylist} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </Pressable>
                    </View>
                </View>
            ) : selectedPlaylist ? (
                <View style={styles.playlistDetails}>
                    <Text style={styles.playlistDetailsTitle}>Canciones de: {selectedPlaylist.name}</Text>
                    <FlatList
                        data={selectedPlaylist.songs}
                        renderItem={renderSongItem}
                        keyExtractor={(item, index) => index.toString()}
                        contentContainerStyle={styles.songList}
                    />
                    <View style={styles.controls}>
                        <Pressable onPress={playPreviousTrack} style={styles.controlButton}>
                            <Text style={styles.controlButtonText}>⏮️</Text>
                        </Pressable>
                        <Pressable onPress={togglePlayPause} style={styles.controlButton}>
                            <Text style={styles.controlButtonText}>{audioState.playing ? '⏸️' : '▶️'}</Text>
                        </Pressable>
                        <Pressable onPress={playNextTrack} style={styles.controlButton}>
                            <Text style={styles.controlButtonText}>⏭️</Text>
                        </Pressable>
                    </View>
                    <Pressable onPress={() => setSelectedPlaylist(null)} style={styles.backToPlaylistsButton}>
                        <Text style={styles.backToPlaylistsText}>Volver a Playlists</Text>
                    </Pressable>
                </View>
            ) : (
                <View>
                    <FlatList
                        data={playlists}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderPlaylistItem}
                        contentContainerStyle={styles.playlistList}
                    />
                    <Pressable onPress={() => setCreatingPlaylist(true)} style={styles.addPlaylistButton}>
                        <Text style={styles.addPlaylistButtonText}>+ Nueva Playlist</Text>
                    </Pressable>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#040306', padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backButton: { backgroundColor: '#282828', padding: 10, borderRadius: 30 },
    backButtonText: { color: 'white', fontSize: 16 },
    title: { color: 'white', fontSize: 22 },
    playlistList: { marginTop: 10 },
    playlistItem: { padding: 15, backgroundColor: '#1c1c1c', borderRadius: 8, marginBottom: 10 },
    playlistName: { color: 'white', fontSize: 18 },
    deleteButton: { backgroundColor: '#FF6347', padding: 5, borderRadius: 5, marginTop: 10 },
    deleteButtonText: { color: 'white', fontSize: 14, textAlign: 'center' },
    playlistDetails: { marginTop: 20 },
    playlistDetailsTitle: { color: 'white', fontSize: 20, marginBottom: 10 },
    songList: { marginBottom: 20 },
    songItem: { padding: 10, backgroundColor: '#1c1c1c', borderRadius: 8, marginBottom: 10 },
    songTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    songArtist: { color: '#666', fontSize: 14 },
    controls: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
    controlButton: { padding: 10 },
    controlButtonText: { color: 'white', fontSize: 30 },
    backToPlaylistsButton: { marginTop: 20, backgroundColor: '#1DB954', padding: 10, borderRadius: 30 },
    backToPlaylistsText: { color: 'white', textAlign: 'center', fontSize: 16 },
    createPlaylistContainer: { marginTop: 20, alignItems: 'center' },
    createPlaylistTitle: { color: 'white', fontSize: 20, marginBottom: 10 },
    input: { backgroundColor: '#1c1c1c', color: 'white', padding: 10, borderRadius: 8, width: '80%', marginBottom: 10 },
    createPlaylistButtons: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
    createButton: { backgroundColor: '#1DB954', padding: 10, borderRadius: 8, margin: 10 },
    createButtonText: { color: 'white', fontSize: 16 },
    cancelButton: { backgroundColor: '#FF3B30', padding: 10, borderRadius: 8, margin: 10 },
    cancelButtonText: { color: 'white', fontSize: 16 },
    addPlaylistButton: { backgroundColor: '#1DB954', padding: 10, borderRadius: 8, marginTop: 20, alignItems: 'center' },
    addPlaylistButtonText: { color: 'white', fontSize: 18 },
    songTitle: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    playingSong: { color: 'green' }, // Canción que se está reproduciendo
});

export default LocalPlaylistsScreen;