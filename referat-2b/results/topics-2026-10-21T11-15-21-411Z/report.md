# Referat 2B – Themenmessung 1.14c (Encoder vs. lexikalisch)

Commit `a657798e4ab5` (v1.3.0-181-ga657798e), Referenzset 1.0.0-draft (SHA-256 `6d00fcd33899ac65…`), 2026-10-21T11:15:21.411Z
Modell `intfloat/multilingual-e5-small` / `intfloat/multilingual-e5-small@sha256:f80102d3f2a1229f`, 384 Dimensionen · Container-Limits cpus=1000000000 mem=2147483648 · loopback HTTP http://127.0.0.1:8790/embed (Labor; Produktion: Unix-Socket, network_mode none)

Umfang: 97 von 112 Items, Sprachen de, en, fr, es (+ mixed). Italienisch ausgeschlossen, weil die Wortwolke es nicht unterstützt (WORD_CLOUD_LEMMA_LOCALES).

Goldstandard: Themenfamilien des Referenzsets; Near-Miss-, mehrdeutige und Rausch-Items sind Einzelthemen.

## 1. Hauptergebnis

| Teilmenge | n | System | ARI | NMI | BCubed P | BCubed R | BCubed F1 | Themen ≥2 (Gold) | Falsch-Merge-Paare | Paar-Recall einsprachig | Paar-Recall sprachübergreifend |
|---|---:|---|---:|---:|---:|---:|---:|---|---:|---:|---:|
| Gesamtset (de/en/fr/es), Session-Locale de | 97 | Encoder | 0.283 | 0.845 | 86.3 % | 46.0 % | 60.0 % | 27 (17) | 17 | 35.1 % | 14.2 % |
| Gesamtset (de/en/fr/es), Session-Locale de | 97 | Lexikalisch | 0.220 | 0.807 | 77.7 % | 44.8 % | 56.9 % | 20 (17) | 38 | 24.3 % | 14.2 % |
| nur Deutsch | 54 | Encoder | 0.496 | 0.898 | 80.9 % | 72.5 % | 76.5 % | 15 (17) | 13 | 45.9 % | – |
| nur Deutsch | 54 | Lexikalisch | 0.231 | 0.852 | 73.8 % | 64.5 % | 68.9 % | 11 (17) | 26 | 24.3 % | – |
| nur Englisch † | 20 | Encoder | 0.000 | 0.964 | 85.0 % | 100.0 % | 91.9 % | 3 (0) | 3 | – | – |
| nur Englisch † | 20 | Lexikalisch | 0.000 | 0.912 | 70.0 % | 100.0 % | 82.4 % | 4 (0) | 9 | – | – |
| nur Französisch ⚠ † | 10 | Encoder | 0.000 | 0.833 | 60.0 % | 100.0 % | 75.0 % | 2 (0) | 6 | – | – |
| nur Französisch † | 10 | Lexikalisch | 0.000 | 0.969 | 90.0 % | 100.0 % | 94.7 % | 1 (0) | 1 | – | – |
| nur Spanisch ⚠ † | 11 | Encoder | 1.000 | 1.000 | 100.0 % | 100.0 % | 100.0 % | 0 (0) | 0 | – | – |
| nur Spanisch † | 11 | Lexikalisch | 0.000 | 0.945 | 81.8 % | 100.0 % | 90.0 % | 2 (0) | 2 | – | – |

† Nicht aussagekräftig: In dieser Teilmenge hat keine Familie zwei Mitglieder derselben Sprache. ARI ist dann 0, BCubed belohnt bloßes Nicht-Zusammenfassen. Nur Gesamtset und Deutsch tragen eine Aussage; für Einsprachigkeit in en/fr/es wären mehr Items je Sprache nötig.

⚠ Session-Locale nicht in `WORD_CLOUD_SEMANTIC_LOCALES` (de, en): Das Produkt ruft den Encoder dort **nicht** auf und zeigt den lexikalischen Fallback. Encoderwerte zeigen nur das ungenutzte Potenzial.

### Stabilität über die Batch-Zusammensetzung

Das Embedding einer Frage hängt von den anderen Texten derselben Anfrage ab (Vektor-Drift 1 − cos: Median 3.1e-3, max 1.3e-2). Vermutete Ursache: quantisiertes ONNX-Modell (nicht verifiziert). Tabelle 1 oben zeigt **eine** Gesamtanfrage; hier 10 Läufe mit zufälliger Reihenfolge und Anfragegrößen 5–40 (simuliert inkrementelles Einbetten). Werte: Median [min–max].

