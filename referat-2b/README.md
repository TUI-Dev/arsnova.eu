# Referat Thema 2B – Nichtgenerative Kategorien und semantische Themen

**Kurs:** Cloud Computing (DSCC0127), IU Internationale Hochschule
**Thema 2:** Wie viel KI braucht der Moderationskompass? Informationsqualität
und begrenzter Kontext
**Auftrag 2B:** Welchen nachweisbaren Qualitätsgewinn liefern Klassifikation
(Story 8.9b) und Encoder-Themen (Story 1.14c) in Release 1.3 gegenüber dessen
lexikalischer beziehungsweise regelbasierter Baseline? Schwerpunkt:
Clustering – Encoder-Themen gegen die lexikalische Baseline ohne und mit
spaCy-Glättung (Story 1.14b); Klassifikation als Schnittstelle.
**Gruppe Thema 2:** Tino Heinisch (2A), Thilo Krebs (2B), Lena Peter (2C)
**Autor:** Thilo Krebs

**Gültigkeit:** Release 1.3 (Klassifikation, Seed, Queue, Encoder-Client,
Clustering, Schwellen und die Kompass-Funktionen sind identisch zwischen Tag
`v1.3.0`, dem gemessenen Stand `a657798e` und dem aktuellen Fork-Stand
`84a5614e` mit Upstream `9f230abc`), Issue #456, ADR-0035. Referenzset v2.2, eingefroren am
04.11.2026, SHA-256
`717bdb17dc2e94d56275e2ea5b17d74c2fd602b56ea3a90abcae767d8faa0d87`.

Dieser Ordner enthält nur Messwerkzeuge, Daten und Befunde. Der Produktcode wurde
nicht verändert.

---

## Frage und Antwort (TL;DR)

**Leitfrage Thema 2** (`docs/didaktik/CLOUD-COMPUTING-REFERAT-PRUEFUNG.md`,
§4.4): »Welche zusätzlichen Informationen liefern die optionalen NLP- und
generativen Funktionen von Release 1.3 gegenüber dessen regelbasiertem Kompass,
und wie viel davon kann eine begrenzte private Runtime zuverlässig verarbeiten?«

**Leitfrage 2B** (ebd.): »Welchen nachweisbaren Qualitätsgewinn liefern
Klassifikation und Encoder-Themen in Release 1.3 gegenüber dessen lexikalischer
beziehungsweise regelbasierter Baseline?«

**Gemeinsame Nutzungsfrage** (ebd.): »Kann die Lehrperson Übungswünsche,
Prüfungsorganisation und geteilte Bewertungen unterscheiden und die Belege
prüfen?« – beantwortet im Kompass, gemessen mit dem gemeinsamen
Sechs-Fragen-Szenario und der 2A-Rubrik (siehe unten).

**Schwerpunkt (Auftrag 2B, Punkt 1):** **Clustering.** Gemessen wird, ob
Encoder-Themen (1.14c) Fragen besser zu Anliegen bündeln als die lexikalische
Wortwolke – und zwar gegen beide Ausbaustufen der Baseline: ohne und mit
spaCy-Lemmatisierung (1.14b). Die **Klassifikation (8.9b)** ist als Schnittstelle
eingeordnet und mit derselben Messkette erfasst, weil sie im Kompass die
Statuszeile speist und die sichtbaren Quellen belegt.

**Antwort in vier Sätzen:**

1. **Encoder-Themen (1.14c)** gruppieren in Deutsch und Englisch stabil besser
   (ARI 0,29 → 0,44 bzw. 0,53) und liefern schlüssigere Themen-Quellen im Kompass;
   bei Ausfall oder Last greift der lexikalische Fallback – deshalb für de/en
   aktivierbar (E2).
2. **spaCy (1.14b)** glättet Wortformen (»Beispiele« → »Beispiel«), bündelt aber
   keine Anliegen: Im Kompass bleibt die Statistik bei 0 von 3 schlüssigen
   Quellen; der Gewinn kommt nur vom Encoder (E4).
3. **Kategorien (8.9b)** sind messbar besser als Keyword-Regeln (61,3 % statt
   35,2 % nutzbar korrekt), aber im Kompass ist jede vierte bis jede zweite Frage
   hinter einer Kategorie-Quelle falsch eingeordnet, die Statuszeile meldet
   trotzdem »sortiert«, und die Kategorien verdrängen die Themen – deshalb
   bleiben sie aus (E1).
