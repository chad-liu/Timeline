import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { ASSET_PREFIX, parseTimeline } from './src/lib/parseTimeline';
import type { Timeline } from './src/types';

const VIRTUAL_ID = 'virtual:timelines';
const RESOLVED_ID = '\0' + VIRTUAL_ID;
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
  return fs
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
}

/** Non-markdown files under Data\ (images), as posix paths relative to Data\. */
function listAssets(dataDir: string): string[] {
  return fs
    .readdirSync(dataDir, { recursive: true, encoding: 'utf8' })
    .filter((rel) => !isMarkdown(rel) && fs.statSync(path.join(dataDir, rel)).isFile())
    .map((rel) => rel.split(path.sep).join('/'));
}

/**
 * Exposes Data\*.md as `virtual:timelines` (parsed at build time),
 * serves/emits Data\ images under `data/`, and reloads the page when Data\ changes in dev.
 */
export function timelinesPlugin(dataDir: string): Plugin {
  return {
    name: 'timelines',

    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },

    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      return `export default ${JSON.stringify(loadTimelines(dataDir))};`;
    },

    configureServer(server) {
      const onDataChange = (file: string) => {
        if (!path.resolve(file).startsWith(dataDir)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.add(dataDir);
      server.watcher.on('change', onDataChange);
      server.watcher.on('add', onDataChange);
      server.watcher.on('unlink', onDataChange);

      server.middlewares.use((req, res, next) => {
        const url = decodeURIComponent((req.url ?? '').split('?')[0]);
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
      for (const rel of listAssets(dataDir)) {
        this.emitFile({ type: 'asset', fileName: ASSET_PREFIX + rel, source: fs.readFileSync(path.join(dataDir, rel)) });
      }
    },
  };
}