| Teilmenge | Encoder ARI | Encoder BCubed F1 | Falsch-Merge-Paare | Themen ≥2 | Lexikalisch ARI (deterministisch) |
|---|---|---|---|---|---:|
| Gesamtset (de/en/fr/es), Session-Locale de | 0.277 [0.255–0.310] | 60.0 % [58.7 %–61.4 %] | 17 [14–21] | 26 [25–28] | 0.220 |
| nur Deutsch | 0.458 [0.432–0.544] | 75.2 % [74.1 %–78.0 %] | 14 [10–16] | 15 [14–16] | 0.231 |
| nur Englisch † | 0.000 [0.000–0.000] | 93.3 % [91.9 %–94.7 %] | 3 [2–3] | 3 [2–3] | 0.000 |
| nur Französisch † | 0.000 [0.000–0.000] | 75.0 % [75.0 %–82.4 %] | 6 [4–6] | 2 [2–2] | 0.000 |
| nur Spanisch † | 1.000 [0.000–1.000] | 100.0 % [95.2 %–100.0 %] | 0 [0–1] | 0 [0–1] | 0.000 |

## 2. Produktansicht (Gate, Top-12, Status)

| Teilmenge | Gate bestanden | Status | angezeigte Themen | davon ≥2 Mitglieder | Anteil Fragen in angezeigten Mehrfach-Themen |
|---|:---:|---|---:|---:|---:|
| Gesamtset (de/en/fr/es), Session-Locale de | ✓ | ready | 12 | 12 | 35.1 % |
| nur Deutsch | ✓ | ready | 12 | 12 | 57.4 % |
| nur Englisch | ✓ | ready | 12 | 3 | 30.0 % |
| nur Französisch | ✓ | fallback (Locale) | 6 | 2 | 60.0 % |
| nur Spanisch | – | fallback (Locale) | 11 | 0 | 0.0 % |

## 3. Ähnlichkeitsverteilung (Kosinus, Gesamtset)

| Paare | n | min | p10 | Median | p90 | max |
|---|---:|---:|---:|---:|---:|---:|
| gleiche Familie | 157 | 0.734 | 0.783 | 0.848 | 0.904 | 0.946 |
| verschiedene Familien | 4499 | 0.665 | 0.741 | 0.785 | 0.828 | 0.922 |
| verschiedene Familien, gleicher Satzrahmen | 3 | 0.861 | 0.861 | 0.861 | 0.864 | 0.864 |

Paare verschiedener Familien ≥ 0.87: 45 · Paare gleicher Familie < 0.87: 103 von 157

## 4. Schwellen-Sweep (Encoder)

**Gesamtset (de/en/fr/es), Session-Locale de**

| Schwelle | ARI | BCubed P | BCubed R | BCubed F1 | Themen ≥2 | Falsch-Merge-Paare | Paar-Recall sprachübergr. |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 0.80 | 0.329 | 51.5 % | 58.5 % | 54.8 % | 22 | 127 | 33.3 % |
| 0.82 | 0.370 | 65.4 % | 54.8 % | 59.6 % | 28 | 59 | 29.2 % |
| 0.84 | 0.403 | 73.3 % | 54.8 % | 62.7 % | 28 | 40 | 29.2 % |
| 0.85 | 0.369 | 79.9 % | 51.7 % | 62.8 % | 27 | 29 | 22.5 % |
| 0.86 | 0.368 | 82.3 % | 51.2 % | 63.1 % | 25 | 26 | 22.5 % |
| 0.87 ◀ | 0.283 | 86.3 % | 46.0 % | 60.0 % | 27 | 17 | 14.2 % |
| 0.88 | 0.279 | 92.1 % | 45.2 % | 60.6 % | 25 | 9 | 12.5 % |
| 0.89 | 0.243 | 95.9 % | 43.1 % | 59.5 % | 19 | 4 | 9.2 % |
| 0.90 | 0.147 | 99.0 % | 38.9 % | 55.9 % | 10 | 1 | 5.0 % |
| 0.92 | 0.070 | 99.0 % | 36.2 % | 53.0 % | 7 | 1 | 2.5 % |

**nur Deutsch**

