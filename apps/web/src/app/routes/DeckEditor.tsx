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
  
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editCardText, setEditCardText] = useState('');

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

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchText.trim()) return;
    setIsSubmitting(true);

    const lines = batchText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const newCards = lines.map(text => {
      let pick = 1;
      if (newCardType === 'black') {
        const blanks = (text.match(/_{2,}/g) || []).length;
        pick = Math.max(1, blanks);
      }
      return {
        deck_id: id,
        kind: newCardType,
        text,
        pick
      };
    });

    try {
      const { data, error } = await supabase.from('cards').insert(newCards).select();
      if (error) throw error;
      if (data) {
        setCards([...data, ...cards]);
        setBatchText('');
        setIsBatchMode(false);
      }
    } catch (err) {
      alert("Error al importar cartas");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm("¿Seguro que quieres borrar esta carta?")) return;
    await supabase.from('cards').delete().eq('id', cardId);
    setCards(cards.filter(c => c.id !== cardId));
  };

  const startEditing = (card: any) => {
    setEditingCardId(card.id);
    setEditCardText(card.text);
  };

  const saveEdit = async (card: any) => {
    if (!editCardText.trim() || editCardText === card.text) {
      setEditingCardId(null);
      return;
    }

    let pick = card.pick;
    if (card.kind === 'black') {
      const blanks = (editCardText.match(/_{2,}/g) || []).length;
      pick = Math.max(1, blanks);
    }

    const { error } = await supabase.from('cards').update({ text: editCardText.trim(), pick }).eq('id', card.id);
    if (!error) {
      setCards(cards.map(c => c.id === card.id ? { ...c, text: editCardText.trim(), pick } : c));
    }
    setEditingCardId(null);
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
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button 
            className={`${styles.toggleBtn} ${!isBatchMode ? styles.active : ''}`}
            onClick={() => setIsBatchMode(false)}
          >
            Añadir Individual
          </button>
          <button 
            className={`${styles.toggleBtn} ${isBatchMode ? styles.active : ''}`}
            onClick={() => setIsBatchMode(true)}
          >
            Importar por Lotes
          </button>
        </div>

        {isBatchMode ? (
          <form onSubmit={handleBatchSubmit} className={styles.addForm} style={{ flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <select 
                value={newCardType} 
                onChange={e => setNewCardType(e.target.value as 'white' | 'black')}
                className={styles.select}
              >
                <option value="white">Cartas Blancas</option>
                <option value="black">Cartas Negras</option>
              </select>
            </div>
            <textarea
              placeholder="Pega aquí tus cartas, una por línea..."
              value={batchText}
              onChange={e => setBatchText(e.target.value)}
              className={styles.textarea}
              rows={5}
              required
            />
            <button type="submit" className={styles.buttonPrimary} disabled={!batchText.trim() || isSubmitting} style={{ alignSelf: 'flex-start' }}>
              <Plus size={20} /> {isSubmitting ? 'Importando...' : 'Importar Cartas'}
            </button>
          </form>
        ) : (
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
        )}

        <div className={styles.cardsGrid}>
          {cards.map(card => (
            <div key={card.id} className={`${styles.card} ${card.kind === 'black' ? styles.cardBlack : styles.cardWhite}`}>
              <div className={styles.cardActions}>
                <button className={styles.editBtn} onClick={() => startEditing(card)}>✎</button>
                <button className={styles.deleteBtn} onClick={() => handleDeleteCard(card.id)}>×</button>
              </div>
              
              {editingCardId === card.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', height: '100%' }}>
                  <textarea 
                    value={editCardText} 
                    onChange={e => setEditCardText(e.target.value)}
                    className={styles.editCardInput}
                    autoFocus
                  />
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                    <button className={styles.saveBtn} onClick={() => saveEdit(card)}>Guardar</button>
                    <button className={styles.cancelBtn} onClick={() => setEditingCardId(null)}>Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <p>{card.text}</p>
                  {card.kind === 'black' && card.pick > 1 && (
                    <span className={styles.pickBadge}>Escoge {card.pick}</span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