4. Die **Entscheidungstiefe** steigt nicht: »Als Nächstes« bleibt gleich; unter
   Last zeigt der Kompass »nicht verfügbar« statt falscher Sicherheit, und das
   Label nach `qa.submit` ist kein LLM-Auftrag (ADR-0035).

## Kurzantwort – aus Sicht des Moderationskompasses

Was sieht die Lehrperson im Kompass zusätzlich, wenn 8.9b und 1.14c an sind?
Gemessen mit den Release-Funktionen des Kompasses (`measure-compass.mts`,
Bericht `results/compass-2026-11-04T17-14-44-975Z/`):

| Im Kompass                                                     | Ohne 2B                                  | Mit Kategorien (8.9b)                                                                                                                                                 | Mit Encoder-Themen (1.14c)                                                             |
| -------------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Statuszeile                                                    | »Die automatische Sortierung … ist aus.« | »Die Fragen sind grob nach Inhalt, Ablauf und Technik sortiert.« – in jedem Fach                                                                                      | unverändert                                                                            |
| Karte »Häufige Themen«: Fragen hinter den 3 sichtbaren Quellen | 17 % (Statistik), 17 % (Polizeischule)   | 81 % bzw. 91 %                                                                                                                                                        | 9 % bzw. 11 % – enger                                                                  |
| davon richtig eingeordnet                                      | –                                        | 75,5 % (Statistik), 51,2 % (Polizeischule) – **ohne Warnung**                                                                                                         | –                                                                                      |
| sichtbare Themen-Quellen, die ein Anliegen bündeln             | Statistik 0 von 3                        | keine sichtbar: Kategorien belegen alle drei Plätze                                                                                                                   | Statistik 2 von 3                                                                      |
| Sprachen (Statistik)                                           | –                                        | korrekt de 75,5 % · en 66,0 % · fr 53,8 % · es 47,6 %                                                                                                                 | nur de/en; fr/es zeigen lexikalische Terme                                             |
| unter Last                                                     | –                                        | 50–200 Fragen/s: hält mit; 1000/s: in 1 von 5 Läufen Queue-Überlauf → »nicht verfügbar«; 500 gleichzeitig: 400 `failed` → »nicht verfügbar«, auch in Nachbarsitzungen | mehrere Sitzungen gleichzeitig: nur die erste bekommt Themen, die anderen den Fallback |

**Entscheidungen:** E1 Kategorien bleiben aus – sie füllen den Kompass, aber
mit bis zu jeder zweiten Frage falsch und einer Statuszeile, die »sortiert«
meldet. E2 Encoder-Themen für de/en aktivierbar – im Kompass nur sichtbar,
solange E1 gilt. E3 der #456-Kontext übernimmt nur Gespeichertes. E4 spaCy bleibt
optional – es glättet Wortformen, bündelt aber keine Anliegen.

### Gemeinsames Szenario im Kompass (Kontexttest, 2A-Rubrik)

Die sechs Fragen aus #456 §12 (A/B Übungswunsch, C/D Prüfungsorganisation, E/F
Kontroverse Anwesenheit) laufen durch 8.9b, Wortwolke und die Kompass-Funktionen
des Release (`check-group-scenario.mts`, Bericht
`results/group-scenario-2026-11-04T17-11-43-084Z/`). Kein Gütenachweis – die
Paare dienen laut Kursrahmen nur als Kontexttest. Bewertet mit der Rubrik aus 2A
(je 0–2; Regeln mechanisch im Skript):

| Kompass-Variante    | sichtbare Quellen der Karte »Häufige Themen«                    | fehlt | D1 Quellen | D3 Trennung | D4 Lücken | D5 Umfang | Summe (max. 8) |
| ------------------- | --------------------------------------------------------------- | ----- | ---------: | ----------: | --------: | --------: | -------------: |
| V0 ohne 2B          | »lineare Regression« → A, B                                     | C–F   |          2 |           2 |         0 |         0 |              4 |
| V1 + Kategorien     | »Inhaltliche Fragen · 2« → A, B; »Fragen zum Ablauf · 2« → D, E | C, F  |          2 |           1 |         0 |         2 |              5 |
| V2 + Encoder-Themen | Thema A+B; Thema E+F                                            | C, D  |          2 |           2 |         0 |         1 |              5 |
| V3 + beides         | wie V1, dazu Thema A+B                                          | C, F  |          2 |           1 |         0 |         2 |              5 |

