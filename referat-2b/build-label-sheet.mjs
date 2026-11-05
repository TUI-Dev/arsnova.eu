#!/usr/bin/env node
/**
 * Referat 2B – Blattvorlage für die Zweitannotation (Übereinstimmung der Referenzlabels).
 *
 * Alle Kategorie- und Anliegen-Labels des Referenzsets stammen von einer Person. Diese
 * Vorlage zieht mit festem Seed eine Stichprobe aus der deutschen Statistik-Sitzung und
 * erzeugt zwei Blätter ohne Lösungen:
 *
 *   kategorien.csv  80 Fragen  → Kategorie I (Inhalt) / O (Organisation) / T (Technik) /
 *                                X (nicht entscheidbar oder kein Anliegen)
 *   anliegen.csv    60 Paare   → gleiches Anliegen? J / N
 *                                (24 gleiche Familie, 18 verschiedene Familie gleicher Kategorie,
 *                                 18 verschiedene Familie beliebig; Reihenfolge gemischt)
 *
 * schluessel.json ordnet die neutralen IDs den Referenz-IDs zu; measure-agreement.mjs liest
 * die ausgefüllten Blätter und berechnet Cohens κ.
 *
 * Aufruf aus dem Repo-Root:
 *   node referat-2b/build-label-sheet.mjs [--ref referat-2b/reference-dataset.v2.2.json]
 *     [--out referat-2b/zweitannotation] [--seed 2026]
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 2)
  args.set(process.argv[i].replace(/^--/, ''), process.argv[i + 1]);
const refPath = resolve(args.get('ref') ?? 'referat-2b/reference-dataset.v2.2.json');
const out = resolve(args.get('out') ?? 'referat-2b/zweitannotation');
const SEED = Number(args.get('seed') ?? 2026);
const N_ITEMS = 80;
const N_SAME = 24;
const N_DIFF_CAT = 18;
const N_DIFF_ANY = 18;

const raw = readFileSync(refPath, 'utf8');
const ref = JSON.parse(raw);
const pool = ref.items.filter(
  (i) => (i.domain ?? 'statistics') === 'statistics' && i.locale === 'de',
);

function lcg(seed) {
  let a = seed;
  return () => {
    a = (a * 1103515245 + 12345) & 0x7fffffff;
    return a / 0x7fffffff;
  };
}
const rnd = lcg(SEED);
const shuffle = (xs) => {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Referenzantwort Kategorie: X für kein Anliegen (category null) oder als mehrdeutig markiert
export const goldCategory = (i) =>
  i.category === null || (i.tags ?? []).includes('ambiguous')
    ? 'X'
    : { content: 'I', organization: 'O', technical: 'T' }[i.category];

// Kategorien: geschichtet nach Referenzantwort, proportional
const strata = new Map();
for (const i of pool) strata.set(goldCategory(i), [...(strata.get(goldCategory(i)) ?? []), i]);
let picked = [];
for (const [, xs] of [...strata].sort()) {
  const n = Math.round((xs.length / pool.length) * N_ITEMS);
  picked.push(...shuffle(xs).slice(0, n));
}
picked = shuffle(picked).slice(0, N_ITEMS);

// Paare
const key = (a, b) => [a.id, b.id].sort().join('|');
const seen = new Set();
const pairs = [];
const tryAdd = (a, b, kind) => {
  if (a.id === b.id || seen.has(key(a, b))) return false;
  seen.add(key(a, b));
  pairs.push({ a, b, kind });
  return true;
};
const families = new Map();
for (const i of pool) families.set(i.family, [...(families.get(i.family) ?? []), i]);
const multi = shuffle([...families.values()].filter((xs) => xs.length >= 2));
for (
  let k = 0, guard = 0;
  pairs.filter((p) => p.kind === 'same').length < N_SAME && guard < 1e4;
  guard++
) {
  const fam = multi[k++ % multi.length];
  const [a, b] = shuffle(fam);
  tryAdd(a, b, 'same');
}
const randomItem = () => pool[Math.floor(rnd() * pool.length)];
for (
  let guard = 0;
  pairs.filter((p) => p.kind === 'diff-cat').length < N_DIFF_CAT && guard < 1e5;
  guard++
) {
  const a = randomItem();
  const b = randomItem();
  if (a.category && a.category === b.category && a.family !== b.family) tryAdd(a, b, 'diff-cat');
}
for (
  let guard = 0;
  pairs.filter((p) => p.kind === 'diff-any').length < N_DIFF_ANY && guard < 1e5;
  guard++
) {
  const a = randomItem();
  const b = randomItem();
  if (a.family !== b.family) tryAdd(a, b, 'diff-any');
}
const pairList = shuffle(pairs).map((p) => (rnd() < 0.5 ? p : { ...p, a: p.b, b: p.a }));

// CSV für Excel (de): UTF-8 mit BOM, Semikolon
const cell = (s) => `"${String(s).replace(/"/g, '""')}"`;
const csv = (rows) => '﻿' + rows.map((r) => r.map(cell).join(';')).join('\r\n') + '\r\n';

mkdirSync(out, { recursive: true });
writeFileSync(
  join(out, 'kategorien.csv'),
  csv([
    ['Nr', 'Frage', 'Kategorie (I/O/T/X)', 'Anmerkung (optional)'],
    ...picked.map((i, n) => [`K${String(n + 1).padStart(2, '0')}`, i.text, '', '']),
  ]),
);
writeFileSync(
  join(out, 'anliegen.csv'),
  csv([
    ['Nr', 'Frage A', 'Frage B', 'Gleiches Anliegen (J/N)', 'Anmerkung (optional)'],
    ...pairList.map((p, n) => [`P${String(n + 1).padStart(2, '0')}`, p.a.text, p.b.text, '', '']),
  ]),
);
writeFileSync(
  join(out, 'schluessel.json'),
  JSON.stringify(
    {
      reference: {
        version: ref.meta.version,
        sha256: createHash('sha256').update(raw).digest('hex'),
      },
      seed: SEED,
      items: picked.map((i, n) => ({ nr: `K${String(n + 1).padStart(2, '0')}`, id: i.id })),
      pairs: pairList.map((p, n) => ({
        nr: `P${String(n + 1).padStart(2, '0')}`,
        a: p.a.id,
        b: p.b.id,
        kind: p.kind,
      })),
    },
    null,
    2,
  ) + '\n',
);
const R = ref.meta.categoryRules;
writeFileSync(
  join(out, 'ANLEITUNG.md'),
  `# Zweitannotation Referat 2B – Anleitung

Bitte **ohne Rücksprache** und ohne Blick in das Referenzset ausfüllen (ca. 45–60 Minuten).
Die Fragen stammen aus einer synthetischen Statistik-Vorlesung (Q&A im Hörsaal).

## Blatt 1: \`kategorien.csv\` – eine Kategorie je Frage

Spalte »Kategorie« mit genau einem Buchstaben füllen:

- **I – Inhalt:** ${R.content}
- **O – Organisation:** ${R.organization}
- **T – Technik:** ${R.technical}
- **X – nicht entscheidbar oder kein Anliegen:** Die Kategorie ist aus dem Text allein nicht
  erkennbar (z. B. »Was heißt das?«), oder es ist kein Moderationsanliegen (Dank, Gruß, Lachen).

Grenzfälle:

${R.tieBreak
  .slice(0, 3)
  .map((t) => `- ${t}`)
  .join('\n')}

## Blatt 2: \`anliegen.csv\` – gleiches Anliegen?

Je Zeile zwei Fragen. **J**, wenn die Lehrperson beide mit **derselben einen Antwort oder Handlung**
erledigen würde; sonst **N**.

- Gleicher Satzanfang (»Kurze Nachfrage: …«) allein ist kein gleiches Anliegen.
- Gleiches Stichwort mit anderem Anliegen (z. B. »Beispiel auf Folie 3 falsch?« vs. »Noch ein
  Beispiel bitte«) ist **N**.

Anmerkungen sind freiwillig. Bitte die Dateien als CSV speichern und unverändert benannt
zurückgeben.
`,
);
console.log(
  `${picked.length} Fragen (${[...strata].map(([k, xs]) => `${k} ${picked.filter((i) => goldCategory(i) === k).length}`).join(', ')}), ` +
    `${pairList.length} Paare (${['same', 'diff-cat', 'diff-any'].map((k) => `${k} ${pairList.filter((p) => p.kind === k).length}`).join(', ')}) → ${out}`,
);
