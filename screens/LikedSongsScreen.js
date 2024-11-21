import { 
  StyleSheet, Text, View, ScrollView, Pressable, TextInput, FlatList, Image 
} from 'react-native';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Entypo from '@expo/vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'; 
import SongItem from '../components/SongItem';
import { Player } from '../PlayerContext';
import { BottomModal, ModalContent } from 'react-native-modals';
import Feather from '@expo/vector-icons/Feather';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import NetInfo from '@react-native-community/netinfo';


const LikedSongsScreen = () => {
  const navigation = useNavigation();
  const { currentTrack, setCurrentTrack } = useContext(Player);
  const [modalVisible, setModalVisible] = useState(false);
  const [input, setInput] = useState('');
  const value = useRef(0);
  const [savedTracks, setSavedTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [currentSound, setCurrentSound] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEndReached, setIsEndReached] = useState(false);
  
  // Paginación
  const [offset, setOffset] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);

  // Descargar canciones
  const [isTracksFetched, setIsTracksFetched] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // Estado para verificar la conexión a internet

  // Función para comprobar la conexión a internet
  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    
    if (!state.isConnected) {
      Alert.alert(
        "Sin conexión a Internet",
        "Parece que no tienes conexión a Internet. Las canciones solo se podrán cargar desde el almacenamiento local.",
        [{ text: "OK" }]
      );
    }
  
    return state.isConnected;
  };

  // Llamamos a la función al montar el componente y cuando cambie la conexión
  useEffect(() => {
    checkConnection(); // Verifica la conexión al cargar la pantalla
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected); // Escucha cambios en la conexión
    });

    return () => unsubscribe(); // Limpiar el listener cuando el componente se desmonte
  }, []);

  // Obtener canciones guardadas
  // Obtener canciones, si hay conexión se consultan desde la API, si no, desde AsyncStorage
  async function getSavedTracks() {
    try {
      setLoading(true); // Indicar que estamos cargando
  
      const isConnected = await checkConnection(); // Verificar conexión
  
      if (isConnected) {
        // Si hay conexión a Internet, obtener canciones desde la API de Spotify
        const accessToken = await AsyncStorage.getItem('token');
        const response = await fetch(
          `https://api.spotify.com/v1/me/tracks?offset=${offset}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
  
        if (!response.ok) throw new Error('Error al encontrar los tracks');
  
        const data = await response.json();
        if (offset === 0) {
          setSavedTracks(data.items);
        } else {
          setSavedTracks(prevTracks => [...prevTracks, ...data.items]); // Agregar más pistas
        }
        setIsTracksFetched(true);
        setFilteredTracks(data.items);
        setOffset(prevOffset => prevOffset + limit); // Actualizar el offset
      } else {
        // Si no hay conexión, cargar canciones descargadas desde el almacenamiento local
        const downloadedTracks = await AsyncStorage.getItem('downloadedTracks');
        console.log('Canciones descargadas desde AsyncStorage:', downloadedTracks); // Verificar qué datos estamos obteniendo
        if (downloadedTracks) {
          const parsedTracks = JSON.parse(downloadedTracks);
          console.log('Canciones descargadas parseadas:', parsedTracks); // Verificar el formato de los datos
          setSavedTracks(parsedTracks); // Cargar canciones descargadas
          setFilteredTracks(parsedTracks);
          setIsTracksFetched(true);
        } else {
          alert('No tienes canciones descargadas para escuchar sin conexión');
        }
      }
    } catch (error) {
      console.error('Error al obtener las canciones guardadas:', error);
    } finally {
      setLoading(false); // Indicar que hemos terminado de cargar
    }
  }

  // Filtrar canciones según el input
  useEffect(() => {
    const filtered = savedTracks.filter((track) =>
      track.track.name.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredTracks(filtered);
  }, [input, savedTracks]);

  // Llamar a getSavedTracks al montar el componente
  useEffect(() => {
    getSavedTracks();
  }, []);

  // Manejar el scroll para cargar más canciones
  const handleLoadMore = async () => {
    if (loading || !isConnected) return; // Evita múltiples llamadas y solo lo hace si hay conexión
    
    setLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Retraso de 1 segundo
  
      const accessToken = await AsyncStorage.getItem('token');
      const response = await fetch(
        //`https://api.spotify.com/v1/me/tracks?offset=${offset}&limit=10`, // Actualiza el offset
        `https://api.spotify.com/v1/me/tracks?offset=${offset}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
  
      if (!response.ok) throw new Error('Error al cargar más tracks');
  
      const data = await response.json();
      
      if (data.items.length > 0) {
        setSavedTracks((prevTracks) => [...prevTracks, ...data.items]); // Agrega las nuevas canciones
        setFilteredTracks((prevTracks) => [...prevTracks, ...data.items]); // Agrega a los filtrados
        setOffset((prevOffset) => prevOffset + limit); // Incrementa el offset
      } else {
        setIsEndReached(true); // Indicar que no hay más canciones
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Detener estado de carga
    }
  };



  // Reproducir la primera canción guardada
  const playTrack = async () => {
    try {
        if (isPlaying && currentSound) {
            await currentSound.stopAsync(); // Detenemos cualquier pista en reproducción
            await currentSound.unloadAsync();
        }
        if (filteredTracks.length > 0) {
            setCurrentTrack(filteredTracks[0]);
            await play(filteredTracks[0]); // Llamamos a `play` con la primera canción
        }
    } catch (error) {
        alert("Ocurrió un error al intentar reproducir la pista.");
        console.error("Error en playTrack:", error.message);
    }
};

const play = async (nextTrack) => {
  const preview_url = nextTrack?.track?.preview_url;
  const localUri = await AsyncStorage.getItem(`track_${nextTrack.track.id}`); // Verificar si está descargada

  const uriToPlay = preview_url ? preview_url : localUri; // Usar la URL de la API o la canción local

  if (!uriToPlay) {
    alert("Esta canción no está disponible.");
    playNextTrack();
    return;
  }

  try {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    }

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: false,
    });

    const { sound, status } = await Audio.Sound.createAsync(
      { uri: uriToPlay },
      { shouldPlay: true, isLooping: false },
      onPlayBackStatusUpdate
    );

    setCurrentSound(sound);
    setIsPlaying(true);
    onPlayBackStatusUpdate(status);

    await sound.playAsync();
  } catch (err) {
    alert("Ocurrió un error al reproducir la canción.");
    console.error("Error en play:", err.message);
  }
};

const onPlayBackStatusUpdate = (status) => {
    if (status.isLoaded) {
        setCurrentTime(status.positionMillis);
        setTotalDuration(status.durationMillis);

        if (status.isPlaying) {
            const progress = status.positionMillis / status.durationMillis;
            setProgress(progress);
        }
    }

    if (status.didJustFinish) {
        setCurrentSound(null);
        setIsPlaying(false); // Actualizamos el estado de `isPlaying`
        playNextTrack();
    }
};

const handlePlayPause = async () => {
    if (currentSound) {
        try {
            if (isPlaying) {
                await currentSound.pauseAsync();
            } else {
                await currentSound.playAsync();
            }
            setIsPlaying(!isPlaying);
        } catch (error) {
            alert("Ocurrió un error al pausar/reproducir la canción.");
            console.error("Error en handlePlayPause:", error.message);
        }
    }
};

const playNextTrack = async () => {
    try {
        if (currentSound) {
            await currentSound.stopAsync();
            await currentSound.unloadAsync();
            setCurrentSound(null);
        }

        if (value.current + 1 < savedTracks.length) {
            value.current += 1;
        } else {
            value.current = 0;
        }

        const nextTrack = savedTracks[value.current];
        setCurrentTrack(nextTrack);
        await play(nextTrack);
    } catch (error) {
        alert("Ocurrió un error al reproducir la siguiente pista.");
        console.error("Error en playNextTrack:", error.message);
    }
};

const playPreviousTrack = async () => {
    try {
        if (currentSound) {
            await currentSound.stopAsync();
            await currentSound.unloadAsync();
            setCurrentSound(null);
        }

        if (value.current - 1 >= 0) {
            value.current -= 1;
        } else {
            value.current = savedTracks.length - 1;
        }

        const previousTrack = savedTracks[value.current];
        setCurrentTrack(previousTrack);
        await play(previousTrack);
    } catch (error) {
        alert("Ocurrió un error al reproducir la pista anterior.");
        console.error("Error en playPreviousTrack:", error.message);
    }
};

const circleSize =12;
const formatTime = (time) => {
  const minutes = Math.floor(time/60000);
  const seconds = Math.floor((time % 60000) / 1000)
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
}

  // Ordenar canciones por nombre
  const sortTracksByName = () => {
    const sortedTracks = [...filteredTracks].sort((a, b) =>
      a.track.name.localeCompare(b.track.name)
    );
    setFilteredTracks(sortedTracks);
  };

  const downloadTrack = async (track) => {
    const { id, preview_url, name } = track;
    
    // Verificar si el preview_url es válido antes de intentar la descarga
    if (!preview_url) {
      console.log(`${name}: No hay URL de vista previa disponible para descargar.`);
      return null; // O manejar el error como prefieras
    }
  
    const fileUri = `${FileSystem.documentDirectory}${id}.mp3`;
  
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        console.log(`${name}: ya está descargado`);
        return fileUri;
      }
  
      console.log(`${name}: descargándose`);
  
      // Crear una promesa de tiempo de espera de 5 segundos
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Tiempo de espera excedido')), 5000)
      );
  
      // Intentar descargar la canción con un límite de tiempo de 5 segundos
      const { uri } = await Promise.race([
        FileSystem.downloadAsync(preview_url, fileUri),
        timeoutPromise
      ]);
  
      console.log(`${name}: descargado en ${uri}`);
  
      // Guardar la URI de la canción en AsyncStorage
      await AsyncStorage.setItem(`track_${id}`, uri);
  
      // Actualizar lista de canciones descargadas
      const downloadedTracks = await AsyncStorage.getItem('downloadedTracks');
      let tracks = downloadedTracks ? JSON.parse(downloadedTracks) : [];
      tracks.push({ id, name, uri }); // Agregar la nueva canción descargada
      console.log('Canciones descargadas actualizadas:', tracks); // Verificar la lista de canciones
  
      await AsyncStorage.setItem('downloadedTracks', JSON.stringify(tracks));
  
      return uri;
    } catch (error) {
      if (error.message === 'Tiempo de espera excedido') {
        Alert.alert('Descarga fallida', `No se pudo descargar "${name}" porque excedió el tiempo de espera`);
        console.error(`${name}: Tiempo de espera excedido`);
      } else {
        console.error(`${name}: Error al descargar el archivo`, error);
      }
    }
  };

// useEffect para cargar y luego descargar las canciones
useEffect(() => {
  getSavedTracks(); // Obtener canciones al montar el componente
}, []);

useEffect(() => {
  // Solo ejecutar cuando las canciones estén cargadas
  if (isTracksFetched) {
    const downloadAllTracks = async () => {
      for (let item of savedTracks) {
        await downloadTrack(item.track);
      }
    };

    downloadAllTracks();
  }
}, [isTracksFetched]); // Ejecutar cuando isTracksFetched cambie a true

  return (
    <>
      <LinearGradient colors={['#614385', '#516395']} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, marginTop: 40, paddingHorizontal: 20 }}>
          {/* Botón Volver */}
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text style={styles.backText}>Volver</Text>
          </Pressable>

          {/* Título */}
          <View style={styles.content}>
            <Text style={styles.title}>Tus Canciones Favoritas ❤️</Text>
          </View>

          {/* Barra de búsqueda y botón Ordenar */}
          <View style={styles.searchAndSortContainer}>
            <View style={styles.searchContainer}>
              <FontAwesome name="search" size={20} color="white" style={styles.searchIcon} />
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Buscar en tus canciones favoritas"
                placeholderTextColor="#B0B0B0"
                style={styles.searchInput}
              />
            </View>
            {/* Botón Ordenar */}
            <Pressable style={styles.sortButton} onPress={sortTracksByName}>
              <Text style={styles.sortButtonText}>Ordenar</Text>
            </Pressable>
          </View>

          {/* Controles */}
          <View style={styles.controlsContainer}>
            <Pressable style={styles.controlButton}>
              <AntDesign name="arrowdown" size={24} color="white" />
            </Pressable>

            <MaterialCommunityIcons name="cross-bolnisi" size={24} color="#1DB954" />

            <Pressable onPress={playTrack} style={styles.playButton}>
              <Entypo name="controller-play" size={24} color="white" />
            </Pressable>
          </View>

          {/* Lista de canciones */}
          <FlatList
            style={{ marginBottom: 90 }}
            data={filteredTracks}
            keyExtractor={(item) => item.track.id}
            renderItem={({ item }) => (
              <SongItem 
                item={item} 
                onPress={play} 
                isPlaying={item === currentTrack} 
              />
            )}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            onEndReached={handleLoadMore} // Llama a handleLoadMore al llegar al final
            onEndReachedThreshold={0.1} // Distancia desde el final para activar la carga
            ListFooterComponent={
              loading ? <Text>Cargando...</Text> : isEndReached ? <Text>Carga completa</Text> : null
            } // Mostrar texto de carga o "Carga completa"
            ListEmptyComponent={<Text>No hay canciones guardadas.</Text>} // Mensaje si no hay canciones
          />
        </ScrollView>
      </LinearGradient>

      {currentTrack && (
  <Pressable 
    onPress={() => setModalVisible(!modalVisible)}
    style={styles.nowPlaying}
  >
    {(() => {
      try {
        return (
          <>
            <Image
              style={{ width: 40, height: 40, borderRadius: 8 }}
              source={{ uri: currentTrack.track.album?.images[0]?.url }}
            />
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text numberOfLines={1} style={{ color: 'white' }}>
                {currentTrack.track.name} • {currentTrack.track.artists[0]?.name}
              </Text>
            </View>
          </>
        );
      } catch (error) {
        console.error("Error rendering currentTrack:", error);

        // Reinicio del componente si se detecta un error
        setCurrentTrack(null); // Reinicia el estado global
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white' }}>Error al cargar la canción actual.</Text>
          </View>
        );
      }
    })()}
    <View style={styles.controls}>
      <AntDesign name="heart" size={24} color="#1DB954" />
      <Pressable onPress={handlePlayPause}>
        {isPlaying ? (
          <AntDesign name="pausecircle" size={24} color="white" />
        ) : (
          <Pressable 
            onPress={handlePlayPause} 
            style={{
              width: 24,
              height: 24,
              borderRadius: 30,
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Entypo name="controller-play" size={20} color="black" />
          </Pressable>
        )}
      </Pressable>
    </View>
  </Pressable>
)}

<BottomModal visible={modalVisible} 
            onHardwareBackPress={() => setModalVisible(false)}
            swipeDirection={["up","down"]}
            swipeThreshold={200}
        >
            <ModalContent style={{height:"100%", width:"100%", backgroundColor:"#5072A7"}}>
                <View style={{height:"100%", width:"100%", marginTop:40}}>
                    <Pressable 
                    style={{
                        flexDirection:"row",
                        alignItems:"center",
                        justifyContent:"space-between"
                        }}>
                    <AntDesign onPress={() => setModalVisible(!modalVisible)} name="down" size={24} color="white" />

                    <Text style={{fontSize:15, fontWeight:"bold", color:"white"}}>{currentTrack?.track?.name}</Text>

                    <Entypo name="dots-three-vertical" size={24} color="white" />
                    </Pressable>

                    <View style={{height:60}}/>
                    <View style={{padding:10}}/>

                    <Image style={{width:"100%", height:400, borderRadius:8}} source={{uri:currentTrack?.track?.album?.images[0].url}}/>

                    <View style={{marginTop:20, flexDirection:"row", justifyContent:"space-between"}}>
                        <View>
                              <Text style={{fontSize:18, fontWeight:"bold", color:"white"}}>
                                  {currentTrack?.track?.name || "Nombre de canción no disponible"}
                              </Text>
                              <Text style={{color:"#D3D3D3", marginTop:4}}>
                                  {currentTrack?.track?.artists?.[0]?.name || "Artista desconocido"}
                              </Text>
                        </View>
                          <AntDesign name="heart" size={24} color="#1DB954"/>
                    </View>

                    <View style={{marginTop:10}}>
                        <View 
                        style={{
                            width:"100%", 
                            marginTop:10,
                            height:3,
                            backgroundColor:"gray", 
                            borderRadius:5,
                        }}
                        >
                            <View 
                                style={[
                                    styles.progressbar, 
                                    {width: `${progress*100}%`}
                                    ]}
                            />
                            <View style={[
                                {
                                position:"absolute",
                                top:-5,
                                width:circleSize,
                                height:circleSize,
                                borderRadius:circleSize / 2,
                                backgroundColor:"white"
                                },
                                {
                                    left:`${progress*100}%`,
                                    marginLeft: -circleSize /2,
                                }
                            ]}/>

                        </View>

                        <View style={{marginTop:12, flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
                            <Text style={{color:"white", fontSize:15, color:"#D3D3D3"}}>{formatTime(currentTime)}</Text>

                            <Text style={{color:"white", fontSize:15, color:"#D3D3D3"}}>{formatTime(totalDuration)}</Text>
                        </View>
                    </View>

                    <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginTop:17}}>
                        <Pressable>
                            <FontAwesome name="arrows" size={30} color="#03C03C"/>
                        </Pressable>
                        <Pressable onPress={playPreviousTrack}>
                            <Ionicons name="play-skip-back" size={30} color="white"/>
                        </Pressable >
                        <Pressable onPress={handlePlayPause}>
                          {isPlaying?(
                            <AntDesign name="pausecircle" size={60} color="white"/>
                          ) : (
                            <Pressable onPress={handlePlayPause} style={{
                              width:60,
                              height:60,
                              borderRadius:30,
                              backgroundColor:"white",
                              justifyContent:"center",
                              alignItems:"center",
                            }}>
                              <Entypo name="controller-play" size={30} color="black"/>
                            </Pressable>

                          )}
                        </Pressable>
                        <Pressable  onPress={playNextTrack}>
                            <Ionicons name="play-skip-forward" size={30} color="white"/>
                        </Pressable>
                        <Pressable>
                            <Feather name="repeat" size={30} color="#03C03C"/>
                        </Pressable>
                    </View>
                </View>
            </ModalContent>
        </BottomModal>
    </>
  );
};

export default LikedSongsScreen;
  
  const styles = StyleSheet.create({
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    backText: {
      color: 'white',
      fontSize: 18,
      marginLeft: 10,
    },
    content: {
      marginTop: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
    searchAndSortContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 15,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#42275a',
      borderRadius: 25,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginRight: 10,
    },
    searchIcon: {
      marginRight: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: 'white',
    },
    sortButton: {
      backgroundColor: '#42275a',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 25,
    },
    sortButtonText: {
      color: 'white',
      fontSize: 16,
    },
    controlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 20,
    },
    controlButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#1D8954',
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: '#1D8954',
      justifyContent: 'center',
      alignItems: 'center',
    },
    nowPlaying: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#5072A7', // Asegúrate de que este código de color esté correcto
        width: '90%', // Cambié a un porcentaje para una mejor adaptabilidad
        marginLeft: 'auto',
        marginRight: 'auto',
        marginBottom: 15,
        position: 'absolute',
        borderRadius: 8,
        left: 20,
        bottom: 10,
        justifyContent: 'space-between',
        gap: 10
      },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap:8
    },
    progressbar:{
        height:"100%",
        backgroundColor:"white",
    },
  });