D2 (Bedeutung der Bewertungen) ist nicht bewertet: Kategorien und Themen
ignorieren Stimmen. Befund: Kategorien zeigen mehr Anliegen, mischen aber
Prüfung (D) und Anwesenheit (E) unter »Ablauf« und melden trotz zweier
`uncertain`-Fragen »sortiert«. Encoder-Themen trennen sauber, verlieren aber C/D
knapp unter der Schwelle (Kosinus 0,864 < 0,87). Die Prüfungsorganisation wird in
keiner Variante als eigenes Anliegen sichtbar; die Lücke kennzeichnet keine
Variante.

### Warum der Kompass so aussieht: die Funktionen einzeln

| Funktion                   | Gewinn gegenüber Baseline                                                                                                                         | Gemessene Grenze                                                                                                                                                                                                                    | Entscheidung                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Kategorien (8.9b)**      | nutzbar korrekt 61,3 % statt 35,2 % (Keyword-Regeln), McNemar p < 0,001; in Botanik, Geschichte und Polizeischule ebenfalls deutlich höher        | Präzision 66,8 % < Releasekriterium 80 %; keine Schwelle 0,35–0,90 erfüllt es; 30–46 % der angezeigten Labels sind sicher falsch (Polizeischule 45,9 %); ECE 0,24                                                                   | **E1:** `QA_NLP_ENABLED=false` beibehalten; Aktivierungsbedingung und Rückweg dokumentiert           |
| **Encoder-Themen (1.14c)** | ARI de 0,44 statt 0,29, en 0,53 statt 0,29 (Median aus 10 Läufen, schlechtester Lauf ebenfalls besser); falsch zusammengeführte Paare de 211 → 81 | kein Gewinn für fr; Polizeischule de: ARI 0,36 statt 0,41, aber 37 → 13 Fehlzusammenführungen; gemischtsprachige Sitzungen schwach; nur 12 Themen sichtbar; Encoder-Ausfall → lexikalischer Fallback (sofort bzw. nach 8 s Timeout) | **E2:** für de/en-Sitzungen aktivierbar, Schwelle 0,87 beibehalten; lexikalischer Modus als Fallback |
| **#456-Kontext**           | liest gespeicherte Kategorien und Themen-Snapshots                                                                                                | Themen nur, wenn der Host den Themenmodus vorher geöffnet hat                                                                                                                                                                       | **E3:** nur gespeicherte Ergebnisse übernehmen, keine neue Inferenz                                  |

Beitrag zur Gruppensynthese: **Regelkern (2A) immer · Encoder-Themen zusätzlich
in de/en-Sitzungen · spaCy optional · Kategorien vorerst aus.** Ausführlich:
[`hypothese-und-entscheidung.md`](hypothese-und-entscheidung.md).

## Kategorie, Thema und Kompasskarte – Befund aus Code und Messung

Nach `qa.submit` erscheint bei `QA_NLP_ENABLED=true` automatisch ein Label wie
`organization`. Dieses Label ist **kein LLM-Auftrag**:

| Behauptung                                       | Releaseanker (1.3 `a657798e` → `main` `84a5614e`)                                                        | Eigene Messung (`check-runtime-paths.mts`)                                                          |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Submit speichert zuerst, plant dann nur          | `apps/backend/src/routers/qa.ts:1857 → :1995` (`submit`), `:1905 → :2043` (`enqueueQaNlpJob`)            | A1: enqueue p50 < 1 ms, Ergebnis erst danach                                                        |
| Submit wartet nicht auf die Analyse              | `apps/backend/src/lib/qaNlpQueue.ts:271` »Wartet nicht auf Inferenz«, Start per `setImmediate` (`:149`)  | A1                                                                                                  |
| Klassifikation im App-Prozess, ohne Netz und LLM | `qaNlpWorker.ts:14` → `qaNlpCascade.ts:89` (Naive Bayes + k-NN, trainiert beim Start aus `qaNlpSeed.ts`) | A1: 0 HTTP-, Fetch- oder Socket-Aufrufe                                                             |
| belegt keinen llama-Slot                         | `docs/architecture/decisions/0035-self-hosted-llm-runtime-llama-cpp-over-ollama.md:143`                  | –                                                                                                   |
| eigener Kill-Switch                              | `QA_NLP_ENABLED` (nur exakt `true`), `.env.production.example:227`                                       | A2: aus → alle Fragen `disabled`                                                                    |
| Betriebsgrenzen                                  | `qaNlpConfig.ts:9` ff.: Timeout 2000 ms, Queue 100, Concurrency 1, Schwelle 0,55                         | A3: Queue-Überlauf → `failed:queue-limit`; A4: Timeout greift; A5: bei CPU-Blockade greift er nicht |

