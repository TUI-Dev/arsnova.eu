# Referat 2B – Hypothese, Gegenalternative und Entscheidung

**Auftrag 2B:** Nichtgenerative Kategorien und semantische Themen
**Leitfrage:** Welchen nachweisbaren Qualitätsgewinn liefern Klassifikation und
Encoder-Themen in Release 1.3 gegenüber dessen lexikalischer beziehungsweise
regelbasierter Baseline?

**Baseline:** unveränderter Stand `a657798e` (neuester Commit `main`,
`kqc-real/arsnova.eu`), Referenzset v2 (500 Fragen; de, en, fr, es, gemischt;
SHA-256 siehe Messbericht), Messläufe vom 21.10.2026. Ergänzung vom
23.10.2026: Referenzset v2.1 (+ 73 fachfremde Fragen aus Botanik und
Geschichte) und Laufzeitpfad-Messung (`check-runtime-paths.mts`).

---

## 1. Transparenz zur Reihenfolge

| Bestandteil                                                                | Wann festgelegt                                                           |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Grundhypothese (Abschnitt 2)                                               | vor der ersten Messung                                                    |
| Akzeptanzkriterien Klassifikation (Präzision ≥ 80 %, Unsicher-Rate ≤ 30 %) | vorab, als Releasekonstanten in `apps/backend/src/lib/qaNlpCalibrate.ts`  |
| Operationalisierung H1a, H2a, H2b                                          | **nach** den Messungen                                                    |
| Prüfung auf fachfremde Fragen (Abschnitt 4, Übertragbarkeit)               | **nach** den Messungen, als Zusatzprüfung                                 |
| Laufzeitpfade und Fallback (Abschnitt 4, Laufzeitpfade)                    | **nach** den Messungen, als Fehlerinjektion an Queue, Timeout und Encoder |

Konsequenz: Änderungsempfehlungen stützen sich nur auf vorab festgelegte
Kriterien. Die nachträglich operationalisierten Teilhypothesen werden als
»mit den Daten vereinbar« berichtet, nicht als bestätigt im strengen Sinn.

## 2. Hypothese und Gegenalternative

**Grundhypothese:** Beide nichtgenerativen Pfade liefern gegenüber der Baseline
nachweisbar mehr korrekt zugeordnete Moderationsinformation, vor allem bei
Paraphrasen und mehrsprachigen Fragen. Unterhalb ihrer Akzeptanzschwellen
erzeugen sie jedoch mehr Fehlzuordnungen als nutzbare Information und müssen
dann auf »unsicher« beziehungsweise die Baseline zurückfallen.

|                      | Klassifikation (8.9b)                                                                                               | Themen (1.14c)                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Teilhypothese a      | H1a: Die Kaskade liefert mehr akzeptierte **und** richtige Kategorien als die Keyword-Baseline (McNemar, p < 0,05). | H2a: Der Encoder stimmt in de und en besser mit der Referenz überein als der lexikalische Themenmodus (ARI in allen 10 Läufen höher). |
| Teilhypothese b      | H1b: Am Betriebspunkt 0,55 erfüllt die Kaskade die Releasekriterien (Präzision ≥ 80 %, Unsicher-Rate ≤ 30 %).       | H2b: Am Betriebspunkt 0,87 führt der Encoder weniger fremde Fragen zusammen als die Baseline.                                         |
| **Gegenalternative** | Nur Keyword-Baseline; `QA_NLP_ENABLED=false`                                                                        | Nur lexikalischer Themenmodus; `WORD_CLOUD_SEMANTIC_ENABLED=false`                                                                    |

## 3. Versuchsaufbau (Kurzform)

Unveränderter Baselinelauf aller Systeme am Releasecode → kontrollierte
Varianten: Schwellen-Sweep (0,35–0,90 bzw. 0,80–0,92), Transliteration
(ä → ae), zehn Läufe mit zufälliger Batch-Zusammensetzung → Vergleich mit
95-%-Bootstrap-Intervallen bzw. Median [min–max] → Befund mit
Gültigkeitsgrenze → Entscheidung. Zusatz: dieselben Messungen je Fachdomäne
(`--domain statistics|botany|history`) sowie Fehlerinjektion an Queue,
Timeout und Encoder. Skripte und Rohdaten: `referat-2b/`.

