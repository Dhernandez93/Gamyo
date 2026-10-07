import * as fs from 'fs';
import * as path from 'path';

function parseDeck(content: string) {
  const blackCards: { text: string, pick: number }[] = [];
  const whiteCards: { text: string }[] = [];
  
  let currentSection = '';

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('### Cartas Negras')) {
      currentSection = 'black';
      continue;
    }
    if (trimmed.startsWith('### Cartas Blancas')) {
      currentSection = 'white';
      continue;
    }

    // Match "1. " or "12. "
    const match = trimmed.match(/^\d+\.\s*(.+)$/);
    if (match) {
      let text = match[1].trim();
      
      if (currentSection === 'black') {
        // Normalize blanks: 3 or more underscores become exactly 4
        text = text.replace(/_{3,}/g, '____');
        
        // Calculate pick
        const blanksCount = (text.match(/____/g) || []).length;
        const pick = Math.max(1, blanksCount);
        
        blackCards.push({ text, pick });
      } else if (currentSection === 'white') {
        whiteCards.push({ text });
      }
    }
  }

  return { blackCards, whiteCards };
}

function generateSeedSql(deckId: string, deckName: string, deckType: string, parsed: ReturnType<typeof parseDeck>) {
  let sql = `-- Seed for Deck: ${deckName}\n`;
  sql += `INSERT INTO public.decks (id, game_id, kind, owner_id, name, description, is_adult, published)\n`;
  sql += `VALUES ('${deckId}', 'hora-del-nache', '${deckType}', null, '${deckName}', 'Expansión oficial', true, true)\n`;
  sql += `ON CONFLICT (id) DO NOTHING;\n\n`;

  sql += `INSERT INTO public.cards (deck_id, kind, text, pick) VALUES\n`;
  
  const values: string[] = [];
  
  for (const card of parsed.blackCards) {
    const safeText = card.text.replace(/'/g, "''");
    values.push(`('${deckId}', 'black', '${safeText}', ${card.pick})`);
  }
  
  for (const card of parsed.whiteCards) {
    const safeText = card.text.replace(/'/g, "''");
    values.push(`('${deckId}', 'white', '${safeText}', 1)`);
  }

  sql += values.join(',\n') + `\nON CONFLICT DO NOTHING;\n`;
  
  return sql;
}

function main() {
  const mazoAPath = path.join(__dirname, '../content/decks/expansion-mazo-a.md');
  const mazoAContent = fs.readFileSync(mazoAPath, 'utf8');
  const mazoAParsed = parseDeck(mazoAContent);
  
  console.log(`Mazo A: ${mazoAParsed.blackCards.length} black cards, ${mazoAParsed.whiteCards.length} white cards`);
  
  const basePath = path.join(__dirname, '../content/decks/base.md');
  const baseContent = fs.readFileSync(basePath, 'utf8');
  const baseParsed = parseDeck(baseContent);
  
  console.log(`Base Deck: ${baseParsed.blackCards.length} black cards, ${baseParsed.whiteCards.length} white cards`);

  // Fixed UUIDs for official decks
  const MAZO_A_UUID = '11111111-1111-1111-1111-111111111111';
  const BASE_UUID = '00000000-0000-0000-0000-000000000000';

  const mazoASql = generateSeedSql(MAZO_A_UUID, 'Mazo A', 'expansion', mazoAParsed);
  const baseSql = generateSeedSql(BASE_UUID, 'Mazo Base', 'base', baseParsed);

  const seedPath = path.join(__dirname, '../supabase/seed.sql');
  fs.writeFileSync(seedPath, baseSql + '\n\n' + mazoASql);
  console.log(`Seed written to ${seedPath}`);
}

main();