Labels sind `content | organization | technical`
(`libs/shared-types/src/schemas.ts:164`), Status
`pending | classified | uncertain | disabled | failed` (`:160`). Unter 0,55
bleibt eine Frage `uncertain` und gespeichert.

|           | Kategorie (8.9b)                  | Thema (1.14c)                                                                   | Kompasskarte (8.9a)             |
| --------- | --------------------------------- | ------------------------------------------------------------------------------- | ------------------------------- |
| Auslöser  | jede Einreichung, automatisch     | Host-Aktion `wordCloud.analyzeQa` (`hostProcedure`, `routers/wordCloud.ts:306`) | Host öffnet den Kompass         |
| Bezug     | eine Frage                        | Gruppe sinngleicher Fragen einer Sitzung                                        | Lage der Sitzung                |
| Werte     | 3 feste Labels + Status           | offen, aus den Fragen gebildet                                                  | regelbasierte Karte mit Quellen |
| Verfahren | Naive Bayes + k-NN im App-Prozess | e5-Sidecar + Kosinus-Clustering (0,87)                                          | deterministische Regeln         |
| LLM-Slot  | nie                               | nur der optionale Themenname (`labelOrigin: 'model'`)                           | nie                             |
| Ausfall   | `failed`, Frage bleibt sichtbar   | lexikalischer Fallback (`status: failed`, `fallbackUsed`)                       | läuft weiter                    |

Messung C (`check-runtime-paths.mts`): In derselben Sitzung enthält die Hälfte der
Encoder-Themen Fragen mit unterschiedlicher Kategorie. Label und Thema sind
unabhängige Signale.

### Lexikalische Baseline mit spaCy-Glättung (1.14b)

spaCy ist die optionale Stufe der **lexikalischen** Baseline, nicht Teil der
Encoder-Themen: Es lemmatisiert nur im Modus »Wörter« (`LEXICAL` + `LEMMA`,
`apps/backend/src/lib/wordCloudNormalizer.ts:152`); »Wörter & Phrasen« und
»Thema« bleiben ohne Sidecar. Ist der Sidecar an (`NLP_ENABLED=true`), fordert der
Host die Glättung beim Öffnen der Q&A-Wortwolke automatisch an
(`qaWordCloudLemmaPreferred`, `session-host.component.ts:1172`), und der Kompass
nimmt **Lemma-Terme vor allen Themen** (`moderationCompassQaTerms`, `:3235`).
Encoder-Themen erreichen den Kompass nur im Modus »Thema« ohne Fallback.

Gemessen mit dem Release-Image `docker/spacy` (spaCy 3.8.15) über den Host-Pfad
`analyzeWordCloudSnapshot` (`measure-spacy.mts`, Bericht `results/spacy-2026-11-04T18-19-26-231Z/`):

| Statistik, deutsche Sitzung                         | »Wörter« ohne spaCy | »Wörter« mit spaCy | »Thema« (Encoder) |
| --------------------------------------------------- | ------------------: | -----------------: | ----------------: |
| schlüssige Themen-Quellen im Kompass                |               0 / 3 |              0 / 3 |             2 / 3 |
| Top-12 der Wortwolke: Fragenpaare gleiches Anliegen |              23,9 % |             20,7 % |            66,4 % |
| Polizeischule: schlüssige Quellen                   |               2 / 3 |              1 / 3 |             2 / 3 |
| Polizeischule: Paare gleiches Anliegen              |              40,0 % |             46,9 % |            71,0 % |

