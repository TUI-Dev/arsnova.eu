# Referat 2B – Klassifikationsmessung 8.9b

Commit `a657798e4ab5` (v1.3.0-181-ga657798e), Referenzset 1.0.0-draft (SHA-256 `6d00fcd33899ac65…`), 2026-10-21T11:26:54.226Z
Node v24.12.0, Intel(R) Core(TM) i7-7700K CPU @ 4.20GHz × 8, 31.9 GB RAM, win32 10.0.19045 x64

Umfang: 97 von 112 Items, Sprachen de, en, fr, es (+ mixed); Italienisch ausgeschlossen (Untersuchungsumfang an Wortwolken-Locales angeglichen).

Gelabelt: 87 Items · erwartet unsicher (mehrdeutig/Rauschen): 10 · Betriebspunkt `QA_NLP_MIN_CONFIDENCE` = 0.55

## 1. Hauptergebnis (Originalschreibung, Betriebspunkt)

| System | Best-Guess-Acc. | Macro-F1 | Abdeckung | Präzision akzeptiert | Nutzbar korrekt | Falsch akzeptiert | Enthaltung mehrdeutig/Rauschen |
|---|---:|---:|---:|---:|---:|---:|---:|
| Keyword-Baseline (regelbasiert) | 58.6 % | 0.552 | 49.4 % | 86.0 % | 42.5 % | 6.9 % | 90.0 % |
| Gatekeeper (Naive Bayes, nur Schwelle) | 67.8 % | 0.677 | 95.4 % | 68.7 % | 65.5 % | 29.9 % | 10.0 % |
| Kaskade 1.3 (Gatekeeper + k-NN) | 67.8 % | 0.677 | 88.5 % | 68.8 % | 60.9 % | 27.6 % | 70.0 % |

*Nutzbar korrekt* = akzeptiert und richtig, bezogen auf alle gelabelten Items. *Falsch akzeptiert* = Lehrperson sieht eine sichere, aber falsche Kategorie.

### 95-%-Bootstrap-Intervalle

| System | Nutzbar korrekt | Präzision akzeptiert | Abdeckung | Macro-F1 |
|---|---|---|---|---|
| Keyword-Baseline (regelbasiert) | [32.2 %; 52.9 %] | [75.0 %; 95.6 %] | [39.1 %; 59.8 %] | [0.434; 0.662] |
| Gatekeeper (Naive Bayes, nur Schwelle) | [55.2 %; 74.7 %] | [58.5 %; 78.3 %] | [90.8 %; 98.9 %] | [0.572; 0.767] |
| Kaskade 1.3 (Gatekeeper + k-NN) | [50.6 %; 71.3 %] | [58.0 %; 78.9 %] | [81.6 %; 94.3 %] | [0.570; 0.771] |

### Paarvergleich (exakter McNemar-Test, gepaart über dieselben Items)

| Vergleich | Merkmal | nur A richtig | nur B richtig | p |
|---|---|---:|---:|---:|
| cascade vs keyword | nutzbar korrekt | 25 | 9 | 0.0090 |
| cascade vs keyword | Best-Guess korrekt | 18 | 10 | 0.1849 |
| gatekeeper vs keyword | nutzbar korrekt | 27 | 7 | 0.0008 |
| gatekeeper vs keyword | Best-Guess korrekt | 18 | 10 | 0.1849 |
| cascade vs gatekeeper | nutzbar korrekt | 1 | 5 | 0.2188 |
| cascade vs gatekeeper | Best-Guess korrekt | 1 | 1 | 1.0000 |

Kaskadenpfade: early-exit 70, fallback 17

## 2. Schwellen-Sweep

Vorab festgelegte Kriterien (Releasekonstanten): Präzision akzeptiert ≥ 80.0 %, Unsicher-Rate ≤ 30.0 %.

**Keyword-Baseline (regelbasiert)**

