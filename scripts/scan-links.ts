// 掃描人物與戰爭、時代等時間軸之間「內文提到、卻沒有 see: 連結」的配對，新增時間軸後執行：
//   npx vite-node scripts/scan-links.ts            全部
//   npx vite-node scripts/scan-links.ts Socrates   只看和這條時間軸有關的配對
//   加上 --all 會一併列出人物只提到 1 次的配對
import fs from 'node:fs';
import path from 'node:path';
import { buildNameIndex, mentions } from '../src/lib/nameIndex';
import { parseExtraPeople } from '../src/lib/extraPeople';
import { parseTimeline } from '../src/lib/parseTimeline';
import { buildRelationGraph, timelineTerms, TOPIC_MIN_EVENTS } from '../src/lib/relationGraph';
import type { Timeline } from '../src/types';

const dataDir = path.resolve(import.meta.dirname, '..', 'Data');
const timelines: Timeline[] = fs
  .readdirSync(dataDir)
  .filter((file) => file.toLowerCase().endsWith('.md'))
  .sort()
  .map((file) => parseTimeline(fs.readFileSync(path.join(dataDir, file), 'utf8'), path.basename(file, '.md')))
  .filter((t) => t.events.length > 0 || t.periods.length > 0);
const args = process.argv.slice(2);
const all = args.includes('--all');
const only = args.find((a) => !a.startsWith('--'));

// 補充人物（Data/index/people.md）的時間軸也算「有主人」，和網站上的人名索引一致
const extraFile = path.join(dataDir, 'index', 'people.md');
const extras = fs.existsSync(extraFile) ? parseExtraPeople(fs.readFileSync(extraFile, 'utf8')) : [];
const index = buildNameIndex(timelines, extras);
const graph = buildRelationGraph(index, timelines);
const byId = new Map(timelines.map((t) => [t.id, t]));
const seeLinked = (a: string, b: string) => byId.get(a)?.see.includes(b) || byId.get(b)?.see.includes(a);

// 人物 → 戰爭、時代等沒有主人的時間軸：至少提到 1 次的全部列出，標示是否已連線
// 多位補充人物共用的時間軸（梅迪奇家族）不屬於任何一人，在關係圖上是方塊節點
const extraShare = new Map<string, number>();
for (const e of index.filter((e) => e.key.startsWith('extra:'))) for (const t of e.links) extraShare.set(t.id, (extraShare.get(t.id) ?? 0) + 1);
const ownedIds = new Set(index.flatMap((e) => (e.key.startsWith('extra:') && extraShare.get(e.links[0]?.id) !== 1 ? [] : e.links.map((t) => t.id))));
const topicRows: { person: string; topic: string; count: number; linked: boolean }[] = [];
for (const entry of index.filter((e) => !e.key.startsWith('extra:'))) {
  const own = new Set(entry.links.map((t) => t.id));
  const sources = timelines.filter((t) => own.has(t.id));
  for (const topic of timelines.filter((t) => !ownedIds.has(t.id))) {
    const terms = timelineTerms(topic);
    if (terms.length === 0) continue;
    const count = sources.reduce((n, s) => n + s.events.filter((e) => mentions(`${e.title}\n${e.text}`, terms, topic.notNames)).length, 0);
    // 人物的作品列表等自有時間軸寫了 see:，也算已連線
    const linked = [...own].some((id) => seeLinked(id, topic.id));
    if (count > 0) topicRows.push({ person: entry.key, topic: topic.id, count, linked });
  }
}

// 人物 ↔ 人物：內文互相提到，但沒有 see:
const personRows = graph.links
  .filter((l) => !l.topic && !l.see && l.weight > 0 && !l.source.startsWith('t:') && !l.target.startsWith('t:'))
  .map((l) => ({ a: l.source, b: l.target, count: l.weight }));

const keep = (...ids: string[]) => !only || ids.includes(only);
const show = (title: string, lines: string[]) => console.log(`\n== ${title}（${lines.length}）\n${lines.length > 0 ? lines.join('\n') : '（無）'}`);
const name = (id: string) => `${byId.get(id)?.title ?? id}`;

show(
  `人物提到某個戰爭／時代，已達門檻（≥${TOPIC_MIN_EVENTS} 則）、關係圖會自動連線，但沒有 see:`,
  topicRows
    .filter((r) => r.count >= TOPIC_MIN_EVENTS && !r.linked && keep(r.person, r.topic))
    .sort((x, y) => y.count - x.count)
    .map((r) => `  ${r.person} → ${r.topic}：${r.count} 則　${name(r.person)} → ${name(r.topic)}`),
);
const single = topicRows.filter((r) => r.count < TOPIC_MIN_EVENTS && !r.linked && keep(r.person, r.topic));
if (all || only) show('人物只提到 1 則（不連線，確認是不是漏掉了別名）', single.map((r) => `  ${r.person} → ${r.topic}：${r.count} 則　${name(r.person)} → ${name(r.topic)}`));
else console.log(`\n（另有 ${single.length} 組人物只提到 1 則、不連線；加 --all 查看，確認是不是漏掉了別名）`);
show(
  '兩位人物內文互相提到，但沒有 see:（關係圖已有實線，可考慮補 see:）',
  personRows
    .filter((r) => r.count >= 3 && keep(r.a, r.b))
    .sort((x, y) => y.count - x.count)
    .slice(0, only ? 30 : 15)
    .map((r) => `  ${r.a} ↔ ${r.b}：${r.count} 則`),
);
console.log('\n要補 see: 的話，在人物時間軸的 frontmatter 加一行 see: [時間軸 id]；兩邊都會顯示。');
