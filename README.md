# SpotifyProject
Para ingresar a la aplicación, se deberá de cambiar el clientID que se encuentra en LoginScreen.js; dentro de la carpeta Screens:
// Configuración del cliente de Spotify
//Jherson 16 pro
const clientId = '858a980b4d28473cbcd12475408da11d';
//Diego 16 plus
//const clientId = '0abd0a9a9fb04ab8b51c33046280728e';
//const redirectUri = 'exp://localhost:19002/--/spotify-auth-callback'; 
const redirectUri = 'com.spotify://spotify-auth-callback';

El redirectUri debe ser el mismo en la cuenta de Spotify Developers para que la aplicación pueda autenticar mediante spotify