| Schwelle | Abdeckung | Präzision akz. | Nutzbar korrekt | Falsch akz. | Enthaltung mehrd. | Kriterien |
|---:|---:|---:|---:|---:|---:|:---:|
| 0.35 | 60.9 % | 75.5 % | 46.0 % | 14.9 % | 80.0 % | – |
| 0.40 | 60.9 % | 75.5 % | 46.0 % | 14.9 % | 80.0 % | – |
| 0.45 | 60.9 % | 75.5 % | 46.0 % | 14.9 % | 80.0 % | – |
| 0.50 | 60.9 % | 75.5 % | 46.0 % | 14.9 % | 80.0 % | – |
| 0.55 ◀ | 49.4 % | 86.0 % | 42.5 % | 6.9 % | 90.0 % | – |
| 0.60 | 49.4 % | 86.0 % | 42.5 % | 6.9 % | 90.0 % | – |
| 0.65 | 49.4 % | 86.0 % | 42.5 % | 6.9 % | 90.0 % | – |
| 0.70 | 47.1 % | 85.4 % | 40.2 % | 6.9 % | 90.0 % | – |
| 0.80 | 46.0 % | 85.0 % | 39.1 % | 6.9 % | 90.0 % | – |
| 0.90 | 46.0 % | 85.0 % | 39.1 % | 6.9 % | 90.0 % | – |

**Gatekeeper (Naive Bayes, nur Schwelle)**

| Schwelle | Abdeckung | Präzision akz. | Nutzbar korrekt | Falsch akz. | Enthaltung mehrd. | Kriterien |
|---:|---:|---:|---:|---:|---:|:---:|
| 0.35 | 100.0 % | 67.8 % | 67.8 % | 32.2 % | 0.0 % | – |
| 0.40 | 100.0 % | 67.8 % | 67.8 % | 32.2 % | 0.0 % | – |
| 0.45 | 100.0 % | 67.8 % | 67.8 % | 32.2 % | 10.0 % | – |
| 0.50 | 98.9 % | 68.6 % | 67.8 % | 31.0 % | 10.0 % | – |
| 0.55 ◀ | 95.4 % | 68.7 % | 65.5 % | 29.9 % | 10.0 % | – |
| 0.60 | 90.8 % | 70.9 % | 64.4 % | 26.4 % | 30.0 % | – |
| 0.65 | 88.5 % | 72.7 % | 64.4 % | 24.1 % | 30.0 % | – |
| 0.70 | 86.2 % | 73.3 % | 63.2 % | 23.0 % | 50.0 % | – |
| 0.80 | 75.9 % | 78.8 % | 59.8 % | 16.1 % | 60.0 % | – |
| 0.90 | 65.5 % | 82.5 % | 54.0 % | 11.5 % | 60.0 % | – |

**Kaskade 1.3 (Gatekeeper + k-NN)**

| Schwelle | Abdeckung | Präzision akz. | Nutzbar korrekt | Falsch akz. | Enthaltung mehrd. | Kriterien |
|---:|---:|---:|---:|---:|---:|:---:|
| 0.35 | 87.4 % | 68.4 % | 59.8 % | 27.6 % | 70.0 % | – |
| 0.40 | 87.4 % | 68.4 % | 59.8 % | 27.6 % | 70.0 % | – |
| 0.45 | 87.4 % | 68.4 % | 59.8 % | 27.6 % | 70.0 % | – |
| 0.50 | 88.5 % | 68.8 % | 60.9 % | 27.6 % | 70.0 % | – |
| 0.55 ◀ | 88.5 % | 68.8 % | 60.9 % | 27.6 % | 70.0 % | – |
| 0.60 | 89.7 % | 69.2 % | 62.1 % | 27.6 % | 70.0 % | – |
| 0.65 | 89.7 % | 70.5 % | 63.2 % | 26.4 % | 70.0 % | – |
| 0.70 | 88.5 % | 71.4 % | 63.2 % | 25.3 % | 70.0 % | – |
| 0.80 | 81.6 % | 74.6 % | 60.9 % | 20.7 % | 70.0 % | – |
| 0.90 | 78.2 % | 73.5 % | 57.5 % | 20.7 % | 70.0 % | – |

## 3. Slices (Betriebspunkt)

**Sprache** – nutzbar korrekt / falsch akzeptiert (n)

| Sprache | n | keyword | gatekeeper | cascade |
|---|---:|---|---|---|
| de | 48 | 56.3 % / 6.3 % | 68.8 % / 27.1 % | 62.5 % / 25.0 % |
| en | 18 | 38.9 % / 11.1 % | 66.7 % / 27.8 % | 66.7 % / 33.3 % |
| fr | 9 | 0.0 % / 0.0 % | 33.3 % / 55.6 % | 44.4 % / 44.4 % |
| es | 10 | 30.0 % / 10.0 % | 70.0 % / 30.0 % | 60.0 % / 20.0 % |
| mixed | 2 | 0.0 % / 0.0 % | 100.0 % / 0.0 % | 50.0 % / 0.0 % |

