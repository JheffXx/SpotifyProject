// Importación de módulos y librerías necesarias
import { StyleSheet, Text, View, Pressable, Image } from 'react-native'; // Componentes de React Native
import React, { useContext } from 'react'; // React y useContext para manejar el contexto
import AntDesign from '@expo/vector-icons/AntDesign'; // Íconos de Expo: corazón
import Entypo from '@expo/vector-icons/Entypo'; // Íconos de Expo: menú de tres puntos verticales
import { Player } from '../PlayerContext'; // Contexto Player para manejar la pista de audio actual

// Componente funcional SongItem
// Representa un elemento de canción en una lista, incluyendo su imagen, nombre, artista y acciones asociadas
const SongItem = ({ item, onPress, isPlaying }) => {
  // Acceso al contexto Player para obtener y actualizar la canción actual
  const { currentTrack, setCurrentTrack } = useContext(Player);

  // Función que maneja el evento de presionar la canción
  const handlePress = () => {
    setCurrentTrack(item); // Actualiza el contexto con la pista seleccionada
    onPress(item); // Llama a la función onPress pasada como prop para manejar eventos adicionales
  };

  return (
    // Contenedor presionable para la canción
    <Pressable 
      onPress={handlePress} // Define la acción al presionar
      style={styles.container} // Estilo del contenedor principal
    >
      {/* Imagen del álbum de la canción */}
      <Image
        style={styles.image} // Estilo para la imagen
        source={{ uri: item?.track?.album?.images[0]?.url }} // URL de la imagen del álbum
      />
      
      {/* Contenedor de texto: nombre de la canción y del artista */}
      <View style={{ flex: 1 }}>
        {/* Título de la canción */}
        <Text 
          numberOfLines={1} // Limita el texto a una línea
          style={
            isPlaying // Si la canción se está reproduciendo, cambia el estilo
              ? { fontWeight: "bold", fontSize: 14, color: "#3FFF00" } // Estilo para canción en reproducción
              : { fontWeight: "bold", fontSize: 14, color: "white" } // Estilo para canción normal
          }
        >
          {item.track.name} {/* Muestra el nombre de la canción */}
        </Text>
        
        {/* Nombre del artista */}
        <Text style={styles.artistName}>
          {item.track.artists[0].name} {/* Muestra el nombre del artista */}
        </Text>
      </View>
        
      {/* Contenedor para los íconos de interacción */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 7, marginHorizontal: 10 }}>
        {/* Ícono de corazón (por ejemplo, para marcar como favorito) */}
        <AntDesign name="heart" size={24} color="#1DB954" />
        {/* Ícono de menú (por ejemplo, para mostrar más opciones) */}
        <Entypo name="dots-three-vertical" size={24} color="#C0C0C0" />
      </View>
    </Pressable>
  );
};

// Exporta el componente para su uso en otros archivos
export default SongItem;

// Estilos para el componente
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Los elementos están en fila horizontal
    alignItems: 'center', // Centra los elementos verticalmente
    marginBottom: 15, // Margen inferior entre los elementos de la lista
  },
  image: {
    width: 50, // Ancho de la imagen
    height: 50, // Altura de la imagen
    marginRight: 10, // Espaciado derecho entre la imagen y el texto
    borderRadius: 8, // Bordes redondeados para la imagen
  },
  trackName: {
    fontSize: 16, // Tamaño del texto para el nombre de la canción
    color: 'white', // Color blanco para el texto
    fontWeight: "bold", // Texto en negrita
  },
  artistName: {
    fontSize: 14, // Tamaño del texto para el nombre del artista
    color: '#B0B0B0', // Color gris claro para el texto
  },
});