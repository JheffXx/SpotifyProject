// SongList.js
import React from 'react';
import { FlatList, Pressable, Text, StyleSheet, View } from 'react-native';

const SongList = ({ songs, onPlaySong }) => {
    const renderSongItem = ({ item, index }) => (
        <Pressable onPress={() => onPlaySong(index)} style={styles.songItem}>
            <Text style={styles.songText}>{item.name}</Text>
        </Pressable>
    );

    return (
        <View style={{ marginTop: 20 }}>
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
        </View>
    );
};

const styles = StyleSheet.create({
    songItem: {
        padding: 10,
        backgroundColor: '#333',
        borderRadius: 8,
        marginBottom: 10,
    },
    songText: {
        color: 'white',
        fontSize: 18,
    },
    noSongsText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    songList: {
        marginTop: 10,
    },
});

export default SongList;