**Tag** – nutzbar korrekt / falsch akzeptiert (n)

| Tag | n | keyword | gatekeeper | cascade |
|---|---:|---|---|---|
| canonical | 46 | 43.5 % / 8.7 % | 63.0 % / 32.6 % | 63.0 % / 30.4 % |
| (none) | 16 | 43.8 % / 12.5 % | 81.3 % / 6.3 % | 81.3 % / 12.5 % |
| short | 12 | 50.0 % / 0.0 % | 66.7 % / 33.3 % | 33.3 % / 16.7 % |
| frame | 3 | 66.7 % / 0.0 % | 100.0 % / 0.0 % | 100.0 % / 0.0 % |
| typo | 4 | 50.0 % / 0.0 % | 100.0 % / 0.0 % | 50.0 % / 0.0 % |
| slang | 4 | 50.0 % / 0.0 % | 25.0 % / 75.0 % | 0.0 % / 50.0 % |
| code-switch | 2 | 0.0 % / 0.0 % | 100.0 % / 0.0 % | 50.0 % / 0.0 % |
| near-miss | 8 | 25.0 % / 12.5 % | 37.5 % / 62.5 % | 37.5 % / 62.5 % |

**Gold-Kategorie** – nutzbar korrekt / falsch akzeptiert (n)

| Gold-Kategorie | n | keyword | gatekeeper | cascade |
|---|---:|---|---|---|
| content | 32 | 62.5 % / 0.0 % | 71.9 % / 21.9 % | 71.9 % / 21.9 % |
| organization | 30 | 33.3 % / 20.0 % | 66.7 % / 30.0 % | 60.0 % / 30.0 % |
| technical | 25 | 28.0 % / 0.0 % | 56.0 % / 40.0 % | 48.0 % / 32.0 % |

## 4. Kalibrierung der Konfidenz

**Gatekeeper (Naive Bayes, nur Schwelle)** – ECE 0.218

| Konfidenzbereich | n | mittlere Konfidenz | tatsächliche Acc. |
|---|---:|---:|---:|
| [0.00, 0.40) | 0 | – | – |
| [0.40, 0.55) | 4 | 0.519 | 50.0 % |
| [0.55, 0.70) | 8 | 0.621 | 25.0 % |
| [0.70, 0.85) | 12 | 0.771 | 50.0 % |
| [0.85, 1.00] | 63 | 0.979 | 77.8 % |

**Kaskade 1.3 (Gatekeeper + k-NN)** – ECE 0.236

| Konfidenzbereich | n | mittlere Konfidenz | tatsächliche Acc. |
|---|---:|---:|---:|
| [0.00, 0.40) | 0 | – | – |
| [0.40, 0.55) | 2 | 0.528 | 100.0 % |
| [0.55, 0.70) | 9 | 0.624 | 44.4 % |
| [0.70, 0.85) | 17 | 0.780 | 47.1 % |
| [0.85, 1.00] | 59 | 0.978 | 76.3 % |

## 5. Kontrollierte Variante: Transliteration

Seed und Keyword-Liste sind transliteriert. Gleiche Items, DE/mixed mit ä→ae usw.

| System | Nutzbar korrekt (orig → translit) | Falsch akzeptiert (orig → translit) | Macro-F1 (orig → translit) |
|---|---|---|---|
| Keyword-Baseline (regelbasiert) | 42.5 % → 42.5 % | 6.9 % → 8.0 % | 0.552 → 0.533 |
| Gatekeeper (Naive Bayes, nur Schwelle) | 65.5 % → 66.7 % | 29.9 % → 28.7 % | 0.677 → 0.689 |
| Kaskade 1.3 (Gatekeeper + k-NN) | 60.9 % → 62.1 % | 27.6 % → 26.4 % | 0.677 → 0.689 |

## 6. Laufzeit und Ressourcen

Kaltstart: Gatekeeper-Training 3.75 ms, k-NN-Prototypen 4.57 ms, Heap-Δ 60.9 MB, RSS-Δ 93.7 MB (inkl. Modulimport).

Warm, 20 Durchläufe × 97 Texte, ein Thread:

