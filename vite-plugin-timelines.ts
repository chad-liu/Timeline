import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { ASSET_PREFIX, parseTimeline } from './src/lib/parseTimeline';
import { orderTimelines } from './src/lib/timelineOrder';
import { buildPeopleIndex } from './src/lib/peopleIndex';
import { parseExtraPeople } from './src/lib/extraPeople';
import type { ExtraPerson } from './src/lib/extraPeople';
import type { Timeline } from './src/types';

const VIRTUAL_ID = 'virtual:timelines';
const RESOLVED_ID = '\0' + VIRTUAL_ID;
/** Supplementary people for the name index: people mentioned often who have no timeline of their own. */
const EXTRA_ID = 'virtual:index-people';
const RESOLVED_EXTRA_ID = '\0' + EXTRA_ID;
const EXTRA_FILE = path.join('index', 'people.md');
/** Public index of the people timelines, for other sites to link to (see buildPeopleIndex). */
const PEOPLE_FILE = 'people.json';
const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

function isMarkdown(file: string): boolean {
  return file.toLowerCase().endsWith('.md');
}

function loadTimelines(dataDir: string): Timeline[] {
  const timelines = fs
    .readdirSync(dataDir)
    .filter(isMarkdown)
    .sort()
    .map((file) => {
      const source = fs.readFileSync(path.join(dataDir, file), 'utf8');
      try {
        return parseTimeline(source, path.basename(file, path.extname(file)));
      } catch (err) {
        throw new Error(`Data\\${file} ${(err as Error).message}`);
      }
    })
    .filter((t) => t.events.length > 0 || t.periods.length > 0);
  return orderTimelines(timelines);
}

/** The name index's supplementary people (Data\index\people.md), or none when the file is missing. */
function loadExtraPeople(dataDir: string): ExtraPerson[] {
  const file = path.join(dataDir, EXTRA_FILE);
  if (!fs.existsSync(file)) return [];
  try {
    return parseExtraPeople(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    throw new Error(`Data\\${EXTRA_FILE} ${(err as Error).message}`);
  }
}

/** Non-markdown files under Data\ (images), as posix paths relative to Data\. */
function listAssets(dataDir: string): string[] {
  return fs
    .readdirSync(dataDir, { recursive: true, encoding: 'utf8' })
    .filter((rel) => !isMarkdown(rel) && fs.statSync(path.join(dataDir, rel)).isFile())
    .map((rel) => rel.split(path.sep).join('/'));
}

/**
 * Exposes Data\*.md as `virtual:timelines` (parsed at build time) and Data\index\people.md as `virtual:index-people`,
 * serves/emits Data\ images under `data/` plus `people.json`, and reloads the page when Data\ changes in dev.
 * `siteUrl` is the published address, used for the absolute links in `people.json`.
 */
export function timelinesPlugin(dataDir: string, siteUrl: string): Plugin {
  const peopleJson = () => JSON.stringify(buildPeopleIndex(loadTimelines(dataDir), siteUrl), null, 2);
  return {
    name: 'timelines',

    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
      if (id === EXTRA_ID) return RESOLVED_EXTRA_ID;
      return undefined;
    },

    load(id) {
      if (id === RESOLVED_ID) return `export default ${JSON.stringify(loadTimelines(dataDir))};`;
      if (id === RESOLVED_EXTRA_ID) return `export default ${JSON.stringify(loadExtraPeople(dataDir))};`;
      return undefined;
    },

    configureServer(server) {
      const onDataChange = (file: string) => {
        if (!path.resolve(file).startsWith(dataDir)) return;
        for (const id of [RESOLVED_ID, RESOLVED_EXTRA_ID]) {
          const mod = server.moduleGraph.getModuleById(id);
          if (mod) server.moduleGraph.invalidateModule(mod);
        }
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.add(dataDir);
      server.watcher.on('change', onDataChange);
      server.watcher.on('add', onDataChange);
      server.watcher.on('unlink', onDataChange);

      server.middlewares.use((req, res, next) => {
        const url = decodeURIComponent((req.url ?? '').split('?')[0]);
        if (url === '/' + PEOPLE_FILE) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(peopleJson());
          return;
        }
        if (!url.startsWith('/' + ASSET_PREFIX)) return next();
        const file = path.resolve(dataDir, url.slice(ASSET_PREFIX.length + 1));
        // Only serve files inside Data\, and never the markdown sources.
        if (!file.startsWith(dataDir + path.sep) || isMarkdown(file) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
          return next();
        }
        const type = MIME[path.extname(file).toLowerCase()];
        if (type) res.setHeader('Content-Type', type);
        fs.createReadStream(file).pipe(res);
      });
    },

    generateBundle() {
      this.emitFile({ type: 'asset', fileName: PEOPLE_FILE, source: peopleJson() });
      for (const rel of listAssets(dataDir)) {
        this.emitFile({ type: 'asset', fileName: ASSET_PREFIX + rel, source: fs.readFileSync(path.join(dataDir, rel)) });
      }
    },
  };
}
