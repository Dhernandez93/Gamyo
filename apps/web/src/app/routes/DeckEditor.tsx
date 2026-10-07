import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from '@phosphor-icons/react';
import styles from './DeckEditor.module.css';

export default function DeckEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newCardType, setNewCardType] = useState<'black' | 'white'>('white');
  const [newCardText, setNewCardText] = useState('');

  useEffect(() => {
    fetchDeck();
  }, [id]);

  const fetchDeck = async () => {
    setLoading(true);
    const { data: deckData } = await supabase.from('decks').select('*').eq('id', id).single();
    if (deckData) {
      setDeck(deckData);
      const { data: cardsData } = await supabase.from('cards').select('*').eq('deck_id', id).order('created_at', { ascending: false });
      setCards(cardsData || []);
    }
    setLoading(false);
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardText.trim()) return;

    let pick = 1;
    if (newCardType === 'black') {
      const blanks = (newCardText.match(/_{2,}/g) || []).length;
      pick = Math.max(1, blanks);
    }

    const { data, error } = await supabase.from('cards').insert({
      deck_id: id,
      kind: newCardType,
      text: newCardText.trim(),
      pick
    }).select().single();

    if (!error && data) {
      setCards([data, ...cards]);
      setNewCardText('');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    await supabase.from('cards').delete().eq('id', cardId);
    setCards(cards.filter(c => c.id !== cardId));
  };

  if (loading) return <div className={styles.container}>Cargando mazo...</div>;
  if (!deck) return <div className={styles.container}>Mazo no encontrado</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/decks')}>
          <ArrowLeft size={24} />
          <span>Volver</span>
        </button>
        <h1>{deck.name}</h1>
      </header>

      <main className={styles.main}>
        <form onSubmit={handleAddCard} className={styles.addForm}>
          <select 
            value={newCardType} 
            onChange={e => setNewCardType(e.target.value as 'white' | 'black')}
            className={styles.select}
          >
            <option value="white">Carta Blanca</option>
            <option value="black">Carta Negra</option>
          </select>
          
          <input 
            type="text" 
            placeholder={newCardType === 'white' ? "Escribe la respuesta..." : "Usa ____ para los espacios en blanco..."}
            value={newCardText}
            onChange={e => setNewCardText(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" className={styles.buttonPrimary} disabled={!newCardText.trim()}>
            <Plus size={20} /> Añadir
          </button>
        </form>

        <div className={styles.cardsGrid}>
          {cards.map(card => (
            <div key={card.id} className={`${styles.card} ${card.kind === 'black' ? styles.cardBlack : styles.cardWhite}`}>
              <button className={styles.deleteBtn} onClick={() => handleDeleteCard(card.id)}>×</button>
              <p>{card.text}</p>
              {card.kind === 'black' && card.pick > 1 && (
                <span className={styles.pickBadge}>Escoge {card.pick}</span>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
