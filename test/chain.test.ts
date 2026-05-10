import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';

const ROOT = join(__dirname, '..');
const STACKS = ['_base', 'typescript', 'javascript', 'python', 'ruby', 'go', 'rust', 'c'];

function findMd(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...findMd(full));
    else if (entry.endsWith('.md')) out.push(full);
  }
  return out;
}

function loadAll(): Map<string, { id: string; extends: string[]; body: string; path: string }> {
  const all = new Map<string, { id: string; extends: string[]; body: string; path: string }>();
  for (const stack of STACKS) {
    const dir = join(ROOT, stack);
    let files: string[] = [];
    try { files = findMd(dir); } catch { continue; }
    for (const file of files) {
      const raw = readFileSync(file, 'utf8');
      const parsed = matter(raw);
      const rel = relative(ROOT, file).replace(/\.md$/, '');
      const id = (parsed.data.id ?? rel) as string;
      const ext = (parsed.data.extends ?? []) as string[];
      all.set(rel, { id, extends: ext, body: parsed.content, path: rel });
    }
  }
  return all;
}

describe('prompt library', () => {
  const all = loadAll();

  it('found at least the seven stack base files', () => {
    const bases = [...all.keys()].filter((k) => k.endsWith('/base'));
    expect(bases.length).toBeGreaterThanOrEqual(7);
  });

  describe('frontmatter', () => {
    for (const [path, file] of all) {
      it(`${path} has id and extends`, () => {
        expect(file.id, `${path} missing id`).toBeTruthy();
        expect(Array.isArray(file.extends), `${path} extends must be array`).toBe(true);
      });
    }
  });

  describe('extends chain resolves', () => {
    for (const [path, file] of all) {
      it(`${path} chain resolves`, () => {
        const seen = new Set<string>();
        const stack = [...file.extends];
        while (stack.length) {
          const ref = stack.pop()!;
          if (seen.has(ref)) {
            throw new Error(`circular extends touching ${ref} from ${path}`);
          }
          seen.add(ref);
          const parent = all.get(ref);
          expect(parent, `${path} extends unknown ref ${ref}`).toBeDefined();
          stack.push(...parent!.extends);
        }
      });
    }
  });

  describe('actionable content', () => {
    for (const [path, file] of all) {
      // _base/universal is the role definition; it doesn't need "flag" markers
      if (path === '_base/universal') continue;
      it(`${path} has actionable language (flag/block)`, () => {
        const body = file.body.toLowerCase();
        const hits = (body.match(/\bflag\b|\bblock-severity\b/g) ?? []).length;
        expect(hits, `${path} needs at least 5 actionable rules`).toBeGreaterThanOrEqual(5);
      });
    }
  });
});