| Schwelle | ARI | BCubed P | BCubed R | BCubed F1 | Themen ≥2 | Falsch-Merge-Paare | Paar-Recall sprachübergr. |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 0.80 | 0.295 | 43.9 % | 80.9 % | 56.9 % | 13 | 83 | – |
| 0.82 | 0.380 | 59.3 % | 78.1 % | 67.4 % | 18 | 43 | – |
| 0.84 | 0.394 | 67.7 % | 76.2 % | 71.7 % | 15 | 36 | – |
| 0.85 | 0.412 | 72.1 % | 74.4 % | 73.2 % | 14 | 29 | – |
| 0.86 | 0.414 | 75.1 % | 72.5 % | 73.8 % | 13 | 25 | – |
| 0.87 ◀ | 0.496 | 80.9 % | 72.5 % | 76.5 % | 15 | 13 | – |
| 0.88 | 0.515 | 87.7 % | 71.3 % | 78.6 % | 13 | 8 | – |
| 0.89 | 0.527 | 92.6 % | 70.1 % | 79.8 % | 12 | 4 | – |
| 0.90 | 0.419 | 100.0 % | 64.2 % | 78.2 % | 6 | 0 | – |
| 0.92 | 0.191 | 100.0 % | 57.4 % | 72.9 % | 4 | 0 | – |

**Sweep über 10 inkrementelle Läufe** – BCubed F1 bzw. Falsch-Merge-Paare, Median [min–max]

| Schwelle | Gesamtset F1 | Gesamtset Falsch-Merges | Deutsch F1 | Deutsch Falsch-Merges |
|---:|---|---|---|---|
| 0.80 | 56.9 % [54.2 %–58.6 %] | 117 [93–139] | 55.1 % [51.8 %–59.4 %] | 90 [77–101] |
| 0.82 | 61.0 % [56.3 %–63.7 %] | 56 [44–73] | 63.6 % [60.6 %–68.2 %] | 51 [45–55] |
| 0.84 | 62.2 % [56.9 %–63.7 %] | 36 [29–48] | 69.3 % [68.4 %–71.9 %] | 30 [26–34] |
| 0.85 | 62.9 % [58.6 %–64.0 %] | 28 [26–31] | 70.7 % [70.1 %–72.9 %] | 27 [25–28] |
| 0.86 | 61.9 % [58.3 %–64.7 %] | 24 [20–25] | 73.8 % [72.5 %–74.5 %] | 21 [17–23] |
| 0.87 ◀ | 60.0 % [58.7 %–61.4 %] | 17 [14–21] | 75.2 % [74.1 %–78.0 %] | 14 [10–16] |
| 0.88 | 59.5 % [58.6 %–60.3 %] | 9 [7–13] | 77.4 % [73.6 %–79.4 %] | 8 [7–13] |
| 0.89 | 58.1 % [57.4 %–58.6 %] | 5 [3–7] | 78.1 % [77.1 %–79.2 %] | 4 [3–6] |
| 0.90 | 55.7 % [54.7 %–56.7 %] | 2 [1–3] | 76.9 % [75.0 %–79.1 %] | 1 [0–2] |
| 0.92 | 52.7 % [51.9 %–53.0 %] | 0 [0–1] | 72.6 % [70.7 %–72.9 %] | 0 [0–0] |

## 5. Gefundene Themen im Gesamtset (eine Gesamtanfrage)

**Encoder** (nur Themen mit ≥ 2 Mitgliedern; ✗ = mischt Familien)

