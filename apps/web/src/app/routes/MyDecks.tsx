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
        game_id: 'hora-del-nache',
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
        <h1>Mis Expansiones</h1>
        <p>Crea tus propios mazos personalizados para jugar con amigos.</p>
      </header>
      
      <main className={styles.main}>
        <form onSubmit={handleCreateDeck} className={styles.createForm}>
          <input 
            type="text" 
            placeholder="Nombre de la expansión..." 
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            className={styles.input}
            required
            maxLength={50}
          />
          <button type="submit" className={styles.buttonPrimary} disabled={isCreating || !newDeckName.trim()}>
            {isCreating ? 'Creando...' : 'Crear nueva expansión'}
          </button>
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
                  <span className={styles.badgeAdult}>+18</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