### Baseline, Versuchsvariante und Ergebnis getrennt

| Untersuchung     | Unveränderte 1.3-Baseline                   | Kontrollierte Versuchsvariante                                                                            | Gemessenes Ergebnis                |
| ---------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Klassifikation   | Kaskade am Betriebspunkt 0,55, Release-Seed | Keyword-Baseline; Schwellen 0,35–0,90; Transliteration; fachfremde Fragen                                 | §4 Klassifikation, Übertragbarkeit |
| Themen           | Encoder bei 0,87, 12 Themen                 | lexikalischer Modus `THEME`; Schwellen 0,80–0,92; 10 Batch-Zusammensetzungen; fachfremde Fragen           | §4 Themen, Übertragbarkeit         |
| Submit-Pfad 8.9b | Release-Queue mit Default-Konfiguration     | Kill-Switch aus; 150 Einreichungen im selben Tick; verzögerter bzw. blockierender Processor (Testadapter) | §4 Laufzeitpfade                   |
| Encoder-Pfad     | Encoder läuft                               | Encoder gestoppt; Encoder antwortet nicht; Circuit-Breaker                                                | §4 Laufzeitpfade                   |
| #456-Kontext     | Codepfad am Release                         | – (Codeanalyse, keine Variante)                                                                           | `kontextpfad-456.md`               |

Rückweg: Alle Varianten laufen außerhalb des Produktcodes (Messskripte,
Umgebungsvariablen, Testadapter). Der Releasecode wurde nicht verändert; die
Manifeste prüfen das (`sourcesDirty: false`).

### Baseline-Abgleich: `a657798e` gegenüber Tag `v1.3.0`

Gemessen wurde `a657798e` (neuester `main`, 181 Commits nach dem Tag
`v1.3.0` = `87c39334`, 08.10.2026). Laut Kursdokument (§3) fixiert die
Lehrperson den produktiv eingesetzten 1.3-Commit; dieser Commit ist mit ihr
abzustimmen.