spaCy greift in de, en, fr und es (Encoder nur de/en) und braucht rund 0,7–1,2 ms
je Frage (200 Fragen: 130–200 ms); Image 751 MB, rund 460 MiB Arbeitsspeicher.
Im Sechs-Fragen-Szenario fasst spaCy »Beispiele« und »Beispiel« zusammen
(A+B über »Beispiel«); Prüfung (C/D) und Anwesenheit (E/F) bleiben unsichtbar.
**E4:** spaCy bleibt eine optionale Lesbarkeitsstufe der Baseline; für die
Bündelung von Anliegen im Kompass ist sie kein Ersatz für den Encoder und keine
Voraussetzung für E2.

### Wie der Moderationskompass 2B verwendet

Der Kompass ruft weder Klassifikator noch Encoder noch LLM auf; er liest
gespeicherte Ergebnisse.

1. **Statuszeile:** `resolveModerationCompassAnalysisMode`
   (`libs/shared-types/src/moderation-compass-rules.ts:1010 → :1080`):
   `pending` > `failed` > `classified` > `uncertain`. Eine einzige klassifizierte
   Frage genügt für »Die Fragen sind grob nach Inhalt, Ablauf und Technik
   sortiert.«
2. **Kategorie-Quellen:** `collectQaNlpCategorySources`
   (`apps/frontend/src/app/features/session/session-host/moderation-compass.ts:702 → :850`)
   übernimmt nur `classified`-Fragen. `uncertain` fehlt, sicher-falsche Labels
   erscheinen ohne Hinweis (gemessen A6).
3. **Reihenfolge der Themen-Karte:** `selectModerationCompassTopicSourceIds`
   (`moderation-compass-rules.ts:579 → :642`): Kategorie-Quellen zuerst, dann
   Q&A- und Freitext-Terme.
4. **Encoder-Themen:** `moderationCompassQaTerms` (`session-host.component.ts:2989 → :3235`)
   nimmt Themen nur, wenn der Host »Thema« gewählt hat und kein Fallback vorliegt.
5. **#456-Kontext:** `projectStoredQaNlp` und `collectQaTopicContext`
   (`apps/backend/src/lib/moderationQaContext.ts:250`, `:625`) übernehmen
   gespeicherte Kategorien und Themen-Snapshots für die Kurzfassung (2C). Details:
   [`kontextpfad-456.md`](kontextpfad-456.md).

## Baseline, Gegenvariante, Messung, Grenze, Entscheidung

| Untersuchung | Unveränderte 1.3-Baseline               | Kontrollierte Gegenvariante                                                                     | Ergebnis                               |
| ------------ | --------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------- |
| Kategorien   | Kaskade bei 0,55, Release-Seed          | Keyword-Baseline; Schwellen 0,35–0,90; Transliteration; fachfremde Fächer                       | `results/classification-*-2026-11-04*` |
| Themen       | Encoder bei 0,87, max. 12 Themen        | lexikalischer Modus `THEME`; Schwellen 0,80–0,92; 10 Batch-Zusammensetzungen; fachfremde Fächer | `results/topics-*-2026-11-04*`         |
| Submit-Pfad  | Release-Queue mit Default-Konfiguration | Kill-Switch aus; 150 Einreichungen im selben Tick; verzögerter bzw. CPU-blockierender Job       | `results/paths-2026-11-04*`            |
| Encoder-Pfad | Encoder läuft                           | Encoder gestoppt; Encoder antwortet nicht; Circuit-Breaker                                      | `results/paths-2026-11-04*`            |
| #456-Kontext | Codepfad am Release                     | Codeanalyse                                                                                     | `kontextpfad-456.md`                   |

Alle Varianten laufen außerhalb des Produktcodes (Messskripte, Umgebungsvariablen,
Testadapter). Jeder Bericht dokumentiert Commit, Referenzset-SHA-256 und ob
gemessene Quellen lokal verändert waren.

## Reproduktion

Voraussetzungen: Node ≥ 22, `npm ci` im Repository-Wurzelverzeichnis; für Themen und
Encoder-Pfade Docker.

