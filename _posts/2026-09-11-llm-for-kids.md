---
layout: post
tag: ai
title: Sendung mit der Maus: LLM erklärt
subtitle: "Oder: Erklär mir mal KI, als wäre ich 5 Jahre alt"
date: 2026-09-11
author: eumel8
background: '/images/llm-lid.webp?4362984378'
twitter: 'images/blog-eumel-de.png?4362984378'
---

# Einstieg

KI hat sehr sehr viel mit Mathematik zutun. Und das in einem Mass, wie man es nicht auf der Baumschule gelernt hat. Etwa die Loss-Funktion:

<img src="/images/loss.png" />

Dazu gibt es Fachbegriffe zu Einrichtungen und Verfahren, die sich mittlerweile als "Allgemeinbildung" etabliert hat. Für Nerds.

Mein Vorgehen ist dann immer, die KI (sic!), in dem Fall ChatGPT, zu beauftragen, mir das so ui erklären, als wäre ich 5 Jahre alt.
Und das ist das Ergebnis, viel Spass

# Was ist LLM

🧸 Stell dir vor, wir bauen einen kleinen Papagei

Wir wollen einen kleinen Computer bauen, der gelernt hat, wie Sprache funktioniert.

Aber wir bringen ihm nicht bei:

„Das ist ein Hund.“
„Das ist ein Sofa.“
„2 + 2 = 4.“

Stattdessen machen wir etwas viel Einfacheres:

Wir zeigen ihm ganz viele Texte und lassen ihn immer raten, was als Nächstes kommt.

Zum Beispiel:

Wir sagen:

„Der Hund sitzt auf dem …“

Und der Computer sagt:

Sofa? 🛋️
Boden?
Tisch?
Dach?

Wenn im Trainingssatz steht:

„Der Hund sitzt auf dem Sofa.“

dann sagen wir:

„Richtig! Sofa!“

Und dann versuchen wir es wieder.

🧩 1. Zuerst müssen wir Sprache in kleine Stückchen zerlegen

Der Computer kann mit

Der Hund sitzt auf dem Sofa

nicht direkt etwas anfangen.

Also schneiden wir den Text in kleine Teile.

Der Artikel benutzt dafür im einfachen Beispiel sogar einzelne Buchstaben:

D e r   H u n d   s i t z t ...

Jeder Buchstabe bekommt eine Nummer:

D = 12
e = 5
r = 19
...

Das nennt man Tokenisierung.

Bei einem echten LLM macht man es schlauer. Dann kann beispielsweise

Donaudampfschifffahrtsgesellschaft

in mehrere Stückchen zerlegt werden.

Also ungefähr:

Donau | dampf | schiff | fahrts | gesellschaft

Das ist praktisch, weil das Modell nicht für jedes einzelne Wort einen eigenen Eintrag braucht.

🧸 2. Aber eine Nummer bedeutet noch gar nichts

Jetzt haben wir beispielsweise:

Hund = 137
Sofa = 82
sitzt = 421

Aber die 137 weiß natürlich nicht, dass sie „Hund“ bedeutet.

Das wäre so, als würden wir einem Kind sagen:

„Hund heißt ab jetzt 137.“

Das Kind könnte die Zahl zwar auswendig lernen, aber sie sagt ihm nichts.

Deshalb bekommt jedes Token einen kleinen Zahlenzettel mit vielen Zahlen drauf.

Zum Beispiel:

Hund → [0.12, -0.44, 0.03, 0.91, ...]
Sofa → [0.10, -0.40, 0.08, 0.87, ...]

Das nennt man Embedding.

Du kannst dir das wie einen großen Schrank mit Schubladen vorstellen:

          EMBEDDING-SCHRANK

Hund  ──────► 🗃️ [viele Zahlen]
Sofa  ──────► 🗃️ [viele Zahlen]
Katze ──────► 🗃️ [viele Zahlen]
Auto  ──────► 🗃️ [viele Zahlen]

Diese Zahlen werden nicht von einem Menschen eingetragen.

Das Modell lernt sie selbst.

👀 3. Jetzt kommt der wichtigste Trick: Attention

Und hier wird's interessant.

Nehmen wir:

„Der Hund sitzt auf dem Sofa.“

Wenn das Modell gerade über „sitzt“ nachdenkt, sind nicht alle anderen Wörter gleich wichtig.

Es sollte merken:

Der     🟡
Hund    🟢🟢🟢
sitzt   🔵
auf     🟡
dem     🟡
Sofa    🟢🟢

Also:

„Aha! Bei sitzt sind Hund und vielleicht Sofa besonders interessant.“

Das ist Attention.

👀👀 4. Warum Q, K und V?

Der Artikel schreibt:

Q = x Wq
K = x Wk
V = x Wv

Das sieht erstmal furchtbar aus.