| Bereich                                                                     | `v1.3.0` gegenüber `a657798e`                                              |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Klassifikator, Seed, Queue, Konfiguration (`qaNlp*`)                        | identisch                                                                  |
| Clustering, Encoder-Client, Encoder-Konfiguration, Schwelle 0,87, 12 Themen | identisch                                                                  |
| `resolveModerationCompassAnalysisMode`, `collectQaNlpCategorySources`       | identisch                                                                  |
| Timeout 8 s, Circuit-Breaker 3 Fehler / 30 s                                | identisch                                                                  |
| Orchestrierung der Themenanalyse (Cluster-Cache über Sortierungen, #578)    | geändert; Fallback-Pfad in beiden vorhanden                                |
| Generativer Themenname (`topic_label`, `wordCloudTopicLabels.ts`)           | erst nach `v1.3.0` (`f7b2b958`); vom Kursdokument zur 1.3-Baseline gezählt |
| Kontext-Packing, Kompass-Karten, `qa.ts`                                    | geändert; Zeilennummern weichen ab                                         |

**Folge:** Die Qualitätsbefunde zu Kategorien und Themen gelten für beide
Stände. Die Zeilenverweise und die Aussage »drei Slot-Aufträge inklusive
Themenname« gelten für `a657798e`.

## 4. Befunde

### Klassifikation (421 gelabelte Fragen, 79 mehrdeutig/Rauschen)

|                                           |    Keyword-Baseline |             Kaskade 1.3 |
| ----------------------------------------- | ------------------: | ----------------------: |
| Nutzbar korrekt (akzeptiert und richtig)  | 35,2 % [30,6; 39,9] | **61,3 %** [56,3; 66,3] |
| Präzision der akzeptierten Kategorien     | 74,7 % [68,5; 80,9] |     66,8 % [62,0; 71,8] |
| Sicher angezeigt, aber falsch             |          **11,9 %** |                  30,4 % |
| Enthaltung bei mehrdeutigen/Rausch-Fragen |              94,9 % |                  74,7 % |

- **H1a mit den Daten vereinbar:** 142 Fragen nur von der Kaskade richtig,
  32 nur von der Baseline (McNemar p < 0,0001).
- **H1b widerlegt:** Präzision 66,8 % liegt deutlich unter 80 %. Kein
  Schwellenwert zwischen 0,35 und 0,90 erfüllt beide Releasekriterien.
- **Kalibrierung fehlt:** Bei angezeigter Konfidenz ≥ 0,85 sind nur 68,6 %
  richtig (ECE 0,24).
- **Generalisierungslücke:** Auf dem eigenen Seed-Evaluationssplit des Releases
  erreicht die Kaskade 87,1 % Präzision, auf dem unabhängigen Referenzset 66,8 %.
- **Sprachen:** Anteil sicher-falscher Kategorien de 20 %, en 30 %, fr 43 %, es 49 %.
- Laufzeit vernachlässigbar (p99 0,37 ms; Training < 4 ms); Transliteration
  ändert die Ergebnisse um ≈ 1 Prozentpunkt.

### Themen (10 Läufe, Median [min–max])

| Fragen              | Lexikalisch ARI |          Encoder ARI | Falsch zusammengeführte Paare (lex. → Encoder) |
| ------------------- | --------------: | -------------------: | ---------------------------------------------- |
| Deutsch (201)       |            0,30 | **0,44** [0,40–0,49] | 211 → 81 [66–90]                               |
| Englisch (120)      |            0,29 | **0,53** [0,52–0,57] | 119 → 27 [21–27]                               |
| Spanisch (81)*      |            0,24 |     0,38 [0,32–0,44] | 70 → 33                                        |
| Französisch (82)*   |            0,21 |     0,22 [0,18–0,26] | 66 → 92                                        |
| Alle gemischt (500) |            0,18 |     0,21 [0,19–0,23] | 758 → 201                                      |

\* Das Produkt ruft den Encoder für fr/es-Sitzungen nicht auf (`WORD_CLOUD_SEMANTIC_LOCALES = de, en`).

- **H2a mit den Daten vereinbar** für de und en, auch im schlechtesten Lauf.
  Für fr kein Gewinn.
- **H2b mit den Daten vereinbar:** deutlich weniger Fehlzusammenführungen.
- **Sprachübergreifend schwach:** nur 6,7 % gleicher Anliegen in
  verschiedenen Sprachen landen im selben Thema.
- **Schwelle:** Für Deutsch liegt die BCubed-F1 zwischen 0,86 und 0,88 auf
  einem Plateau (69,0 / 68,6 / 68,2 %); 0,87 liegt darin.
- **Batch-Abhängigkeit:** Dieselbe Frage erhält je nach mitgesendeten Fragen
  leicht andere Vektoren; Themen können von der Eingangsreihenfolge abhängen.
- **Anzeige:** Nur 12 Themen werden gezeigt; bei 500 Fragen decken sie 13–32 %
  der Fragen ab.
- **Ressourcen:** 500 Fragen in 6,6 s auf 1 CPU, ≈ 600 MB RAM, Image 1,5 GB;
  Clustering in Node 2,0 s für 500 Fragen auf einem Thread.

### Übertragbarkeit auf andere Fächer (Zusatzprüfung, v2.1)

Der 8.9b-Seed (`qaNlpSeed.ts`) enthält nur Statistik- und ML-Inhalte; das
Referenzset v2 ebenfalls. Deshalb je 6 Familien aus Botanik (37 Fragen) und
Geschichte (36 Fragen), jede Domäne getrennt gemessen.

| Anteil nutzbar korrekt (Kaskade) |      Statistik |           Botanik |      Geschichte |
| -------------------------------- | -------------: | ----------------: | --------------: |
| content                          | 66 % (n = 140) | **48 %** (n = 21) |   62 % (n = 21) |
| organization                     | 57 % (n = 155) |     82 % (n = 11) |   90 % (n = 10) |
| technical                        | 61 % (n = 126) |      60 % (n = 5) | **0 %** (n = 5) |
| Keyword-Baseline, gesamt         |           35 % |          **14 %** |         **8 %** |

- Fehler fachfremder Inhaltsfragen kommen **sicher**: »lichtreaktion vs calvin
  zyklus versteh ich nicht« → `technical` (0,998), »Woran erkenne ich, ob eine
  Pflanze monokotyl …« → `organization` (0,993), »La base de datos de
  periódicos no carga« → `content` (0,999). Keine höhere Schwelle fängt das ab.
- Organisatorisches überträgt sich, weil Fristen und Anmeldung fachunabhängig
  formuliert sind.
- Die Keyword-Baseline bricht außerhalb der Statistik ein. Der relative Vorsprung
  der Kaskade wächst, ihre absolute Qualität nicht.
- **Encoder-Themen bleiben stabil:** Median-Kosinus gleicher Familie 0,848 /
  0,851 / 0,848 (Statistik / Botanik / Geschichte). Etwa zwei Drittel der
  zusammengehörigen Paare liegen in allen drei Fächern unter 0,87.
- **Grenze:** kleine Stichproben (≈ 20 Inhalts-, 5 Technikfragen je Fach), keine
  Near-Miss-Fragen in den fachfremden Sets; Richtungsbefund, kein
  Signifikanznachweis. ARI/BCubed sind wegen anderer Setgröße und -struktur
  nicht mit Statistik vergleichbar.

### Laufzeitpfade und Fallback (Fehlerinjektion)

Bericht: `results/paths-2026-10-23T12-08-38-102Z/`. Releaseanker: Submit plant
nur (`routers/qa.ts:1905`, `qaNlpQueue.ts:271`); Timeout `qaNlpQueue.ts:179`;
Encoder-Timeout und Circuit-Breaker `wordCloudSemanticConfig.ts:12`, `:19–20`;
Kompass `moderation-compass.ts:702–712`, `moderation-compass-rules.ts:1010–1033`;
kein Slot für 8.9b laut ADR-0035 (`:143`).

- **8.9b hält den Submit nicht auf:** enqueue p50 0,78 ms; 0 Netzaufrufe bei
  201 Klassifikationen; Ergebnis p50 1,6 ms später.
- **Timeout 2 s** greift bei asynchron hängenden Jobs (`failed:timeout`). Bei
  CPU-blockierender Arbeit greift er nicht (2,5 s Blockade → trotzdem
  `classified`).
- **Queue-Limit 100:** 150 Einreichungen im selben Tick → 50 `failed:queue-limit`.
- **Encoder-Ausfall:** gestoppt → 10 ms bis zum lexikalischen Fallback; hängend →
  8 s (Timeout); nach 3 Fehlern öffnet der Circuit-Breaker → ab der 4. Analyse
  3 ms.
- **Kompass:** Nur `classified`-Fragen gehen in die Kategorie-Quellen ein. Die
  Statuszeile »unsicher« erscheint nur, wenn keine Frage `classified` ist. In
  einer Sitzung mit 201 Fragen zeigte der Kompass »classified«, obwohl 34 Labels
  falsch und 12 auf mehrdeutigen oder Rausch-Fragen gesetzt waren.
- **Kategorie und Thema sind unabhängig:** 6 von 12 Encoder-Themen enthalten
  Fragen mit unterschiedlicher 8.9b-Kategorie.

## 5. Entscheidungen

### E1 – Klassifikation: `QA_NLP_ENABLED=false` beibehalten

- **Betroffen:** Story 8.9b, `QA_NLP_ENABLED` (Release-Default `false`),
  `QA_NLP_MIN_CONFIDENCE` (0,55).
- **Entscheidung:** Funktion **deaktiviert lassen**; Schwelle **nicht ändern**.
- **Begründung:** Vorab festgelegtes Kriterium H1b verfehlt; der Schwellenwert
  ist nicht der Hebel (Sweep). Im #456-Kontext würden falsch akzeptierte
  Kategorien die Auswahl der Fragen für die Kurzfassung verschieben, weil
  `organization` und `technical` eigene bevorzugte Listen erhalten
  (`moderationPromptContextPacking.ts:458–463`). Verstärkt durch die
  Zusatzprüfungen: Außerhalb der Statistik kommen falsche Labels mit Konfidenz
  bis 0,999, und der Kompass zeigt in gemischten Sitzungen »classified« ohne
  Hinweis auf diese Fehler.
- **Folge:** Keine Queue-Last. Die Listen für organisatorische und technische
  Fragen bleiben im Packing leer; diese Fragen konkurrieren in den allgemeinen
  Listen (kontrovers, gut bewertet, unbewertet). Ob der Regelkern organisatorische
  Anliegen dann ausreichend sichtbar macht, ist Schnittstelle zu 2A.
- **Bedingung für eine spätere Aktivierung:** auf einem unabhängigen
  Referenzset inkl. fr/es Präzision ≥ 80 % bei Unsicher-Rate ≤ 30 % und eine
  kalibrierte Konfidenz, geprüft auch auf fachfremden Fragen. Hebel dafür sind
  mehr Trainingsdaten (das Seed hat 186 Beispiele, nur Statistik/ML, wenige in
  fr/es) und Kalibrierung – nicht die Schwelle. Das Modell lernt im Betrieb
  nicht dazu (Training einmal beim Start, `qaNlpGatekeeper.ts:9–16`).
- **Rückweg:** Umgebungsvariable; keine Datenmigration.

### E2 – Themen: Encoder für de/en-Sitzungen aktivierbar, Schwelle 0,87 beibehalten

- **Betroffen:** Story 1.14c, `WORD_CLOUD_SEMANTIC_ENABLED` (Release-Default
  `false`), `WORD_CLOUD_SEMANTIC_COSINE_THRESHOLD` (0,87).
- **Entscheidung:** Aktivierung für de/en-Sitzungen ist durch die Messung
  gedeckt; Schwelle **unverändert**. Der lexikalische Themenmodus bleibt
  automatischer Fallback (Encoder-Ausfall, fr/es-Sitzung, zu wenige Fragen).
- **Begründung:** Deutlicher, über alle Läufe stabiler Qualitätsgewinn in de
  und en bei moderaten Ressourcen. Eine andere Schwelle ist nicht begründbar:
  0,87 liegt im Plateau, und die Themen-Kriterien wurden nachträglich gebildet.
  Die Zusatzprüfungen stützen das: gleiche Ähnlichkeitsstruktur in Botanik und
  Geschichte; der Fallback greift bei gestopptem (10 ms) und hängendem (8 s)
  Encoder, danach schützt der Circuit-Breaker.
- **Folge und Risiken, die der Lehrperson bekannt sein sollten:**
  gemischtsprachige Fragen bilden getrennte Themen; nur 12 Themen sichtbar;
  Themen können je nach Eingangsreihenfolge leicht variieren.
- **Betrieb:** eigener Container, 1 CPU / 2 GB, ohne Netz. Offener Prüfpunkt an
  Thema 1: Das Clustering dauert bei 500 Fragen 2 s in Node; ob das den
  Live-Betrieb verzögert, wurde hier nicht gemessen.
- **Rückweg:** `WORD_CLOUD_SEMANTIC_ENABLED=false` → lexikalischer Modus.

### E3 – #456-Kontext: Übernahme nur gespeicherter Ergebnisse beibehalten

- Im Code bestätigt: Der Kontextabruf ruft weder Klassifikation noch Encoder auf
  (`moderationQaContext.ts:621–625`, `:1027`). Gelöschte oder geänderte Fragen
  verwerfen das betroffene Thema (Hash-Prüfung).
- **Folge:** Themen stehen nur zur Verfügung, wenn der Host den Themenmodus
  vorher geöffnet hat. Das ist der Preis dafür, dass der Kontextabruf schnell
  und begrenzt bleibt; beibehalten.

## 6. Cloud-Bezug (QZ 5)

Die Klassifikation kostet praktisch keine Rechenzeit; die Entscheidung gegen sie
ist eine Qualitätsentscheidung, keine Ressourcenentscheidung. Der Encoder ist
ein isolierter Sidecar mit festen Grenzen und ohne externen Dienst; für die
gemessene Last ist weder GPU noch ein Managed-Dienst nötig. Kosten in Euro
wurden nicht erhoben.

## 7. Gültigkeitsgrenzen

- Referenzfragen synthetisch, von einem KI-Assistenten entworfen; meine
  Prüfung der Zuordnung steht noch aus; ein Annotator, keine Übereinstimmungsmessung.
- Bewusst schwierige Mischung (Near-Miss, Mehrdeutigkeit, Rauschen): Werte
  beschreiben Verhalten in schwierigen Fällen, nicht eine typische Vorlesung.
- Modellkonfidenz ist ohne Kalibrierung keine Erfolgswahrscheinlichkeit;
  Themenhäufigkeit ist kein Lernstandsmaß.
- Laborbetrieb (Encoder über loopback-HTTP statt Unix-Socket). Queue und
  Timeout in-process mit Testadaptern gemessen, ohne HTTP, Datenbank und echte
  Parallelnutzer; Cache-Latenzen nicht gemessen.
- Fachfremde Prüfung mit kleinen Stichproben und ohne Near-Miss-Fragen;
  zeigt eine Richtung, keinen Signifikanznachweis.

## 8. Beitrag zur Gruppensynthese

Für die Stufenempfehlung der Gruppe liefert 2B:
**Regelkern (2A) immer · Encoder-Themen zusätzlich in de/en-Sitzungen ·
Klassifikation vorerst aus.** Schnittstelle zu 2C: Die Kurzfassung erhält
Themen nur aus dem gespeicherten Snapshot und ohne Kategorien-Listen, solange
E1 gilt.

### Wann 2B einen zusätzlichen Beitrag leistet

| Funktion       | Zusätzlicher Beitrag, wenn …                                                      | Kein Beitrag bzw. Schaden, wenn …                                                                                                         |
| -------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Encoder-Themen | de/en-Sitzung, Host öffnet den Themenmodus, viele Paraphrasen desselben Anliegens | fr/es (Produkt nutzt den Encoder nicht), gemischtsprachige Sitzung, wenige Fragen, Encoder nicht erreichbar (dann lexikalischer Fallback) |
| Kategorien     | erst nach Erfüllung der Aktivierungsbedingung aus E1                              | heute: zu viele sicher-falsche Labels, besonders bei Klausurrelevanz und fachfremden Inhalten                                             |

Fehler- und Betriebskosten: Kategorien kosten fast keine Rechenzeit; ihr Preis
sind Fehlzuordnungen. Encoder-Themen kosten einen Container (1 CPU, 2 GB) und
eine Host-Aktion; ihr Preis sind die nur 12 sichtbaren Themen und die Schwelle,
die zwei Drittel zusammengehöriger Paare trennt.

### Gemeinsame Nutzungsfrage

»Kann die Lehrperson Übungswünsche, Prüfungsorganisation und geteilte
Bewertungen unterscheiden und die Belege prüfen?« Antwort aus 2B-Sicht
(Referenzset v2, Statistik):

| Anliegen                                                    |   n | Kaskade: nutzbar korrekt | sicher falsch (wohin)               | Keyword-Baseline: nutzbar korrekt |
| ----------------------------------------------------------- | --: | -----------------------: | ----------------------------------- | --------------------------------: |
| Übungswunsch (C-REG)                                        |  13 |                     69 % | 4 (3 × organization, 1 × technical) |                              62 % |
| Klausurrelevanz (C-HYP, N-ZEXAM, N-CORREXAM, S-REG-EXAM)    |  20 |                 **35 %** | **11 × organization**               |                          **80 %** |
| Prüfungsorganisation (O-REG, O-AIDS, O-ROOM, N-BONUSRETAKE) |  40 |                     68 % | 9 (7 × content, 2 × technical)      |                              13 % |
| Anwesenheit (O-ATT)                                         |  13 |                     77 % | 2                                   |                              69 % |

- **Kategorien trennen ausgerechnet Klausurrelevanz und Prüfungsorganisation
  schlecht:** Das Wort »Klausur« zieht inhaltliche Fragen zu `organization`.
  Die Labelregel (»Kommt X dran?« → content, »Welcher Raum?« → organization)
  entspricht dem Release-Seed (`qaNlpSeed.ts:60` content, `:167` organization).
  Für die Gruppenrubrik ist abzustimmen, ob »Prüfungsorganisation« die
  Klausurrelevanz einschließt.
- **Themen trennen besser:** Der lexikalische Modus fasst in de fast alle
  Klausurfragen zu einem Thema zusammen (O-REG, O-AIDS, O-ROOM, C-HYP,
  S-REG-EXAM, N-ZEXAM, O-GRADE). Der Encoder bildet in de nur ein gemischtes
  Thema innerhalb der Organisation (O-ROOM + O-REG). In en verbindet er
  Anwesenheit und Hilfsmittel.
- **Geteilte Bewertungen** sind keine 2B-Funktion: Kategorien ignorieren Stimmen;
  Themen hängen nur von den Texten ab, die Gewichtung ordnet sie lediglich um
  (`word-cloud-semantic.md:51`). Im #456-Kontext erhält jedes Thema
  Stimmen-Aggregate (`moderationQaContext.ts:787–788`); deren Deutung gehört zu
  2A/2C.

### Einordnung in die gemeinsame Informationsrubrik

Die Rubrik operationalisiert 2A (Quellennachvollziehbarkeit, korrekte Bedeutung
von Bewertungen, Trennung organisatorischer/fachlicher Anliegen, Darstellung
von Unsicherheit, Informationsumfang). Beitrag von 2B je Kriterium:

| Rubrikkriterium                    | Kategorien 8.9b                                                                                                                    | Encoder-Themen 1.14c                                                                              |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Quellennachvollziehbarkeit         | je Frage-ID; Kompass verlinkt die Fragen (`moderation-compass.ts:702–728`)                                                         | Mitglieds-IDs mit Text-Hash, Label = Text einer Mitgliedsfrage (`qaSemanticTopicSnapshot.ts:150`) |
| Korrekte Bedeutung von Bewertungen | nicht anwendbar                                                                                                                    | nicht Teil der Gruppierung; Aggregate im Kontext                                                  |
| Trennung organisatorisch/fachlich  | gemessen, siehe Nutzungsfrage: schwach bei Klausurrelevanz                                                                         | gemessen: besser als lexikalisch, Restfehler innerhalb der Organisation                           |
| Darstellung von Unsicherheit       | Status `uncertain`, Konfidenz als `uncalibrated-model-score`; aber sicher-falsche Labels und Kompass-Maskierung (§4 Laufzeitpfade) | Status `uncertain` je Analyse, Konfidenz je Thema; Fallback mit Status `failed`                   |
| Informationsumfang                 | 92 % der Fragen erhalten eine Kategorie                                                                                            | 12 Themen decken 13–32 % der Fragen ab                                                            |

Kategorien, Themen und Kurzfassung bleiben dabei getrennte Teilfunktionen und
werden nicht als austauschbare Klassifikatoren verglichen. Ihr gemeinsamer
Maßstab ist die Rubrik.
