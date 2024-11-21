import { StatusBar } from 'expo-status-bar';// Permite manejar el estado de la barra de estado del dispositivo
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import Navigation from './StackNavigator';// Importa el archivo que contiene la configuración de la navegación
import { PlayerContext } from './PlayerContext';// Importa el contexto que maneja el estado de la reproducción musical
import { ModalPortal } from 'react-native-modals';// Permite manejar modales en la aplicación
import { GestureHandlerRootView } from 'react-native-gesture-handler';// Proporciona soporte para gestos de pantalla táctil

export default function App() {
  return (
    <PlayerContext>
      {/* Renderiza el sistema de navegación de la app */}
      <Navigation />
      <ModalPortal/>
    </PlayerContext>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});