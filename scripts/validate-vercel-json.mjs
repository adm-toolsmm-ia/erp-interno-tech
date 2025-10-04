import { readFileSync } from 'node:fs';

try {
  const content = readFileSync('vercel.json', 'utf8');
  const parsed = JSON.parse(content);
  console.log('âœ… vercel.json: JSON vÃ¡lido');
  console.log('ðŸ“‹ Estrutura:', Object.keys(parsed));
} catch (e) {
  console.error('âŒ vercel.json invÃ¡lido:', e.message);
  process.exit(1);
}
