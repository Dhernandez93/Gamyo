import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import styles from './MyDecks.module.css';

export default function MyDecks() {
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // State for creating a new deck
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [selectedGameId, setSelectedGameId] = useState('hora-del-nache');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setDecks(data);
    }
    setLoading(false);
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim() || !user) return;
    
    setIsCreating(true);
    try {
      const { data, error } = await supabase.from('decks').insert({
        name: newDeckName,
        game_id: selectedGameId,
        kind: 'expansion',
        owner_id: user.id,
        is_adult: true,
        published: false
      }).select().single();
      
      if (error) throw error;
      if (data) {
        setDecks([data, ...decks]);
        setNewDeckName('');
        navigate(`/decks/${data.id}`); // Ir al editor
      }
    } catch (err) {
      console.error(err);
      alert('Error al crear el mazo');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) return <div className={styles.container}>Cargando tus mazos...</div>;
  if (!user) return <div className={styles.container}>Debes iniciar sesión para crear mazos.</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <button 
            onClick={() => navigate('/lobby')} 
            style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text)', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer' }}
          >
            ← Volver
          </button>
          <h1 style={{ margin: 0 }}>Mis Expansiones</h1>
        </div>
        <p>Crea tus propios mazos personalizados para jugar con amigos.</p>
      </header>
      
      <main className={styles.main}>
        <form onSubmit={handleCreateDeck} className={styles.createForm}>
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%', flexDirection: 'column' }}>
            <input 
              type="text" 
              placeholder="Nombre de la expansión..." 
              value={newDeckName}
              onChange={(e) => setNewDeckName(e.target.value)}
              className={styles.input}
              required
              maxLength={50}
            />
            <select 
              value={selectedGameId} 
              onChange={(e) => setSelectedGameId(e.target.value)}
              className={styles.input}
              style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)' }}
            >
              <option value="hora-del-nache">Hora del ñache</option>
              <option value="cuarto-rey">Cuarto Rey</option>
            </select>
            <button type="submit" className={styles.buttonPrimary} disabled={isCreating || !newDeckName.trim()}>
              {isCreating ? 'Creando...' : 'Crear nueva expansión'}
            </button>
          </div>
        </form>

        <div className={styles.deckList}>
          {decks.length === 0 ? (
            <p className={styles.emptyState}>No tienes ninguna expansión creada todavía.</p>
          ) : (
            decks.map(deck => (
              <div key={deck.id} className={styles.deckCard} onClick={() => navigate(`/decks/${deck.id}`)}>
                <h2>{deck.name}</h2>
                <div className={styles.deckMeta}>
                  <span className={deck.published ? styles.badgePublic : styles.badgePrivate}>
                    {deck.published ? 'Público' : 'Privado'}
                  </span>
                  <span className={styles.badgeAdult} style={{ marginLeft: '0.5rem' }}>
                    {deck.game_id === 'cuarto-rey' ? 'Cuarto Rey' : 'Hora del ñache'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