```bash
# Encoder-Image aus dem Release bauen und im Labor per loopback-HTTP starten
docker build -t arsnova-wordcloud-encoder:e5-small docker/wordcloud-encoder
docker run -d --name arsnova-2b-encoder --cpus 1.0 --memory 2g --read-only \
  --tmpfs /tmp --cap-drop ALL --security-opt no-new-privileges \
  -e WORD_CLOUD_ENCODER_HTTP_BIND=0.0.0.0:8790 -p 127.0.0.1:8790:8790 \
  arsnova-wordcloud-encoder:e5-small

REF=referat-2b/reference-dataset.v2.2.json
for d in statistics botany history police; do
  npx tsx referat-2b/measure-classification.mts --repo . --ref $REF --out referat-2b/results --domain $d
  npx tsx referat-2b/measure-topics.mts         --repo . --ref $REF --out referat-2b/results --domain $d
done
npx tsx referat-2b/check-runtime-paths.mts --repo . --ref $REF --out referat-2b/results
npx tsx referat-2b/measure-compass.mts --repo . --ref $REF --out referat-2b/results
npx tsx referat-2b/check-group-scenario.mts --out referat-2b/results

# spaCy-Sidecar aus dem Release (nur Unix-Socket; die Messung ruft ihn per docker exec)
docker build -t arsnova-spacy:3.8.15 docker/spacy
docker run -d --name arsnova-2b-spacy --cpus 1.0 --memory 2g --read-only --tmpfs /tmp \
  --tmpfs /run/spacy:uid=1000,gid=1000 --cap-drop ALL --security-opt no-new-privileges \
  arsnova-spacy:3.8.15
npx tsx referat-2b/measure-spacy.mts --ref $REF --out referat-2b/results

# Referenzset prüfen: Struktur und Nähe zum Trainings-Seed
node referat-2b/check-leakage.mjs $REF apps/backend/src/lib/qaNlpSeed.ts
```

