import { StyleSheet, View, Image, Text } from 'react-native';
import React from 'react';

// Componente funcional ArtistCard
// Este componente representa una tarjeta para mostrar información de un artista.
const ArtistCard = ({ item }) => {
  return (
    // Vista principal que contiene la tarjeta
    <View style={styles.card}>
      {/* Si el artista tiene una imagen, la mostramos */}
      {item.images?.[0]?.url ? (
        // Carga y muestra la imagen del artista desde la URL
        <Image style={styles.image} source={{ uri: item.images[0].url }} />
      ) : (
        // Si no hay imagen disponible, mostramos un marcador de posición
        <View style={styles.placeholderImage}>
          {/* Texto que se muestra en lugar de la imagen */}
          <Text style={styles.placeholderText}>Sin Imagen</Text>
        </View>
      )}
      {/* Muestra el nombre del artista debajo de la imagen o marcador de posición */}
      <Text style={styles.artistName}>{item.name}</Text>
    </View>
  );
};

// Exportamos el componente para que pueda ser utilizado en otras partes de la app
export default ArtistCard;

// Estilos del componente definidos con StyleSheet para organizar el diseño y apariencia
const styles = StyleSheet.create({
  // Estilo de la tarjeta que contiene el contenido del artista
  card: {
    margin: 10, // Espaciado externo alrededor de la tarjeta
    alignItems: 'center', // Centra los elementos horizontalmente dentro de la tarjeta
  },
  // Estilo de la imagen del artista
  image: {
    width: 130, // Ancho fijo de la imagen
    height: 130, // Altura fija de la imagen
    borderRadius: 5, // Bordes redondeados en las esquinas
  },
  // Estilo del contenedor que se muestra si no hay imagen disponible
  placeholderImage: {
    width: 130, // Ancho fijo del marcador de posición (igual que la imagen)
    height: 130, // Altura fija del marcador de posición
    borderRadius: 5, // Bordes redondeados en las esquinas
    backgroundColor: '#444', // Color de fondo oscuro
    justifyContent: 'center', // Centra el contenido verticalmente
    alignItems: 'center', // Centra el contenido horizontalmente
  },
  // Estilo del texto que aparece dentro del marcador de posición
  placeholderText: {
    color: 'white', // Color del texto
    fontSize: 14, // Tamaño de fuente
  },
  // Estilo del nombre del artista
  artistName: {
    color: 'white', // Color del texto
    marginTop: 5, // Espaciado entre la imagen y el nombre
    fontSize: 16, // Tamaño de fuente del nombre del artista
  },
});