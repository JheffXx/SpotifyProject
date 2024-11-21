import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable, TextInput, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlaylistSelectionScreen = ({ route, navigation }) => {
    const { songToAdd } = route.params || {}; // Recibimos la canción seleccionada desde la pantalla anterior
    const [playlists, setPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');

    useEffect(() => {
        loadPlaylists();
        console.log("Canción seleccionada para agregar:", songToAdd); // Verifica que songToAdd tenga sus propiedades
    }, []);

    const loadPlaylists = async () => {
        try {
            const storedPlaylists = await AsyncStorage.getItem('localPlaylists');
            if (storedPlaylists) {
                setPlaylists(JSON.parse(storedPlaylists));
            } else {
                console.log('No hay playlists guardadas');
            }
        } catch (error) {
            console.error('Error al cargar playlists:', error);
        }
    };

    const savePlaylists = async (updatedPlaylists) => {
        try {
            await AsyncStorage.setItem('localPlaylists', JSON.stringify(updatedPlaylists));
        } catch (error) {
            console.error('Error al guardar playlists:', error);
        }
    };

    const handleCreatePlaylist = () => {
        if (!newPlaylistName.trim()) {
            Alert.alert('Error', 'El nombre de la playlist no puede estar vacío.');
            return;
        }

        // Crear nueva playlist con la canción seleccionada
        const newPlaylist = {
            name: newPlaylistName,
            songs: [songToAdd], // Agregamos la canción seleccionada
        };

        console.log("Nueva playlist creada:", newPlaylist); // Verifica que la playlist tenga la canción con nombre y uri

        const updatedPlaylists = [...playlists, newPlaylist];
        setPlaylists(updatedPlaylists);
        savePlaylists(updatedPlaylists);

        setNewPlaylistName('');
        navigation.goBack(); // Volver a la pantalla anterior
    };

    const handleAddToPlaylist = (playlist) => {
        const updatedPlaylists = playlists.map((pl) =>
            pl.name === playlist.name
                ? { ...pl, songs: [...pl.songs, songToAdd] } // Agregar la canción a la playlist
                : pl
        );

        console.log("Canción agregada a playlist existente:", playlist.name, songToAdd); // Verifica la canción y la playlist

        setPlaylists(updatedPlaylists);
        savePlaylists(updatedPlaylists);
        navigation.goBack(); // Volver a la pantalla anterior
    };

    const renderPlaylistItem = ({ item }) => (
        <Pressable onPress={() => handleAddToPlaylist(item)} style={styles.playlistItem}>
            <Text style={styles.playlistName}>{item.name}</Text>
            <Text style={styles.songCount}>{item.songs.length} canciones</Text>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Seleccionar Playlist</Text>

            <TextInput
                style={styles.input}
                placeholder="Crear nueva Playlist"
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
            />
            <Pressable style={styles.createButton} onPress={handleCreatePlaylist}>
                <Text style={styles.buttonText}>Crear Playlist</Text>
            </Pressable>

            <FlatList
                data={playlists}
                renderItem={renderPlaylistItem}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={styles.playlistList}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#040306', padding: 20 },
    title: { color: 'white', fontSize: 22, marginBottom: 10 },
    input: { backgroundColor: '#1c1c1c', color: 'white', padding: 10, borderRadius: 8 },
    createButton: { backgroundColor: '#1DB954', padding: 15, borderRadius: 30, marginTop: 10 },
    buttonText: { color: 'white', fontSize: 16, textAlign: 'center' },
    playlistList: { marginTop: 20 },
    playlistItem: { padding: 15, backgroundColor: '#1c1c1c', marginBottom: 10, borderRadius: 8 },
    playlistName: { color: 'white', fontSize: 18 },
    songCount: { color: '#b3b3b3', fontSize: 14 },
});

export default PlaylistSelectionScreen;