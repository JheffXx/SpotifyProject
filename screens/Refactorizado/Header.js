// Header.js
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const Header = ({ playlistName, onBack }) => {
    return (
        <View style={styles.header}>
            <Pressable onPress={onBack} style={styles.backButton}>
                <Text style={styles.backButtonText}>Volver</Text>
            </Pressable>
            <Text style={styles.title}>Playlist: {playlistName}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: {
        backgroundColor: '#282828',
        padding: 10,
        borderRadius: 30,
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
    },
    title: {
        color: 'white',
        fontSize: 22,
        textAlign: 'center',
        marginVertical: 10,
        flex: 1
    },
});

export default Header;