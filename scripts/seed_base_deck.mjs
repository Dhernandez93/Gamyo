import fs from 'fs';

async function run() {
  console.log("Reading base.md...");
  const content = fs.readFileSync('./content/decks/base.md', 'utf8');
  
  const deckId = '00000000-0000-0000-0000-000000000000';
  let sql = `
-- Insert Deck Base
INSERT INTO public.decks (id, game_id, kind, name, description, is_adult, published, owner_id)
VALUES ('${deckId}', 'hora-del-nache', 'base', 'Mazo Base', 'El mazo principal para jugar Hora del ñache.', true, true, null)
ON CONFLICT (id) DO NOTHING;

-- Borrar cartas si el mazo ya existía para actualizar
DELETE FROM public.cards WHERE deck_id = '${deckId}';

INSERT INTO public.cards (deck_id, kind, text, pick) VALUES
`;

  // Parse lines
  const lines = content.split('\n');
  let currentKind = 'black';
  const cards = [];

  for (const line of lines) {
    if (line.includes('### Cartas Blancas')) {
      currentKind = 'white';
      continue;
    }
    
    // Match "1. Text"
    const match = line.match(/^\d+\.\s+(.*)$/);
    if (match) {
      let text = match[1].trim();
      text = text.replace(/\s*\*\([^)]+\)\*$/, '');
      text = text.replace(/'/g, "''"); // escape SQL quotes
      
      let pick = 1;
      if (currentKind === 'black') {
        const blanks = (text.match(/_{2,}/g) || []).length;
        pick = Math.max(1, blanks);
      }
      
      cards.push(`('${deckId}', '${currentKind}', '${text}', ${pick})`);
    }
  }

  sql += cards.join(',\n') + ';';
  
  fs.writeFileSync('./supabase/seed.sql', sql);
  console.log(`Done! Wrote ${cards.length} cards to seed.sql`);
}

run().catch(console.error);
