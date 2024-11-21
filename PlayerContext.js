import { createContext, useState } from "react";

// Crea un contexto llamado 'Player' que permitirá compartir el estado del reproductor
const Player = createContext();
// Define un componente 'PlayerContext' que envolverá los componentes hijos
const PlayerContext = ({ children }) => {
    // Declara un estado 'currentTrack' para almacenar la pista actual
    // 'setCurrentTrack' es la función para actualizar este estado
    const [currentTrack, setCurrentTrack] = useState(null);
    return (
        // El proveedor de contexto (Player.Provider) permite que los componentes hijos accedan
        // al estado actual de la pista y a la función para actualizarlo
        <Player.Provider value={{ currentTrack, setCurrentTrack }}>
            {/* Los componentes hijos pueden acceder a 'currentTrack' y 'setCurrentTrack' */}
            {children}
        </Player.Provider>
    );
};

// Exporta tanto el contexto como el componente del contexto para que puedan ser utilizados en otras partes de la app
export { PlayerContext, Player };