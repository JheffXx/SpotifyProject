import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

// Componente funcional RecentlyPlayedCard
// Este componente representa una tarjeta para mostrar una canción reproducida recientemente.
const RecentlyPlayedCard = ({ item }) => {
    // Hook de navegación para manejar la redirección a otra pantalla
    const navigation = useNavigation();

    return (
        // Componente Pressable que permite interacción táctil
        <Pressable 
            // Acción que se ejecuta al presionar la tarjeta
            onPress={() => 
                navigation.navigate("Info", {
                    item: item, // Pasamos la información del item a la pantalla "Info"
                })
            }
            style={{ margin: 10 }} // Espaciado externo alrededor de la tarjeta
        >
            {/* Imagen del álbum de la canción */}
            <Image 
                style={{ 
                    width: 130, // Ancho fijo de la imagen
                    height: 130, // Altura fija de la imagen
                    borderRadius: 5, // Bordes redondeados en las esquinas
                }} 
                source={{ uri: item.track.album.images[0].url }} // URL de la imagen del álbum
            />
            {/* Nombre de la canción */}
            <Text
                numberOfLines={1} // Limita el texto a una sola línea y añade "..." si es demasiado largo
                style={{
                    fontSize: 13, // Tamaño de fuente del texto
                    fontWeight: "500", // Peso de fuente medio para destacar el texto
                    color: "white", // Color del texto
                    marginTop: 10, // Espaciado entre la imagen y el texto
                }}
            >
                {item?.track?.name} {/* Verificamos que existan track y name antes de mostrar */}
            </Text>
        </Pressable>
    );
};

// Exportamos el componente para su uso en otras partes de la aplicación
export default RecentlyPlayedCard;

// Objeto vacío para estilos adicionales que se podrían agregar en el futuro
const styles = StyleSheet.create({});