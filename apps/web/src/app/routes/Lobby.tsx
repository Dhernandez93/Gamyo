import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { PlusCircle, SignIn, UserCircle, X, PencilSimple, GameController } from '@phosphor-icons/react';
import styles from './Lobby.module.css';

const AVAILABLE_GAMES = [
  { 
    id: 'hora-del-nache', 
    name: 'Hora del ñache', 
    description: 'El juego de cartas para mentes cuestionables. Inspirado en CAH.' 
  }
];

export default function Lobby() {
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Perfil del usuario
  const [profile, setProfile] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Creación de sala
  const [isGameSelectorOpen, setIsGameSelectorOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string>(AVAILABLE_GAMES[0].id);
  
  // Opciones de sala
  const [scoreToWin, setScoreToWin] = useState(7);
  const [allowExpansions, setAllowExpansions] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('player_private').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(data);
          setNewNickname(data.nickname || '');
        } else {
          // El perfil no existe (posiblemente porque se reinició la DB de Supabase).
          await supabase.auth.signOut();
          navigate('/');
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) throw new Error("No autenticado");

      const { data, error: fnError } = await supabase.functions.invoke('room-admin', {
        body: { 
          action: 'create', 
          payload: { 
            gameId: selectedGameId,
            settings: {
              scoreToWin,
              allowExpansions,
              // default decks
              decks: ['base']
            }
          } 
        }
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      navigate(`/room/${data.roomId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al crear la sala");
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.length !== 4) {
      setError("El código debe tener 4 letras.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('room-admin', {
        body: { action: 'join', payload: { roomId: roomCode.toUpperCase() } }
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      navigate(`/room/${data.roomId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al unirse a la sala");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNickname.trim() || !profile) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase.from('player_private')
        .update({ nickname: newNickname.trim() })
        .eq('id', profile.id);
      
      if (error) throw error;
      setProfile({ ...profile, nickname: newNickname.trim() });
      setIsProfileModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Menú Principal</h1>
        
        {profile && (
          <button 
            className={styles.userProfileBtn} 
            onClick={() => profile.is_anonymous && setIsProfileModalOpen(true)}
            title={profile.is_anonymous ? "Cambiar apodo" : "Perfil"}
          >
            <div className={styles.userInfo}>
              <span className={styles.userName}>{profile.nickname}</span>
              {profile.is_anonymous && <PencilSimple size={14} className={styles.editIcon} />}
            </div>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className={styles.avatarImg} />
            ) : (
              <UserCircle size={36} weight="duotone" className={styles.avatarPlaceholder} />
            )}
          </button>
        )}
      </header>
      
      <main className={styles.main}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.cardsContainer}>
          <div className={styles.actionCard}>
            <div className={styles.iconWrapper}>
              <PlusCircle size={48} weight="duotone" className={styles.iconPrimary} />
            </div>
            <h2>Crear Sala</h2>
            <p>Conviértete en el Host y configura las expansiones.</p>
            <button 
              className={styles.buttonPrimary} 
              onClick={() => setIsGameSelectorOpen(true)}
              disabled={isLoading}
            >
              Crear Nueva Sala
            </button>
          </div>

          <div className={styles.actionCard}>
            <div className={styles.iconWrapper}>
              <SignIn size={48} weight="duotone" className={styles.iconSecondary} />
            </div>
            <h2>Unirse a Sala</h2>
            <p>Ingresa el código que te dio tu amigo.</p>
            <form onSubmit={handleJoinRoom} className={styles.joinForm}>
              <input
                type="text"
                placeholder="Ej: ABCD"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={4}
                className={styles.codeInput}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                className={styles.buttonSecondary}
                disabled={isLoading || roomCode.length !== 4}
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Modal Selección de Juego */}
      {isGameSelectorOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeBtn} onClick={() => setIsGameSelectorOpen(false)}>
              <X size={24} />
            </button>
            <h2>Elegir Juego</h2>
            <p>¿A qué quieres jugar hoy?</p>
            
            <form onSubmit={handleCreateRoom} className={styles.modalForm}>
              <div className={styles.gameOptionsContainer}>
                {AVAILABLE_GAMES.map(game => (
                  <label 
                    key={game.id} 
                    className={`${styles.gameOption} ${selectedGameId === game.id ? styles.gameOptionSelected : ''}`}
                  >
                    <input 
                      type="radio" 
                      name="game" 
                      value={game.id} 
                      checked={selectedGameId === game.id}
                      onChange={() => setSelectedGameId(game.id)}
                      className="sr-only"
                    />
                    <div className={styles.gameOptionIcon}>
                      <GameController size={32} weight="duotone" />
                    </div>
                    <div className={styles.gameOptionInfo}>
                      <h3>{game.name}</h3>
                      <p>{game.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              {selectedGameId === 'hora-del-nache' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.9rem' }}>Puntos para ganar:</label>
                    <input 
                      type="number" 
                      min="3" max="20"
                      value={scoreToWin} 
                      onChange={e => setScoreToWin(Number(e.target.value))}
                      className={styles.input}
                      style={{ width: '80px', padding: '0.5rem', textAlign: 'center' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="allowExp" style={{ fontSize: '0.9rem', cursor: 'pointer' }}>
                      Permitir proponer expansiones
                    </label>
                    <input 
                      type="checkbox" 
                      id="allowExp"
                      checked={allowExpansions} 
                      onChange={e => setAllowExpansions(e.target.checked)}
                      style={{ width: '24px', height: '24px', accentColor: 'var(--color-primary)' }}
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className={styles.buttonPrimary}
                disabled={isLoading || !selectedGameId}
                style={{ marginTop: '1.5rem' }}
              >
                {isLoading ? 'Creando...' : 'Confirmar y Crear'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cambio de Apodo */}
      {isProfileModalOpen && profile?.is_anonymous && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeBtn} onClick={() => setIsProfileModalOpen(false)}>
              <X size={24} />
            </button>
            <h2>Cambiar Apodo</h2>
            <p>Como eres un jugador anónimo, puedes cambiarte el nombre cuando quieras.</p>
            
            <form onSubmit={handleUpdateNickname} className={styles.modalForm}>
              <input
                type="text"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                maxLength={20}
                className={styles.input}
                placeholder="Nuevo apodo"
                autoFocus
              />
              <button 
                type="submit" 
                className={styles.buttonPrimary}
                disabled={isUpdating || !newNickname.trim() || newNickname.trim() === profile.nickname}
              >
                {isUpdating ? 'Guardando...' : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
