import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { PlusCircle, SignIn, UserCircle, X, PencilSimple, GameController, Cards } from '@phosphor-icons/react';
import styles from './Lobby.module.css';

const AVAILABLE_GAMES = [
  { 
    id: 'hora-del-nache', 
    name: 'Hora del ñache', 
    description: 'El juego de cartas para mentes cuestionables. Inspirado en CAH.' 
  },
  {
    id: 'cuarto-rey',
    name: 'Cuarto Rey',
    description: 'El clásico juego de beber con una baraja inglesa. Saca cartas y cumple reglas.'
  },
  {
    id: 'la-oca-curaguilla',
    name: 'La Oca Curagüilla',
    description: 'El tablero interactivo para carretear. Tira los dados, supera desafíos y no arrugues.'
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
  
  // Opciones de sala - Hora del Ñache
  const [scoreToWin, setScoreToWin] = useState(7);
  const [allowExpansions, setAllowExpansions] = useState(true);
  const [myDecks, setMyDecks] = useState<any[]>([]);
  const [selectedDecks, setSelectedDecks] = useState<string[]>(['base']);

  // Opciones de sala - La Oca Curagüilla
  const [ocaLevels, setOcaLevels] = useState<number[]>([1, 2]);
  const [ocaBoardSize] = useState<number>(50);
  const [ocaPenaltyType, setOcaPenaltyType] = useState<'fondo_blanco' | 'cinco_sorbos'>('fondo_blanco');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('player_private').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(data);
          setNewNickname(data.nickname || '');
        } else {
          await supabase.auth.signOut();
          navigate('/');
        }
        
        // Fetch mis expansiones
        const { data: decks } = await supabase.from('decks').select('id, name').eq('owner_id', user.id);
        if (decks) setMyDecks(decks);
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

      let settingsPayload: any = {};
      if (selectedGameId === 'hora-del-nache') {
        settingsPayload = { scoreToWin, allowExpansions, decks: selectedDecks };
      } else if (selectedGameId === 'la-oca-curaguilla') {
        settingsPayload = {
          enabledLevels: ocaLevels.length > 0 ? ocaLevels : [1, 2],
          boardSize: ocaBoardSize,
          penaltyType: ocaPenaltyType
        };
      }

      const { data, error: fnError } = await supabase.functions.invoke('room-admin', {
        body: { 
          action: 'create', 
          payload: { 
            gameId: selectedGameId,
            settings: settingsPayload
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
            {profile?.is_anonymous ? (
              <p style={{ color: 'var(--color-primary)', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 'bold' }}>
                Debes iniciar sesión con Google para crear salas.
              </p>
            ) : null}
            <button 
              className={styles.buttonPrimary} 
              onClick={() => setIsGameSelectorOpen(true)}
              disabled={isLoading || profile?.is_anonymous}
              style={{ opacity: profile?.is_anonymous ? 0.5 : 1, cursor: profile?.is_anonymous ? 'not-allowed' : 'pointer' }}
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

          {!profile?.is_anonymous && profile && (
            <>
              <div className={styles.actionCard}>
                <div className={styles.iconWrapper}>
                  <Cards size={48} weight="duotone" className={styles.iconPrimary} />
                </div>
                <h2>Mis Expansiones</h2>
                <p>Crea mazos personalizados con tus propias cartas.</p>
                <button 
                  className={styles.buttonSecondary} 
                  onClick={() => navigate('/decks')}
                  style={{ width: '100%', marginTop: 'auto' }}
                >
                  Abrir Editor
                </button>
              </div>

              <div className={styles.actionCard}>
                <div className={styles.iconWrapper}>
                  <GameController size={48} weight="duotone" className={styles.iconPrimary} style={{ color: '#10b981' }} />
                </div>
                <h2>Cuarto Rey (Solo)</h2>
                <p>Modo offline para jugar en un solo teléfono. No requiere internet.</p>
                <button 
                  className={styles.buttonSecondary} 
                  onClick={() => navigate('/cuarto-rey-solo')}
                  style={{ width: '100%', marginTop: 'auto', borderColor: '#10b981', color: '#10b981' }}
                >
                  Jugar Offline
                </button>
              </div>
            </>
          )}
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

                  {myDecks.length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Mis Expansiones:</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {myDecks.map(deck => (
                          <label key={deck.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={selectedDecks.includes(deck.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedDecks([...selectedDecks, deck.id]);
                                else setSelectedDecks(selectedDecks.filter(id => id !== deck.id));
                              }}
                              style={{ accentColor: 'var(--color-primary)' }}
                            />
                            {deck.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedGameId === 'la-oca-curaguilla' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <label style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                      Intensidad del Carrete (Niveles):
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {[
                        { level: 1, name: 'Nivel 1: Previa / Rompehielo', desc: 'Anécdotas suaves, reflejos, votaciones absurdas.' },
                        { level: 2, name: 'Nivel 2: Cahuín / Picante', desc: 'Secretos, exparejas, roces y verdades incómodas.' },
                        { level: 3, name: 'Nivel 3: Calentura / Hot', desc: 'Atracción, toqueteos consensuados, prendas menores.' },
                        { level: 4, name: 'Nivel 4: Modo Valiente (18+)', desc: 'Piquitos, llamadas telefónicas, retos extremos.' }
                      ].map(item => (
                        <label key={item.level} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox"
                            checked={ocaLevels.includes(item.level)}
                            onChange={(e) => {
                              if (e.target.checked) setOcaLevels(prev => [...prev, item.level]);
                              else {
                                if (ocaLevels.length > 1) setOcaLevels(prev => prev.filter(l => l !== item.level));
                                else alert("Debes dejar al menos 1 nivel seleccionado.");
                              }
                            }}
                            style={{ accentColor: 'var(--color-primary)', marginTop: '2px' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{item.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <label style={{ fontSize: '0.85rem' }}>Castigo por arrugar:</label>
                    <select 
                      value={ocaPenaltyType} 
                      onChange={e => setOcaPenaltyType(e.target.value as any)}
                      className={styles.input}
                      style={{ padding: '0.4rem 0.6rem', borderRadius: '4px', background: 'var(--color-surface)', color: 'white', border: '1px solid var(--color-border)' }}
                    >
                      <option value="fondo_blanco">Fondo Blanco (Seco)</option>
                      <option value="cinco_sorbos">5 Sorbos Grandes</option>
                    </select>
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
