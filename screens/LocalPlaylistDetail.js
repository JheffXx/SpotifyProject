import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LocalPlaylistDetail = ({ route }) => {
    // Recibimos las canciones y el nombre de la playlist desde los parámetros de navegación
    const { playlistName, songs = [] } = route.params;
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(0); // Índice de la canción actual
    const navigation = useNavigation();

    // Función para alternar el estado de reproducción
    const togglePlay = () => {
        setIsPlaying(prev => !prev);
    };

    // Función para avanzar a la siguiente canción
    const skipTrack = () => {
        setCurrentTrack(prev => (prev + 1) % songs.length); // Avanzamos a la siguiente canción
    };

    // Función para retroceder a la canción anterior
    const previousTrack = () => {
        setCurrentTrack(prev => (prev > 0 ? prev - 1 : songs.length - 1)); // Retrocedemos a la canción anterior
    };

    // Función para seleccionar y reproducir una canción
    const playSong = (index) => {
        setCurrentTrack(index);
        setIsPlaying(true); // Reproducimos la canción seleccionada
    };

    // Función para renderizar cada canción en la lista
    const renderSongItem = ({ item, index }) => {
        return (
            <Pressable onPress={() => playSong(index)} style={styles.songItem}>
                <Text style={styles.songText}>{item.name}</Text>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </Pressable>
                <Text style={styles.title}>Playlist: {playlistName}</Text>
            </View>

            {/* Controles de reproducción */}
            <View style={styles.controls}>
                <Pressable onPress={previousTrack} style={styles.controlButton}>
                    <Text style={styles.buttonText}>⏪ Retroceder</Text>
                </Pressable>

                <Pressable onPress={togglePlay} style={styles.controlButton}>
                    <Text style={styles.buttonText}>{isPlaying ? '⏸️ Pausar' : '▶️ Reproducir'}</Text>
                </Pressable>

                <Pressable onPress={skipTrack} style={styles.controlButton}>
                    <Text style={styles.buttonText}>⏩ Adelantar</Text>
                </Pressable>
            </View>

            {/* Mostrar las canciones de la playlist */}
            {songs.length > 0 ? (
                <FlatList
                    data={songs}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderSongItem}
                    style={styles.songList}
                />
            ) : (
                <Text style={styles.noSongsText}>No hay canciones en esta playlist.</Text>
            )}

            <Text style={styles.status}>
                {isPlaying ? `Reproduciendo: ${songs[currentTrack]?.name}` : `Canción pausada - ${songs[currentTrack]?.name}`}
            </Text>

            {/* Contador de canciones */}
            <Text style={styles.songCount}>Total de canciones: {songs.length}</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#040306', padding: 20 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backButton: { backgroundColor: '#282828', padding: 10, borderRadius: 30 },
    backButtonText: { color: 'white', fontSize: 16 },
    title: { color: 'white', fontSize: 22, textAlign: 'center', marginVertical: 10 },
    controls: { flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 30 },
    controlButton: {
        backgroundColor: '#1c1c1c',
        padding: 15,
        borderRadius: 8,
    },
    buttonText: { color: 'white', fontSize: 18 },
    status: { color: '#b3b3b3', fontSize: 16, textAlign: 'center', marginTop: 20 },
    songList: { marginTop: 20 },
    songItem: {
        padding: 10,
        backgroundColor: '#333',
        borderRadius: 8,
        marginBottom: 10,
    },
    songText: { color: 'white', fontSize: 18 },
    noSongsText: { color: 'white', fontSize: 16, textAlign: 'center', marginTop: 20 },
    songCount: { color: '#b3b3b3', fontSize: 16, textAlign: 'center', marginTop: 20 },
});

export default LocalPlaylistDetail;