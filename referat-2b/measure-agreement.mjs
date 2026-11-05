#!/usr/bin/env node
/**
 * Referat 2B – Übereinstimmung der Zweitannotation mit den Referenzlabels (Cohens κ).
 *
 * Liest die ausgefüllten Blätter aus build-label-sheet.mjs (kategorien.csv, anliegen.csv;
 * Semikolon oder Komma, mit oder ohne BOM) und vergleicht sie mit dem Referenzset:
 *   Kategorie   I/O/T/X  → κ, Übereinstimmung, Konfusionsmatrix (κ zusätzlich ohne X)
 *   Anliegen    J/N      → κ, Übereinstimmung, je Paartyp
 * Abweichungen werden mit Text aufgelistet. --selftest antwortet mit den Referenzlabels (κ = 1).
 *
 * Aufruf aus dem Repo-Root:
 *   node referat-2b/measure-agreement.mjs [--dir referat-2b/zweitannotation]
 *     [--ref referat-2b/reference-dataset.v2.2.json] [--out referat-2b/results] [--rater Name]
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const k = process.argv[i].replace(/^--/, '');
  const v = process.argv[i + 1];
  if (v === undefined || v.startsWith('--')) args.set(k, 'true');
  else (args.set(k, v), i++);
}
const dir = resolve(args.get('dir') ?? 'referat-2b/zweitannotation');
const refPath = resolve(args.get('ref') ?? 'referat-2b/reference-dataset.v2.2.json');
const outRoot = resolve(args.get('out') ?? 'referat-2b/results');
const SELFTEST = args.get('selftest') === 'true';
const rater = args.get('rater') ?? (SELFTEST ? 'Selbsttest' : 'Zweitannotation');

const raw = readFileSync(refPath, 'utf8');
const ref = JSON.parse(raw);
const byId = new Map(ref.items.map((i) => [i.id, i]));
const key = JSON.parse(readFileSync(join(dir, 'schluessel.json'), 'utf8'));
const sha = createHash('sha256').update(raw).digest('hex');
if (key.reference.sha256 !== sha) throw new Error('Referenzset passt nicht zum Schlüssel');

const goldCategory = (i) =>
  i.category === null || (i.tags ?? []).includes('ambiguous')
    ? 'X'
    : { content: 'I', organization: 'O', technical: 'T' }[i.category];

function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const delim = (text.split(/\r?\n/)[0].match(/;/g) ?? []).length ? ';' : ',';
  const rows = [];
  let row = [];
  let f = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') ((f += '"'), i++);
      else if (c === '"') q = false;
      else f += c;
    } else if (c === '"') q = true;
    else if (c === delim) (row.push(f), (f = ''));
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      (row.push(f), rows.push(row), (row = []), (f = ''));
    } else f += c;
  }
  if (f || row.length) (row.push(f), rows.push(row));
  return rows.filter((r) => r.some((x) => x.trim()));
}
const readSheet = (name) => {
  const rows = parseCsv(readFileSync(join(dir, name), 'utf8'));
  return new Map(rows.slice(1).map((r) => [r[0].trim(), r]));
};

function kappa(pairs, labels) {
  const n = pairs.length;
  const po = pairs.filter(([a, b]) => a === b).length / n;
  let pe = 0;
  for (const l of labels)
    pe +=
      (pairs.filter(([a]) => a === l).length / n) * (pairs.filter(([, b]) => b === l).length / n);
  return { n, agreement: po, kappa: pe === 1 ? 1 : (po - pe) / (1 - pe) };
}
const landis = (k) =>
  k < 0.2
    ? 'gering'
    : k < 0.4
      ? 'ausreichend'
      : k < 0.6
        ? 'mittel'
        : k < 0.8
          ? 'substanziell'
          : 'fast vollständig';

// Kategorien
const CATS = ['I', 'O', 'T', 'X'];
const catSheet = SELFTEST ? null : readSheet('kategorien.csv');
const catRows = key.items.map(({ nr, id }) => {
  const g = goldCategory(byId.get(id));
  const r = SELFTEST ? g : (catSheet.get(nr)?.[2] ?? '').trim().toUpperCase().slice(0, 1);
  return { nr, id, text: byId.get(id).text, gold: g, rater: r, note: catSheet?.get(nr)?.[3] ?? '' };
});
const catMissing = catRows.filter((r) => !CATS.includes(r.rater));
const catValid = catRows.filter((r) => CATS.includes(r.rater));
const cat = kappa(
  catValid.map((r) => [r.gold, r.rater]),
  CATS,
);
const catNoX = kappa(
  catValid.filter((r) => r.gold !== 'X' && r.rater !== 'X').map((r) => [r.gold, r.rater]),
  ['I', 'O', 'T'],
);
const confusion = Object.fromEntries(
  CATS.map((g) => [
    g,
    Object.fromEntries(
      CATS.map((x) => [x, catValid.filter((r) => r.gold === g && r.rater === x).length]),
    ),
  ]),
);

// Anliegen
const pairSheet = SELFTEST ? null : readSheet('anliegen.csv');
const pairRows = key.pairs.map(({ nr, a, b, kind }) => {
  const g = byId.get(a).family === byId.get(b).family ? 'J' : 'N';
  const r = SELFTEST ? g : (pairSheet.get(nr)?.[3] ?? '').trim().toUpperCase().slice(0, 1);
  return {
    nr,
    kind,
    a: byId.get(a).text,
    b: byId.get(b).text,
    gold: g,
    rater: r,
    note: pairSheet?.get(nr)?.[4] ?? '',
  };
});
const pairMissing = pairRows.filter((r) => !['J', 'N'].includes(r.rater));
const pairValid = pairRows.filter((r) => ['J', 'N'].includes(r.rater));
const pair = kappa(
  pairValid.map((r) => [r.gold, r.rater]),
  ['J', 'N'],
);
const byKind = Object.fromEntries(
  ['same', 'diff-cat', 'diff-any'].map((k) => {
    const xs = pairValid.filter((r) => r.kind === k);
    return [
      k,
      {
        n: xs.length,
        agreement: xs.length ? xs.filter((r) => r.gold === r.rater).length / xs.length : null,
      },
    ];
  }),
);

const ts = new Date().toISOString();
const outDir = join(outRoot, `agreement-${ts.replace(/[:.]/g, '-')}`);
mkdirSync(outDir, { recursive: true });
const result = {
  manifest: {
    timestamp: ts,
    rater,
    selftest: SELFTEST,
    reference: { version: ref.meta.version, sha256: sha },
    seed: key.seed,
  },
  category: {
    ...cat,
    interpretation: landis(cat.kappa),
    withoutX: catNoX,
    confusion,
    missing: catMissing.map((r) => r.nr),
  },
  concern: {
    ...pair,
    interpretation: landis(pair.kappa),
    byKind,
    missing: pairMissing.map((r) => r.nr),
  },
  disagreements: {
    category: catValid.filter((r) => r.gold !== r.rater),
    concern: pairValid.filter((r) => r.gold !== r.rater),
  },
};
writeFileSync(join(outDir, 'results.json'), JSON.stringify(result, null, 2) + '\n');
const pct = (x) => (x === null ? '–' : `${(x * 100).toFixed(1).replace('.', ',')} %`);
const k2 = (x) => x.toFixed(2).replace('.', ',');
const KN = {
  same: 'gleiche Familie',
  'diff-cat': 'andere Familie, gleiche Kategorie',
  'diff-any': 'andere Familie, beliebig',
};
const L = [
  '# Referat 2B – Zweitannotation: Übereinstimmung mit den Referenzlabels',
  '',
  `Referenzset ${ref.meta.version} (SHA-256 \`${sha.slice(0, 16)}…\`), Seed ${key.seed}, Annotation: ${rater}, ${ts}${SELFTEST ? ' – **Selbsttest, keine echte Zweitannotation**' : ''}`,
  '',
  '| Aufgabe | n | Übereinstimmung | Cohens κ | Einordnung (Landis & Koch) |',
  '|---|---:|---:|---:|---|',
  `| Kategorie I/O/T/X | ${cat.n} | ${pct(cat.agreement)} | ${k2(cat.kappa)} | ${landis(cat.kappa)} |`,
  `| Kategorie ohne X (beide entschieden) | ${catNoX.n} | ${pct(catNoX.agreement)} | ${k2(catNoX.kappa)} | ${landis(catNoX.kappa)} |`,
  `| Gleiches Anliegen J/N | ${pair.n} | ${pct(pair.agreement)} | ${k2(pair.kappa)} | ${landis(pair.kappa)} |`,
  '',
  `Fehlend/ungültig: Kategorie ${catMissing.length}, Paare ${pairMissing.length}.`,
  '',
  '## Konfusionsmatrix Kategorie (Zeile Referenz, Spalte Zweitannotation)',
  '',
  '| Referenz \\ Zweit | I | O | T | X |',
  '|---|---:|---:|---:|---:|',
  ...CATS.map((g) => `| ${g} | ${CATS.map((x) => confusion[g][x]).join(' | ')} |`),
  '',
  '## Paare nach Typ',
  '',
  '| Paartyp | n | Übereinstimmung |',
  '|---|---:|---:|',
  ...Object.entries(byKind).map(([k, v]) => `| ${KN[k]} | ${v.n} | ${pct(v.agreement)} |`),
  '',
  '## Abweichungen',
  '',
  ...result.disagreements.category.map(
    (r) =>
      `- ${r.nr} Referenz ${r.gold}, Zweit ${r.rater}: »${r.text}«${r.note ? ` – ${r.note}` : ''}`,
  ),
  ...result.disagreements.concern.map(
    (r) =>
      `- ${r.nr} (${KN[r.kind]}) Referenz ${r.gold}, Zweit ${r.rater}: »${r.a}« / »${r.b}«${r.note ? ` – ${r.note}` : ''}`,
  ),
  '',
];
writeFileSync(join(outDir, 'report.md'), L.join('\n') + '\n');
console.log(L.slice(4, 10).join('\n'));
console.log(`\nErgebnisse: ${outDir}`);