| Label | Konfidenz | Mitglieder | Familien |
|---|---:|---|---|
| The poll won't load on my phone. | 0.946 | R087, R088 | T-VOTE |
| Could you walk us through another linear regression example? | 0.913 | R001, R003, R004 | C-REG |
| Gilt für Blatt 2 die Abgabe Freitag 23:59 oder Sonntag? | 0.911 | R041, R036, R040 | O-DEAD |
| Wie rechne ich mit Bayes bedingte Wahrscheinlichkeiten aus, an einem Beispiel? | 0.903 | R030, R031 | C-BAYES |
| Ist die Formelsammlung im Moodle die aktuelle Version? | 0.899 | R053, R097 | ✗ O-AIDS, S-FORMULA-VERSION |
| Woher kommt auf Folie 17 plötzlich das Quadrat? | 0.898 | R026, R108 | ✗ C-DERIV, S-AMB-6 |
| Die Projektion ist so blass, dass man die Formeln nicht lesen kann. | 0.898 | R081, R083 | T-BEAM |
| The eduroam connection keeps dropping in here. | 0.897 | R069, R070 | T-WIFI |
| Can you give an intuitive example of Bayes' theorem? | 0.895 | R032, R034 | C-BAYES |
| Bis wann müssen wir das zweite Übungsblatt hochladen? | 0.894 | R035, R104 | ✗ O-DEAD, S-AMB-2 |
| Kurze Nachfrage: gibt es noch ein Beispiel zur Regression? | 0.909 | R002, R006, R007 | C-REG |
| Können Sie nochmal erklären, was der p-Wert eigentlich aussagt? | 0.916 | R015, R014, R019 | C-PVAL |
| Den Schritt von Zeile 2 auf Zeile 3 in der Herleitung auf Folie 17 verstehe ich nicht. | 0.892 | R025, R027 | C-DERIV |
| Findet nächsten Donnerstag überhaupt Vorlesung statt? | 0.912 | R063, R058, R059 | ✗ O-REC, O-CANC |
| Der Beamer schneidet die rechte Hälfte der Folie ab. | 0.888 | R080, R084 | T-BEAM |
| El wifi del aula se cae todo el rato. | 0.887 | R068, R071 | T-WIFI |
| Wird in der Vorlesung die Anwesenheit kontrolliert? | 0.885 | R042, R043 | O-ATT |
| ¡Gracias! | 0.885 | R109, R112 | ✗ S-NOISE-1, S-NOISE-4 |
| Wie erkenne ich Overfitting in der Praxis? | 0.884 | R020, R022 | C-OVF |
| Sind die Hypothesentests aus Kapitel 5 klausurrelevant? | 0.89 | R102, R008, R013 | ✗ S-CH5-READING, C-HYP |
| What does a p-value actually tell us? | 0.881 | R016, R018 | C-PVAL |
| Le cours de jeudi prochain est maintenu ? | 0.897 | R038, R061, R067 | ✗ O-DEAD, O-CANC, O-REC |
| Beim Download der Vorlesungsfolien kommt nur eine Fehlermeldung. | 0.882 | R098, R091, R092 | ✗ S-SLIDE-TYPO, T-PDF |
| Die Abstimmung lädt bei mir seit zwei Minuten nicht. | 0.891 | R100, R085, R086 | ✗ S-REC-PLAYBACK, T-VOTE |
| On n'entend rien au fond, le micro est trop faible. | 0.901 | R076, R074, R077 | T-AUDIO |
| Is there a lecture next Thursday or is it cancelled? | 0.873 | R044, R060 | ✗ O-ATT, O-CANC |
| Is this going to be on it? | 0.873 | R065, R105 | ✗ O-REC, S-AMB-3 |

**Lexikalisch** (nur Themen mit ≥ 2 Mitgliedern; ✗ = mischt Familien)

| Label | Konfidenz | Mitglieder | Familien |
|---|---:|---|---|
| Folie | – | R098, R025, R080, R108, R026 | ✗ S-SLIDE-TYPO, C-DERIV, T-BEAM, S-AMB-6 |
| Regression | – | R002, R003, R001, R007, R004 | C-REG |
| Vorlesung | – | R058, R059, R043, R063, R042 | ✗ O-CANC, O-ATT, O-REC |
| Bayes | – | R032, R030, R034, R031 | C-BAYES |
| exam | – | R055, R049, R010, R099 | ✗ O-AIDS, O-ROOM, C-HYP, S-EXAM-WIFI |
| Moodle | – | R091, R097, R093, R064 | ✗ T-PDF, S-FORMULA-VERSION, O-REC |
| Kapitel 5 | – | R102, R013, R008 | ✗ S-CH5-READING, C-HYP |
| cours | – | R067, R061 | ✗ O-REC, O-CANC |
| diapositivas | – | R094, R083 | ✗ T-PDF, T-BEAM |
| eduroam | – | R069, R070 | T-WIFI |
| examen | – | R011, R056 | ✗ C-HYP, O-AIDS |
| hochladen | – | R035, R104 | ✗ O-DEAD, S-AMB-2 |
| Klausur | – | R053, R096 | ✗ O-AIDS, S-REG-EXAM |
| Nachfrage | – | R041, R073 | ✗ O-DEAD, T-WIFI |
| overfitting | – | R022, R020 | C-OVF |
| p-value | – | R019, R016 | C-PVAL |
| p-Wert | – | R015, R014 | C-PVAL |
| Prüfung | – | R054, R009 | ✗ O-AIDS, C-HYP |
| quelle | – | R050, R038 | ✗ O-ROOM, O-DEAD |
| slides | – | R084, R082 | T-BEAM |

