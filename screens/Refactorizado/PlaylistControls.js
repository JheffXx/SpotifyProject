// PlaylistControls.js
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const PlaylistControls = ({ isPlaying, onPlayPause, onPrevious, onNext }) => {
    return (
        <View style={styles.controls}>
            <Pressable onPress={onPrevious} style={styles.controlButton}>
                <Text style={styles.buttonText}>⏪ Retroceder</Text>
            </Pressable>

            <Pressable onPress={onPlayPause} style={styles.controlButton}>
                <Text style={styles.buttonText}>{isPlaying ? '⏸️ Pausar' : '▶️ Reproducir'}</Text>
            </Pressable>

            <Pressable onPress={onNext} style={styles.controlButton}>
                <Text style={styles.buttonText}>⏩ Adelantar</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 30,
    },
    controlButton: {
        backgroundColor: '#1c1c1c',
        padding: 15,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
    },
});

export default PlaylistControls;