Aber für ein 5-jähriges Kind können wir sagen:

Jedes Wort bekommt drei kleine Zettel:

🔎 Q = „Was suche ich?“

Der Hund sagt:

„Ich suche etwas, das mir hilft zu verstehen, was hier passiert.“

🏷️ K = „Was bin ich?“

Das Sofa sagt:

„Ich bin ein Ding, auf dem man sitzen kann.“

📦 V = „Welche Information gebe ich weiter?“

Das Sofa sagt:

„Hier ist meine Information.“

Dann vergleichen die Wörter ihre Zettel.

Wenn etwas gut zusammenpasst:

💡 „Hey, du bist wichtig für mich!“

bekommt dieses Wort mehr Aufmerksamkeit.

👨‍👩‍👧 5. Multi-Head Attention

Jetzt kommt ein genialer Trick.

Wir lassen nicht nur ein Kind aufpassen, sondern beispielsweise vier:

👧 Kopf 1 → achtet auf Personen
👦 Kopf 2 → achtet auf Beziehungen
👧 Kopf 3 → achtet auf Satzstruktur
👦 Kopf 4 → achtet auf andere Muster

Das sind die Attention Heads.

Alle schauen denselben Satz an, aber möglicherweise auf unterschiedliche Dinge.

Deshalb:

Multi-Head Attention

Also mehrere kleine „Aufmerksamkeits-Brillen“ gleichzeitig.

🚫 6. Das Modell darf nicht schummeln

Das ist extrem wichtig.

Wir wollen dem Modell beibringen:

„Der Hund sitzt auf dem Sofa.“

Wenn es gerade „sitzt“ vorhersagen soll, darf es nicht einfach hinten nachschauen:

Der Hund [sitzt] auf dem Sofa
              ↑
        darf nicht wissen,
        dass später Sofa kommt

Sonst wäre die Prüfung viel zu einfach.

Also bekommt es eine Art Scheuklappe:

Der       👀
Hund      👀 👀
sitzt     👀 👀 👀
auf       👀 👀 👀 👀
dem       👀 👀 👀 👀 👀

Es darf immer nur nach links, also in die Vergangenheit schauen.

Das nennt man:

Causal Masking.

🧠 7. Und dann kommt das eigentliche Lernen

Jetzt kommt der wichtigste Teil.

Das Modell sagt:

„Der Hund sitzt auf dem Tisch.“

Wir sagen:

❌ Falsch. Es war Sofa.

Das Modell bekommt dafür eine Fehlerzahl:

Fehler = 7.3

Beim nächsten Versuch:

„Der Hund sitzt auf dem Sofa.“

Vielleicht:

Fehler = 2.1

Dann verändert der Computer ganz viele kleine Zahlen in seinem Inneren.

Das sind die Parameter.

Und dann probiert er es wieder.

Und wieder.

Und wieder.

🔧 8. Backpropagation

Jetzt kommt ein Wort, das kompliziert klingt:

Backpropagation

Eigentlich bedeutet es nur:

„Finde heraus, welche kleinen Zahlen schuld daran waren, dass ich falsch geraten habe.“

Stell dir eine Maschine mit 1000 kleinen Drehknöpfen vor.

Sie sagt etwas Falsches.

Dann kommt jemand und sagt:

„Das war falsch.“

Die Maschine schaut:

Knopf 1   → ein bisschen ändern
Knopf 2   → fast nichts ändern
Knopf 3   → stark ändern
Knopf 4   → gar nicht ändern
...

Und dann probiert sie es erneut.

Das passiert sehr, sehr oft.

🔁 9. Und jetzt kommt der eigentliche Zauber

Der Artikel macht daraus:

Text
 ↓
Tokens
 ↓
Zahlen/Vektoren
 ↓
Transformer
 ↓
Attention
 ↓
Vorhersage
 ↓
Fehler berechnen
 ↓
Gewichte verändern
 ↓
wiederholen
 ↓
wiederholen
 ↓
wiederholen

Millionen oder Milliarden Male.

Und irgendwann ist das Modell ziemlich gut darin:

„Was kommt wahrscheinlich als Nächstes?“

🤯 10. Und jetzt kommt eine wichtige Überraschung

Das Modell hat keine Liste mit Antworten.

Es besitzt nicht einfach:

Frage: Was ist die Hauptstadt von Deutschland?
Antwort: Berlin

Stattdessen hat es sehr viele Zahlen:

Parameter 1
Parameter 2
Parameter 3
...
Parameter 1.000.000
Parameter 1.000.001
...

Diese Zahlen bilden gemeinsam ein riesiges mathematisches Netzwerk.

Das Netzwerk hat gelernt:

„Wenn diese Wörter hier stehen, sind diese anderen Wörter wahrscheinlich.“

