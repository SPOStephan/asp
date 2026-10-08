// Checks the AI knowledge without a database or a paid model: text splitting, web page
// reading, the concierge prompt, answer parsing and the OpenAI-compatible client (against
// a local fake provider). Run: npx tsx scripts/check-knowledge.ts
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { buildSystemPrompt, cleanSearchTerms, readJudgement, readQaPairs, type ConciergeContext } from '../src/ai/concierge';
import { crawlableLinks, htmlToText, isPublicHttpUrl, pageChunks } from '../src/ai/htmlText';
import { complete, listModels, stream } from '../src/ai/provider';
import { answerParts, conciergeConfig, guestText, safeHref } from '../src/lib/concierge';
import { chunkMarkdown, chunkText, GAP_MARKER, readAnswer, stripGapMarker } from '../src/lib/knowledge';

let failed = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok || detail === undefined ? '' : ` -> ${JSON.stringify(detail)}`}`);
  if (!ok) failed += 1;
}

// Splitting
const long = Array.from({ length: 40 }, (_, index) => `Absatz ${index}: ${'Wort '.repeat(30)}`).join('\n\n');
const chunks = chunkText(long, 800);
check('chunks stay below the limit', chunks.every((chunk) => chunk.length <= 800), chunks.map((chunk) => chunk.length));
check('nothing is lost when splitting', chunks.join(' ').replace(/\s+/g, ' ').length >= long.replace(/\s+/g, ' ').length - 40);
const md = chunkMarkdown('# Spa\n\nIntro\n\n## Öffnungszeiten\n\nTäglich 7–22 Uhr\n\n## Preise\n\nSauna inklusive', 'https://x.de/spa');
check('markdown headings become chunk headings', md.map((chunk) => chunk.heading).join('|') === 'Spa|Spa – Öffnungszeiten|Spa – Preise', md);
check('markdown chunks keep the page address', md.every((chunk) => chunk.url === 'https://x.de/spa'));

// Web pages
const html = `<!doctype html><html><head><title>Spa &amp; Wellness | Hotel</title><script>var x='<p>nein</p>'</script></head>
<body><nav><a href="/zimmer">Zimmer</a></nav><main><h1>Spa &amp; Wellness</h1><p>Die Sauna ist t&auml;glich ge&ouml;ffnet.</p>
<h2>Massagen</h2><ul><li>Hot Stone 60&nbsp;Minuten</li><li>Aroma</li></ul><table><tr><td>Sauna</td><td>7–22 Uhr</td></tr></table>
<a href="/spa/massagen#top">mehr</a><a href="https://andere-seite.de/">extern</a><a href="/prospekt.pdf">PDF</a><a href="mailto:a@b.de">Mail</a></main>
<div><video
class="slider"
autoplay>Video</video><span
class="x">Ein Satz über
zwei Zeilen.</span><button>Button</button></div>
<footer>Impressum</footer></body></html>`;
const page = htmlToText(html, 'https://hotel.de/spa');
check('page title', page.title === 'Spa & Wellness | Hotel', page.title);
check('entities decoded', page.markdown.includes('täglich geöffnet'), page.markdown);
check('scripts, navigation and footer removed', !page.markdown.includes('nein') && !page.markdown.includes('Impressum') && !page.markdown.includes('Zimmer'), page.markdown);
check('list items kept', page.markdown.includes('- Hot Stone 60 Minuten'), page.markdown);
check('tags over several lines removed', !page.markdown.includes('class=') && !page.markdown.includes('Button') && page.markdown.includes('Ein Satz über'), page.markdown);
check('table cells kept', page.markdown.includes('Sauna | 7–22 Uhr'), page.markdown);
const pieces = pageChunks(page, 'https://hotel.de/spa');
check('page becomes chunks with headings', pieces.some((chunk) => chunk.heading?.includes('Massagen')), pieces);
const links = crawlableLinks(page.links, 'https://hotel.de/');
check('crawler stays on the site and skips files', links.join() === 'https://hotel.de/zimmer,https://hotel.de/spa/massagen', links);
check('internal addresses are refused', !isPublicHttpUrl('http://localhost:3000') && !isPublicHttpUrl('http://192.168.0.1') && !isPublicHttpUrl('file:///etc/passwd') && isPublicHttpUrl('https://hotel.de/a'));

// Prompt
const ctx: ConciergeContext = {
  hotel: { id: 'h1', name: 'Hotel Meer', url: 'https://meer.de', phone: '+49 1', email: 'info@meer.de', bookingUrl: 'https://buchen.example/meer' },
  siblings: [{ id: 'h2', name: 'Hotel Berg', url: 'https://berg.de' }],
  rules: ['Immer die Öffnungszeiten nennen.'],
  tone: 'Per Sie.',
  crossSelling: true,
  corrections: [{ chunk_id: 'c1', source_id: 's1', kind: 'correction', title: 'Korrektur: Hund', heading: 'Was kostet der Hund?', content: 'Hunde 25 Euro pro Nacht.', url: null, source_hotel: 'h1' }],
  hits: [
    { chunk_id: 'c1', source_id: 's1', kind: 'correction', title: 'dup', heading: null, content: 'dup', url: null, source_hotel: 'h1' },
    { chunk_id: 'c2', source_id: 's2', kind: 'website', title: 'Website', heading: 'Hunde', content: 'Hunde 10 Euro.', url: 'https://meer.de/faq', source_hotel: 'h1' },
    { chunk_id: 'c3', source_id: 's3', kind: 'website', title: 'Website Berg', heading: 'Ski', content: 'Skifahren am Hotel.', url: 'https://berg.de/', source_hotel: 'h2' },
    { chunk_id: 'c4', source_id: 's4', kind: 'text', title: 'Gutscheine', heading: null, content: 'Gutscheine gelten überall.', url: null, source_hotel: null },
  ],
  today: 'Freitag, 9. Oktober 2026',
};
const prompt = buildSystemPrompt(ctx);
check('corrections come first and win', prompt.sources[0].kind === 'correction' && prompt.system.indexOf('KORREKTUREN') < prompt.system.indexOf('Hunde 10 Euro'));
check('each chunk only once', prompt.sources.length === 4, prompt.sources.map((source) => source.chunk_id));
check('sources are numbered in the prompt', prompt.system.includes('[1] Korrektur: Hund') && prompt.system.includes('[4] Gutscheine'), prompt.system);
check('rules and tone are in the prompt', prompt.system.includes('Immer die Öffnungszeiten nennen.') && prompt.system.includes('Per Sie.'));
check('owner of each source is named', prompt.system.includes('anderes Hotel der Gruppe: Hotel Berg') && prompt.system.includes('gilt für die ganze Gruppe'));
check('booking link instead of prices', prompt.system.includes('https://buchen.example/meer'));
check('gap marker explained', prompt.system.includes(GAP_MARKER));
const noCross = buildSystemPrompt({ ...ctx, crossSelling: false });
check('no other hotels without cross-selling', !noCross.system.includes('Hotel Berg') && !noCross.sources.some((source) => source.hotel_id === 'h2'));

// Answers
const answer = readAnswer(`Hunde kosten 25 Euro pro Nacht [1]. Gutscheine gelten überall [2, 4].\n${GAP_MARKER}`, prompt.sources);
check('gap detected and removed', answer.gap && !answer.answer.includes('LUECKE'));
check('cited sources marked', answer.sources.filter((source) => source.cited).map((source) => source.n).join() === '1,2,4', answer.sources);
check('half a marker is hidden while streaming', stripGapMarker('Bitte rufen Sie an. [[LUE') === 'Bitte rufen Sie an. ');
check('search terms cleaned', cleanSearchTerms('Hund, Kosten; "Haustier"!') === 'Hund Kosten Haustier');
check('judgement read', readJudgement('```json\n{"pass": true, "reason": "stimmt"}\n```').pass === true);
check('unreadable judgement fails', readJudgement('weiß nicht').pass === false);
check('question-answer pairs read', readQaPairs('Hier: [{"question":"Parken?","answer":"Tiefgarage 15 €"},{"question":"","answer":"x"}]').length === 1);

// Website chat
const off = conciergeConfig(undefined, 'Hotel Meer');
check('chat is off until switched on', !off.enabled && off.greeting.includes('Hotel Meer'));
const on = conciergeConfig({ enabled: true, name: 'Ella', suggestions: ['A', '', 'B', 'C', 'D', 'E'] }, 'Hotel Meer');
check('chat config read', on.enabled && on.name === 'Ella' && on.suggestions.join() === 'A,B,C,D', on);
check('guests see no source numbers', guestText('Hunde 25 € [1]. Sauna 7–22 Uhr [2, 3].') === 'Hunde 25 €. Sauna 7–22 Uhr.', guestText('Hunde 25 € [1]. Sauna 7–22 Uhr [2, 3].'));
const parts = answerParts('Buchen Sie hier: https://buchen.example/meer. Mehr unter [Spa](/wellness) oder **heute** [x](javascript:alert(1))');
check('links and bold in answers', parts.some((part) => part.type === 'link' && part.href === 'https://buchen.example/meer') && parts.some((part) => part.type === 'link' && part.href === '/wellness') && parts.some((part) => part.type === 'bold'), parts);
check('no script links', !parts.some((part) => part.type === 'link' && part.href.startsWith('javascript')) && safeHref('javascript:alert(1)') === null && safeHref('//evil.example') === null);

// Provider against a fake OpenAI-compatible server
const seen: Array<Record<string, unknown>> = [];
const server = createServer((request, response) => {
  let raw = '';
  request.on('data', (part) => (raw += part));
  request.on('end', () => {
    if (request.url === '/v1/models') {
      response.setHeader('Content-Type', 'application/json');
      response.end(JSON.stringify({ data: [{ id: 'b/model', name: 'B', pricing: { prompt: '0.000002', completion: '0.00001' }, architecture: { input_modalities: ['text', 'image'] } }, { id: 'a/model' }] }));
      return;
    }
    if (request.headers.authorization !== 'Bearer test-key') {
      response.statusCode = 401;
      response.end(JSON.stringify({ error: { message: 'bad key' } }));
      return;
    }
    const body = JSON.parse(raw) as Record<string, unknown>;
    seen.push(body);
    if (body.stream) {
      response.setHeader('Content-Type', 'text/event-stream');
      response.write(': OPENROUTER PROCESSING\n\n');
      for (const piece of ['Hallo', ' Gast', ' [1]']) response.write(`data: ${JSON.stringify({ model: 'x/real', choices: [{ delta: { content: piece } }] })}\n\n`);
      response.write(`data: ${JSON.stringify({ choices: [], usage: { prompt_tokens: 10, completion_tokens: 3, cost: 0.0004 } })}\n\n`);
      response.end('data: [DONE]\n\n');
      return;
    }
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ model: 'x/real', choices: [{ message: { content: 'fertig' } }], usage: { prompt_tokens: 5 } }));
  });
});
await new Promise<void>((resolve) => server.listen(0, resolve));
const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`;
const config = { baseUrl: base, apiKey: 'test-key' };
const done = await complete(config, { model: 'x/model', messages: [{ role: 'user', content: 'hi' }] });
check('complete returns text, model and usage', done.text === 'fertig' && done.model === 'x/real' && done.usage?.prompt_tokens === 5, done);
const deltas: string[] = [];
const streamed = await stream(config, { model: 'x/model', messages: [{ role: 'user', content: 'hi' }] }, (text) => deltas.push(text));
check('stream delivers pieces in order', deltas.join('') === 'Hallo Gast [1]' && streamed.text === 'Hallo Gast [1]', deltas);
check('stream reads usage and cost', streamed.usage?.cost === 0.0004, streamed.usage);
check('stream asks for usage', (seen[1].stream_options as { include_usage?: boolean })?.include_usage === true);
check('no provider-specific fields for other providers', !('usage' in seen[0]));
const models = await listModels(config);
check('models listed with prices per million', models[0].id === 'a/model' && models[1].inputPrice === 2 && models[1].vision === true, models);
let error = '';
try {
  await complete({ ...config, apiKey: 'wrong' }, { model: 'x', messages: [] });
} catch (err) {
  error = err instanceof Error ? err.message : String(err);
}
check('provider errors are readable', error.includes('401') && error.includes('bad key'), error);
server.close();

if (failed) {
  console.log(`\n${failed} Prüfung(en) fehlgeschlagen.`);
  process.exit(1);
}
console.log('\nAlle Prüfungen bestanden.');