## 6. Falsch zusammengeführte Paare (Encoder, Gesamtset)

- R008 »Sind die Hypothesentests aus Kapitel 5 klausurrelevant?« ↔ R102 »Gibt es zu Kapitel 5 weiterführende Literatur?«
- R013 »kapitel 5 klausur relevant??« ↔ R102 »Gibt es zu Kapitel 5 weiterführende Literatur?«
- R026 »Woher kommt auf Folie 17 plötzlich das Quadrat?« ↔ R108 »Folie 17?«
- R035 »Bis wann müssen wir das zweite Übungsblatt hochladen?« ↔ R104 »Kann man das nochmal hochladen?«
- R038 »Quelle est la date de rendu de la deuxième feuille d'exercices ?« ↔ R061 »Le cours de jeudi prochain est maintenu ?«
- R038 »Quelle est la date de rendu de la deuxième feuille d'exercices ?« ↔ R067 »Est-ce que le cours est enregistré ?«
- R044 »Do we lose points if we skip lectures?« ↔ R060 »Is there a lecture next Thursday or is it cancelled?«
- R053 »Dürfen wir in der Klausur eine Formelsammlung benutzen?« ↔ R097 »Ist die Formelsammlung im Moodle die aktuelle Version?«
- R058 »Fällt die Vorlesung am Donnerstag wegen des Feiertags aus?« ↔ R063 »Wird die heutige Vorlesung aufgezeichnet?«
- R059 »Findet nächsten Donnerstag überhaupt Vorlesung statt?« ↔ R063 »Wird die heutige Vorlesung aufgezeichnet?«
- R061 »Le cours de jeudi prochain est maintenu ?« ↔ R067 »Est-ce que le cours est enregistré ?«
- R065 »Will the recording be uploaded afterwards?« ↔ R105 »Is this going to be on it?«
- R085 »Die Abstimmung lädt bei mir seit zwei Minuten nicht.« ↔ R100 »Die Aufzeichnung von letzter Woche bricht bei mir nach fünf Minuten ab.«
- R086 »Ich komme mit dem Sitzungscode nicht in die Umfrage rein.« ↔ R100 »Die Aufzeichnung von letzter Woche bricht bei mir nach fünf Minuten ab.«
- R091 »Das Folien-PDF im Moodle ist beschädigt.« ↔ R098 »Auf Folie 12 ist in der Formel ein Fehler, oder?«
- R092 »Beim Download der Vorlesungsfolien kommt nur eine Fehlermeldung.« ↔ R098 »Auf Folie 12 ist in der Formel ein Fehler, oder?«
- R109 »Danke, super erklärt!« ↔ R112 »¡Gracias!«

## 7. Laufzeit und Ressourcen

Kaltstart Container → /health: 1.6 s · erster Embed-Aufruf (97 Texte): 1195 ms · Image 1497 MB · Container nach Last: 474.5MiB / 2GiB|0.01%

| Texte pro Anfrage | p50 | p95 | max | ms/Text (p50) |
|---:|---:|---:|---:|---:|
| 16 | 215 ms | 296 ms | 296 ms | 13.4 |
| 56 | 703 ms | 891 ms | 891 ms | 12.5 |
| 97 | 1191 ms | 1312 ms | 1312 ms | 12.3 |

Clustering in Node (naive Complete-Linkage, ein Thread):

| Texte | Zeit |
|---:|---:|
| 97 | 57 ms |
| 250 | 302 ms |
| 500 | 1575 ms |

## Gültigkeitsgrenzen

- Synthetisches Referenzset; ein Annotator; Familien sind sprachunabhängig definiert.
- Laborbetrieb über loopback-HTTP statt Unix-Socket; Transport-Overhead daher nicht produktionsgleich.
- Embedding-Cache der App (Redis/In-Process) nicht genutzt: Latenzen sind Kaltpfad-Werte je Anfrage.
- Themenhäufigkeit ist kein Lernstandsmaß.