🐕 Deshalb ist ein LLM kein Lexikon

Das ist eine der wichtigsten Aussagen des Artikels.

Wenn du fragst:

„Was sitzt auf dem Sofa?“

dann sucht das Modell nicht in einer Datenbank nach einem Sofa.

Es berechnet:

Was könnte jetzt sinnvollerweise kommen?

Deshalb kann ein LLM auch sehr überzeugend Quatsch erzählen.

Es denkt nicht:

„Moment, stimmt das wirklich?“

sondern eher:

„Welche Antwort passt sprachlich und statistisch am besten zu diesem Kontext?“

Der Artikel nennt deshalb auch RAG, Tools und Suchmaschinen als Ergänzungen, wenn aktuelle oder überprüfbare Fakten gebraucht werden.

🧸 11. Was baut der Artikel nun tatsächlich?

Das Schöne ist:

Der Autor baut tatsächlich ein winziges eigenes Sprachmodell.

Nicht ChatGPT.

Sondern eher:

🐣 Baby-LLM

Es bekommt nur diesen kleinen Text:

Der Hund sitzt auf dem Sofa.
Der Hund schläft auf dem Sofa.

Und dieser Text wird 200-mal wiederholt.

Das Modell hat:

96 Zahlen pro Embedding
3 Transformer-Schichten
4 Attention Heads
32 Zeichen Kontext
3000 Trainingsschritte

und läuft sogar auf einer CPU, wenn keine GPU vorhanden ist.

🐣 Was kann dieses Baby-LLM danach?

Wenn du ihm beispielsweise gibst:

D

kann es irgendwann etwas erzeugen wie:

Der Hund sitzt auf dem Sofa...

Aber jetzt kommt der wichtige Punkt:

Es hat nicht wirklich verstanden, was ein Hund ist.

Es hat gelernt:

Der → Hund
Hund → sitzt
sitzt → auf
auf → dem
dem → Sofa

und noch viele kompliziertere Zusammenhänge.

Es hat also gelernt:

„Welche Textstücke passen wahrscheinlich zusammen?“

🏭 Und jetzt skalieren wir das Ganze

Und hier wird aus dem kleinen Spielzeug plötzlich ein echtes LLM.

Statt:

2 Sätze

bekommen wir:

📚📚📚📚📚📚📚📚📚
sehr viele Texte

Statt:

96 Zahlen

haben wir:

Millionen / Milliarden Parameter

Statt:

3 Transformer-Blöcke

haben wir:

sehr viele Transformer-Blöcke

Und statt:

💻 CPU

kommen:

🖥️🖥️🖥️🖥️🖥️
viele GPUs
🚂 Und genau deshalb gefällt mir die Grundidee des Artikels

Der Artikel sagt im Grunde:

Ein modernes LLM ist weniger Magie, als es aussieht.

Ganz grob:

           VIEL TEXT
              │
              ▼
         Tokenisieren
              │
              ▼
        Zahlen/Vektoren
              │
              ▼
      ┌─────────────────┐
      │   TRANSFORMER   │
      │                 │
      │  👀 Attention   │
      │  🧠 MLP         │
      │  ➕ Residual    │
      └─────────────────┘
              │
              ▼
     „Was kommt als Nächstes?“
              │
              ▼
            Fehler
              │
              ▼
       Zahlen verändern
              │
              └───────🔄

Und diese Schleife ist das Herzstück.

🧠 Wenn du dir nur 5 Dinge merken willst

1. Token

Sprache wird in kleine Stücke zerlegt.

2. Embedding

Aus jedem Stück werden viele Zahlen.

3. Attention

Das Modell entscheidet, welche anderen Stücke gerade wichtig sind.

4. Loss + Backpropagation

„Das war falsch“ → Zahlen werden ein kleines bisschen verändert.

5. Wiederholen

Sehr, sehr, sehr oft.

Und daraus entsteht irgendwann etwas, das auf deine Frage antworten kann.

Und jetzt wird es für dich besonders interessant

Dein bisheriges Verständnis von Qwen, Llama, Ornith, Ollama usw. kannst du damit ziemlich gut einordnen:

Ollama lädt letztlich so einen riesigen Sack gelernter Zahlen auf deinen Rechner.

Das Modell ist bereits trainiert. Du musst also nicht mehr den ganzen Lernprozess durchführen.

Der Artikel zeigt dagegen:

„Was wäre, wenn wir den Sack mit Zahlen selbst herstellen?“

Und genau das macht das kleine PyTorch-Programm.

Der vielleicht wichtigste Satz des ganzen Artikels ist deshalb sinngemäß:

Ein LLM ist kein Textarchiv. Es ist ein neuronales Netz, das aus einem Kontext eine Wahrscheinlichkeitsverteilung für die nächste Fortsetzung berechnet.