| System | p50 | p95 | p99 | max | Durchsatz/s |
|---|---:|---:|---:|---:|---:|
| Keyword-Baseline (regelbasiert) | 8 µs | 11 µs | 13 µs | 28 µs | 124.499 |
| Gatekeeper (Naive Bayes, nur Schwelle) | 16 µs | 24 µs | 60 µs | 667 µs | 55.727 |
| Kaskade 1.3 (Gatekeeper + k-NN) | 25 µs | 183 µs | 225 µs | 293 µs | 14.683 |

Produktions-Timeout je Job: 2000 ms (Queue/Worker-Overhead hier nicht gemessen).

## 7. Fehlerfälle (Betriebspunkt, Originalschreibung)

**Keyword-Baseline (regelbasiert)** – 7 sicher, aber falsch bzw. trotz Mehrdeutigkeit akzeptiert

| ID | Text | Gold | Vorhersage | Konfidenz |
|---|---|---|---|---:|
| R048 | Wo findet die Nachklausur statt, wieder im Audimax? | organization | content | 1.000 |
| R049 | Where is the resit exam being held? | organization | content | 1.000 |
| R053 | Dürfen wir in der Klausur eine Formelsammlung benutzen? | organization | content | 1.000 |
| R055 | Can we bring a cheat sheet to the exam? | organization | content | 1.000 |
| R056 | ¿Se puede usar calculadora en el examen? | organization | content | 1.000 |
| R064 | Wann kommt die Aufzeichnung von heute ins Moodle? | organization | technical | 1.000 |
| R109 | Danke, super erklärt! | – (unsicher erwartet) | content | 1.000 |

**Gatekeeper (Naive Bayes, nur Schwelle)** – 35 sicher, aber falsch bzw. trotz Mehrdeutigkeit akzeptiert

| ID | Text | Gold | Vorhersage | Konfidenz |
|---|---|---|---|---:|
| R003 | Could you walk us through another linear regression example? | content | technical | 0.655 |
| R009 | Muss ich den t-Test für die Prüfung können? | content | organization | 0.999 |
| R010 | Will hypothesis testing be on the final exam? | content | organization | 0.889 |
| R011 | ¿Entran los contrastes de hipótesis en el examen? | content | organization | 0.874 |
| R015 | Checkt jemand den p-Wert? Ich raff das nicht. | content | technical | 0.882 |
| R025 | Den Schritt von Zeile 2 auf Zeile 3 in der Herleitung auf Folie 17 verstehe ich nicht. | content | technical | 0.773 |
| R037 | What's the due date for problem set two? | organization | content | 0.791 |
| R038 | Quelle est la date de rendu de la deuxième feuille d'exercices ? | organization | content | 0.999 |
| R053 | Dürfen wir in der Klausur eine Formelsammlung benutzen? | organization | content | 0.951 |
| R054 | Ist ein Taschenrechner in der Prüfung erlaubt? | organization | technical | 0.727 |
| R061 | Le cours de jeudi prochain est maintenu ? | organization | content | 0.948 |
| R062 | ¿Hay clase el próximo jueves? | organization | content | 0.720 |
| R065 | Will the recording be uploaded afterwards? | organization | content | 0.984 |
| R067 | Est-ce que le cours est enregistré ? | organization | content | 0.985 |
| R069 | eduroam ist schon wieder komplett down | technical | content | 0.760 |
| R070 | The eduroam connection keeps dropping in here. | technical | content | 0.998 |
| R071 | El wifi del aula se cae todo el rato. | technical | content | 0.590 |
| R074 | Hinten versteht man Sie kaum, das Mikro ist zu leise. | technical | content | 0.879 |
| R077 | On n'entend rien au fond, le micro est trop faible. | technical | organization | 0.592 |
| R079 | Ton weg | technical | content | 0.638 |
| R080 | Der Beamer schneidet die rechte Hälfte der Folie ab. | technical | content | 0.649 |
| R081 | Die Projektion ist so blass, dass man die Formeln nicht lesen kann. | technical | content | 0.995 |
| R088 | Le vote ne s'affiche pas sur mon téléphone. | technical | organization | 0.728 |
| R097 | Ist die Formelsammlung im Moodle die aktuelle Version? | organization | technical | 0.580 |
| R100 | Die Aufzeichnung von letzter Woche bricht bei mir nach fünf Minuten ab. | technical | organization | 0.993 |
| R102 | Gibt es zu Kapitel 5 weiterführende Literatur? | content | organization | 0.992 |
| R103 | Gibt es dafür einen anderen Weg? | content (unsicher erwartet) | content | 0.567 |
| R104 | Kann man das nochmal hochladen? | organization (unsicher erwartet) | technical | 0.688 |
| R105 | Is this going to be on it? | content (unsicher erwartet) | organization | 0.939 |
| R106 | Klappt irgendwie nicht. | technical (unsicher erwartet) | technical | 0.918 |
| R107 | On peut décaler ? | organization (unsicher erwartet) | organization | 0.901 |
| R108 | Folie 17? | content (unsicher erwartet) | content | 0.759 |
| R109 | Danke, super erklärt! | – (unsicher erwartet) | content | 0.971 |
| R110 | lol | – (unsicher erwartet) | content | 0.685 |
| R112 | ¡Gracias! | – (unsicher erwartet) | organization | 0.570 |