Die Klassifikation ist deterministisch (Seed 456); ein Lauf dauert wenige
Sekunden. Themen benötigen je Fach einige Minuten. Am 04.11.2026 zuerst auf
`a5dc74fc` und nach dem Upstream-Merge (#642, Wortwolke) erneut auf `84a5614e`
wiederholt: Alle Vorhersagen je Frage stimmen mit den Läufen vom 23.10.2026 auf
`a657798e` überein; alle Güte- und Kompasswerte sind identisch, nur Laufzeiten
schwanken mit der Rechnerlast.

Release-Tests der gemessenen Pfade, am 04.11.2026 auf `84a5614e` grün:
Backend `npx vitest run src/lib/qaNlp src/lib/wordCloudSemantic src/lib/wordCloudTopicLabels`
(13 Dateien, 96 Tests), `libs/shared-types` `moderation-compass-rules.test.ts` (21
Tests), Frontend `moderation-compass*.spec.ts` (2 Dateien, 102 Tests).

## Live-Demo im laufenden arsnova.eu

Lokale Dev-Instanz mit `QA_NLP_ENABLED=true`, `WORD_CLOUD_SEMANTIC_ENABLED=true`
und `WORD_CLOUD_ENCODER_URL=http://127.0.0.1:8790/embed` (Encoder-Container wie
oben). Die Lehrperson legt eine Q&A-Session ohne Vorab-Moderation an und startet
die Fragerunde; dann speist das Skript Fragen aus dem Referenzset als
Teilnehmende ein – über dieselben öffentlichen Schnittstellen wie der Browser:

```bash
npx tsx referat-2b/demo-feed-questions.mts --code <SESSION-CODE> --domain police --count 40
```

Am 04.11.2026 so durchgespielt: Alle 40 Polizeischul-Fragen erhalten eine
Kategorie (keine `uncertain`), der Kompass meldet »grob nach Inhalt, Ablauf und
Technik sortiert«, und der Sprung über »Fragen zum Ablauf« zeigt Inhaltsfragen wie
»Wie prüfe ich die Verhältnismäßigkeit einer Maßnahme Schritt für Schritt?« ohne
Warnung. Die Wortwolke im Modus »Thema« bildet Encoder-Themen; wird der
Encoder gestoppt und kommen neue Fragen hinzu, liefert die Analyse
`status: failed`, `fallbackUsed: true`. `demo-shots.mjs` spielt denselben Ablauf
mit Playwright durch und legt Screenshots ab.

## Dateien

| Datei                                                                       | Inhalt                                                                                                                                         |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| [`hypothese-und-entscheidung.md`](hypothese-und-entscheidung.md)            | Hypothese, Gegenalternative, Befunde, Entscheidungen E1–E4, Gültigkeitsgrenzen, Gruppensynthese                                                |
| [`kontextpfad-456.md`](kontextpfad-456.md)                                  | Wie Kategorien und Themen in den #456-Kontext gelangen                                                                                         |
| `reference-dataset.v2.2.json`                                               | eingefrorenes Referenzset (723 Fragen, 4 Fächer, de/en/fr/es)                                                                                  |
| `reference-dataset.v1.json`, `.v2.json`, `.v2.1.json`                       | Vorversionen (Historie)                                                                                                                        |
| `build-dataset-v2.mjs`, `build-dataset-ood.mjs`, `build-dataset-police.mjs` | erzeugen v2, v2.1 und v2.2 reproduzierbar                                                                                                      |
| `check-leakage.mjs`                                                         | Strukturprüfung und Nähe zum 8.9b-Seed                                                                                                         |
| `check-batch-stability.mjs`                                                 | Batch-Abhängigkeit der Encoder-Vektoren                                                                                                        |
| `measure-classification.mts`                                                | Kategorien gegen Keyword-Baseline: McNemar, Bootstrap, ECE, Schwellen-Sweep                                                                    |
| `measure-topics.mts`                                                        | Themen gegen lexikalischen Modus: ARI, NMI, BCubed, Fehlzusammenführungen, Schwellen-Sweep                                                     |
| `check-runtime-paths.mts`                                                   | Laufzeitpfade und Fallback unter Fehlerinjektion, Kompass-Modus, Kreuztabelle Thema × Kategorie                                                |
| `measure-compass.mts`                                                       | Kompass-Sicht: Statuszeile und Karte »Häufige Themen« je Fach und Sprache mit/ohne 2B; Verhalten unter Last                                    |
| `check-group-scenario.mts`                                                  | Kontexttest: Sechs-Fragen-Szenario aus #456 durch 8.9b, Wortwolke und Kompass V0–V3, Bewertung mit der 2A-Rubrik                               |
| `measure-spacy.mts`                                                         | Lexikalische Baseline ohne/mit spaCy-Glättung (Release-Sidecar) gegen Encoder-Themen im Kompass, je Fach, Sprache und im Sechs-Fragen-Szenario |
| `demo-feed-questions.mts`, `demo-shots.mjs`                                 | Live-Demo: Fragen in eine laufende Session einspeisen; Ablauf mit Screenshots prüfen                                                           |
| `results/`                                                                  | Berichte (`report.md`), Rohdaten (`results.json`, `items.csv`) je Lauf                                                                         |

## Gültigkeitsgrenzen

- Referenzfragen sind synthetisch und mit KI-Assistenz entworfen; die Kategorien
  wurden ebenfalls KI-gestützt zugeordnet und vom Autor ohne Zweitannotation
  übernommen. Bewusst schwierige Mischung (Near-Miss, Mehrdeutigkeit, Rauschen).
- Fachfremde Fächer mit kleinen Stichproben (37 / 36 / 135 gelabelte Fragen):
  Richtungsbefund.
- spaCy-Sidecar per `docker exec` im Container aufgerufen (nur Unix-Socket).
- Laborbetrieb: Encoder über loopback-HTTP statt Unix-Socket; Queue und Timeout
  in-process mit Testadaptern, ohne HTTP, Datenbank und echte Parallelnutzer.
  Lastaussagen gehören zu Thema 1/3.
- Teilhypothesen H1a/H2a/H2b wurden nach den ersten Messungen operationalisiert
  und gelten als »mit den Daten vereinbar«; Änderungsempfehlungen stützen sich nur
  auf die vorab festgelegten Releasekriterien.

## KI-Nutzung

Für Entwurf des Referenzsets, Messskripte und Textentwürfe wurde ein
KI-Assistent (Claude) eingesetzt. Alle Zahlen stammen aus den hier abgelegten,
ausgeführten Skripten; Codeanker wurden gegen den Releasecode geprüft.
