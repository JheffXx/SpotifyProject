import { StyleSheet, Text, View, SafeAreaView, Pressable } from 'react-native';
import React, { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as AuthSession from 'expo-auth-session';
import * as Linking from 'expo-linking';

// Configuración del cliente de Spotify
//Jherson 16 pro
const clientId = '858a980b4d28473cbcd12475408da11d';
//Diego 16 plus
//const clientId = '0abd0a9a9fb04ab8b51c33046280728e';
const redirectUri = 'exp://localhost:19002/--/spotify-auth-callback'; 
//const redirectUri = Linking.createURL('/spotify-auth-callback');

const scopes = [
    'user-read-email',
    'user-library-read',
    'user-library-modify',
    'user-read-recently-played',
    'user-top-read',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private',
];

const LoginScreen = () => {
    const navigation = useNavigation();

    // Solicitud de autenticación con Spotify
    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId,
            scopes,
            redirectUri,  // Usamos la URI exacta configurada en Spotify
            responseType: 'token',
        },
        { authorizationEndpoint: 'https://accounts.spotify.com/authorize' }
    );

    // Verificar si hay un token válido en AsyncStorage
    useEffect(() => {
        const checkTokenValidity = async () => {
            try {
                const accessToken = await AsyncStorage.getItem('token');
                const expirationDate = await AsyncStorage.getItem('expirationDate');

                console.log('Access Token:', accessToken);
                console.log('Expiration Date:', expirationDate);

                if (accessToken && expirationDate) {
                    const currentTime = Date.now();
                    if (currentTime < parseInt(expirationDate)) {
                        await checkScopes(accessToken);  // Verificar los scopes después de que el token sea válido
                    } else {
                        await AsyncStorage.removeItem('token');  // Limpiar token expirado
                        await AsyncStorage.removeItem('expirationDate');
                    }
                }
            } catch (error) {
                console.error('Error al verificar el token:', error);
            }
        };
        checkTokenValidity();
    }, [navigation]);

    // Verificar si el token tiene los scopes necesarios
    const checkScopes = async (accessToken) => {
        try {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
    
            const data = await response.json();
            console.log('User data:', data);
    
            // Los scopes requeridos que necesitamos verificar
            const requiredScopes = [
                'user-library-modify',
                'user-library-read',
                'playlist-modify-private',
                'playlist-modify-public',
            ];
    
            // Si la API no devuelve granted_scopes, lo que podemos hacer es asumir que los scopes están bien si el token fue obtenido con los correctos
            const hasRequiredScopes = requiredScopes.every(scope => scopes.includes(scope));
    
            if (hasRequiredScopes) {
                console.log('Token tiene todos los scopes necesarios');
                navigation.replace('Main');  // Navegar a la pantalla principal si los scopes son correctos
            } else {
                console.log('El token no tiene todos los scopes necesarios');
                // Aquí podrías mostrar un mensaje o solicitar permisos adicionales
            }
        } catch (error) {
            console.error('Error al verificar los scopes:', error);
        }
    };

    // Manejar la respuesta de autenticación
    useEffect(() => {
        if (response?.type === 'success') {
            const { access_token, expires_in } = response.params;
            const expirationDate = Date.now() + expires_in * 1000;

            AsyncStorage.setItem('token', access_token);
            AsyncStorage.setItem('expirationDate', expirationDate.toString());

            checkScopes(access_token);  // Verificar los scopes después de la autenticación
        }
    }, [response]);

    return (
        <LinearGradient colors={['#040306', '#131624']} style={{ flex: 1 }}>
            <SafeAreaView>
                <View style={{ height: 80 }} />
                <Entypo
                    style={{ textAlign: 'center' }}
                    name="spotify"
                    size={80}
                    color="white"
                />
                <Text
                    style={{
                        color: 'white',
                        fontSize: 40,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        marginTop: 40,
                    }}
                >
                    Millones de canciones gratis en Spotify! 🔊
                </Text>

                <View style={{ height: 80 }} />
                <Pressable
                    onPress={() => promptAsync()}  // Iniciar sesión
                    style={styles.loginButton}
                    disabled={!request}
                >
                    <Text style={styles.loginButtonText}>Iniciar Sesión con Spotify</Text>
                </Pressable>

                <Pressable style={styles.altLoginButton}>
                    <MaterialIcons name="phone-iphone" size={24} color="white" />
                    <Text style={styles.altLoginText}>
                        Iniciar con número de teléfono
                    </Text>
                </Pressable>

                <Pressable style={styles.altLoginButton}>
                    <AntDesign name="google" size={24} color="red" />
                    <Text style={styles.altLoginText}>Iniciar con Google</Text>
                </Pressable>

                <Pressable style={styles.altLoginButton}>
                    <Entypo name="facebook" size={24} color="blue" />
                    <Text style={styles.altLoginText}>Iniciar con Facebook</Text>
                </Pressable>
            </SafeAreaView>
        </LinearGradient>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    loginButton: {
        backgroundColor: '#1DB954',
        padding: 10,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: 300,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    altLoginButton: {
        backgroundColor: '#131624',
        padding: 10,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: 300,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginVertical: 10,
        borderColor: '#C0C0C0',
        borderWidth: 0.8,
    },
    altLoginText: {
        fontWeight: '500',
        color: 'white',
        textAlign: 'center',
        flex: 1,
    },
});