**Kaskade 1.3 (Gatekeeper + k-NN)** – 27 sicher, aber falsch bzw. trotz Mehrdeutigkeit akzeptiert

| ID | Text | Gold | Vorhersage | Konfidenz |
|---|---|---|---|---:|
| R003 | Could you walk us through another linear regression example? | content | technical | 0.655 |
| R009 | Muss ich den t-Test für die Prüfung können? | content | organization | 0.999 |
| R010 | Will hypothesis testing be on the final exam? | content | organization | 0.889 |
| R011 | ¿Entran los contrastes de hipótesis en el examen? | content | organization | 0.874 |
| R015 | Checkt jemand den p-Wert? Ich raff das nicht. | content | technical | 0.882 |
| R025 | Den Schritt von Zeile 2 auf Zeile 3 in der Herleitung auf Folie 17 verstehe ich nicht. | content | technical | 0.773 |
| R037 | What's the due date for problem set two? | organization | content | 0.791 |
| R038 | Quelle est la date de rendu de la deuxième feuille d'exercices ? | organization | content | 0.999 |
| R053 | Dürfen wir in der Klausur eine Formelsammlung benutzen? | organization | content | 0.951 |
| R054 | Ist ein Taschenrechner in der Prüfung erlaubt? | organization | technical | 0.727 |
| R055 | Can we bring a cheat sheet to the exam? | organization | content | 0.800 |
| R061 | Le cours de jeudi prochain est maintenu ? | organization | content | 0.948 |
| R065 | Will the recording be uploaded afterwards? | organization | content | 0.984 |
| R067 | Est-ce que le cours est enregistré ? | organization | content | 0.985 |
| R069 | eduroam ist schon wieder komplett down | technical | content | 0.760 |
| R070 | The eduroam connection keeps dropping in here. | technical | content | 0.998 |
| R071 | El wifi del aula se cae todo el rato. | technical | content | 0.590 |
| R074 | Hinten versteht man Sie kaum, das Mikro ist zu leise. | technical | content | 0.879 |
| R080 | Der Beamer schneidet die rechte Hälfte der Folie ab. | technical | content | 0.649 |
| R081 | Die Projektion ist so blass, dass man die Formeln nicht lesen kann. | technical | content | 0.995 |
| R088 | Le vote ne s'affiche pas sur mon téléphone. | technical | organization | 0.728 |
| R097 | Ist die Formelsammlung im Moodle die aktuelle Version? | organization | technical | 0.800 |
| R100 | Die Aufzeichnung von letzter Woche bricht bei mir nach fünf Minuten ab. | technical | organization | 0.993 |
| R102 | Gibt es zu Kapitel 5 weiterführende Literatur? | content | organization | 0.992 |
| R103 | Gibt es dafür einen anderen Weg? | content (unsicher erwartet) | content | 0.600 |
| R105 | Is this going to be on it? | content (unsicher erwartet) | organization | 0.939 |
| R106 | Klappt irgendwie nicht. | technical (unsicher erwartet) | technical | 0.800 |

## Gültigkeitsgrenzen

- Synthetisches, kleines Referenzset (Bootstrap-Intervalle beachten); keine Aussage über reale Hörsaalverteilung.
- Konfidenz ist ohne Kalibrierung keine Erfolgswahrscheinlichkeit (siehe ECE).
- Gemessen ist die In-Process-Klassifikation, nicht Queue, Persistenz oder Worker-Latenz.
