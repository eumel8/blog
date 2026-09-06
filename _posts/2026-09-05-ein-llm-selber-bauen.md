---
layout: post
tag: ai
title: Ein LLM selber bauen
subtitle: "Oder: Was aus StringTokenizer, MapReduce und ein paar Matrizen wird"
date: 2026-09-05
author: eumel8
---

# Einstieg

Im Januar 2011 haben wir uns hier mit MapReduce beschäftigt. Das Ziel war damals überschaubar: Nachrichten aus einer Newsgruppe holen, die Wörter zählen und aus vielen Logdateien eine Statistik erzeugen. Der Rechner musste dazu nicht verstehen, was ein Artikel bedeutet. Er musste nur zuverlässig Daten lesen, sortieren, gruppieren und addieren.

Damals klangen Hadoop, HDFS und Pig nach einer ziemlich großen Sache. Heute stehen ähnliche Begriffe wieder auf dem Tisch, nur ist aus der Logdatei ein Textkorpus geworden und aus dem Zählen von Wörtern ein Modell, das eine Wahrscheinlichkeit für das nächste Wort berechnet. Der grundlegende Gedanke ist aber erstaunlich ähnlich geblieben: Viele Daten werden in kleine Einheiten zerlegt, verarbeitet und anschließend wieder zusammengeführt.

Der Unterschied ist, dass wir diesmal nicht nur eine Statistik ausrechnen. Wir bauen eine Funktion, die aus einer Folge von Textstücken das wahrscheinlich nächste Textstück vorhersagt. Diese Funktion nennen wir, wenn sie groß genug ist, Large Language Model, kurz LLM.

Ein eigenes Modell muss dabei nicht mit ChatGPT konkurrieren. Im Gegenteil: Ein kleines Modell mit wenigen Millionen Parametern ist langsam, vergesslich und meistens ziemlich langweilig. Dafür kann man an ihm jeden einzelnen Verarbeitungsschritt beobachten. Genau wie beim MapReduce-Lab von 2011 ist das Ziel also nicht der produktive Großbetrieb, sondern das Verständnis.

# Das Ziel: das nächste Token vorhersagen

Ein Sprachmodell bekommt eine Folge von Token und soll die Wahrscheinlichkeit des nächsten Tokens berechnen:

<pre>
Der Hund sitzt auf dem
</pre>

Die möglichen Fortsetzungen könnten `Sofa`, `Boden`, `Stuhl` oder `Dach` sein. Das Modell gibt für jedes Token im Wörterbuch eine Zahl aus. Nach der Umrechnung in Wahrscheinlichkeiten könnte das ungefähr so aussehen:

<pre>
Sofa       0.42
Boden      0.21
Stuhl      0.15
Dach       0.01
andere     0.21
</pre>

Beim Training kennen wir die richtige Fortsetzung. Aus dem Satz „Der Hund sitzt auf dem Sofa“ erzeugen wir deshalb viele Trainingsbeispiele:

<pre>
Eingabe: Der                         Ziel: Hund
Eingabe: Der Hund                    Ziel: sitzt
Eingabe: Der Hund sitzt              Ziel: auf
Eingabe: Der Hund sitzt auf          Ziel: dem
Eingabe: Der Hund sitzt auf dem      Ziel: Sofa
</pre>

Das ist der entscheidende Trick. Wir benötigen keine manuell markierten Fragen und Antworten. Ein ausreichend großer Text liefert sein Trainingssignal selbst. Das Modell lernt zunächst keine Faktenliste und auch keine Grammatikregeln. Es verändert seine Parameter so, dass die Wahrscheinlichkeit des jeweils tatsächlich folgenden Tokens größer wird.

# Vom StringTokenizer zum modernen Tokenizer

2011 war der `StringTokenizer` ein guter Freund. Eine Zeile wurde an Leerzeichen zerlegt, und aus den Wörtern entstanden Zählwerte. Für ein LLM ist die Frage „Was ist ein Wort?“ allerdings komplizierter.

`Donaudampfschifffahrtsgesellschaftskapitän` ist im Deutschen ein Wort, aber selten genug, dass es nicht unbedingt einen eigenen Eintrag im Wörterbuch braucht. Gleichzeitig kommen URLs, Zahlen, Quellcode und Tippfehler vor. Ein LLM braucht daher keinen reinen Wort-Tokenizer, sondern zerlegt Text in häufige Teilstücke.

Ein übliches Verfahren ist Byte Pair Encoding, kurz BPE. Häufig benachbarte Zeichenfolgen werden dabei schrittweise zu einem Token zusammengefasst. Aus `Tokenisierung` könnte beispielsweise eine Folge wie diese werden:

<pre>
Token | is | ier | ung
</pre>

Das tatsächliche Ergebnis hängt vom trainierten Vokabular ab. Wichtig ist nur: Jedes Token bekommt eine Ganzzahl. Diese Ganzzahl ist kein Bedeutungswert, sondern zunächst nur ein Schlüssel in einer Tabelle.

Ein minimalistischer Tokenizer für unser Lab kann zunächst auf Zeichenebene arbeiten:

<pre>
text = "Der Hund sitzt auf dem Sofa."
vocab = sorted(set(text))
stoi = {zeichen: nummer for nummer, zeichen in enumerate(vocab)}
itos = {nummer: zeichen for zeichen, nummer in stoi.items()}

ids = [stoi[zeichen] for zeichen in text]
print(ids)
print("".join(itos[i] for i in ids))
</pre>

Das ist kein guter Tokenizer für ein großes Modell, aber ein hervorragendes Lab. Wir können auf diese Weise jedes Zeichen wiederfinden und müssen keine zusätzliche Bibliothek installieren. Ein echtes Modell verwendet meist Byte-Level-BPE oder eine ähnliche Subword-Strategie und besitzt ein Vokabular von mehreren zehntausend Token.

# Embeddings: aus IDs werden Vektoren

Die Zahl `137` enthält noch keine sprachliche Information. Deshalb folgt auf den Tokenizer eine Embedding-Tabelle. Für jedes Token existiert ein Vektor mit beispielsweise 128 oder 768 Gleitkommazahlen.

<pre>
Embedding[137] = [ 0.12, -0.44, 0.03, ... ]
</pre>

Diese Werte werden während des Trainings gelernt. Am Anfang sind sie zufällig. Nach vielen Trainingsschritten liegen ähnliche Token nicht zwangsläufig in einem menschlich beschrifteten Bedeutungsraum, aber das Modell kann darin nützliche Beziehungen ablegen. Die Embedding-Tabelle ist eine Matrix der Größe `Vokabular x Modellbreite`.

Ein Transformer verarbeitet außerdem nicht nur die Bedeutung eines Tokens, sondern dessen Position. Ohne Positionsinformation wären die Folgen „Der Hund beißt den Mann“ und „Den Mann beißt der Hund“ für die reine Aufmerksamkeit schwer auseinanderzuhalten. Moderne Modelle verwenden dafür zum Beispiel RoPE, also Rotary Positional Embeddings. Im kleinen Lab genügt eine gelernte Positionstabelle:

<pre>
token_embedding = TokenEmbedding(vocab_size, n_embd)
position_embedding = PositionEmbedding(block_size, n_embd)
x = token_embedding(token_ids) + position_embedding(position_ids)
</pre>

# Der Transformer

Der Transformer wurde 2017 im Paper „Attention Is All You Need“ beschrieben. Im Gegensatz zu einem rekurrenten Netz muss er nicht Token für Token durch einen versteckten Zustand laufen. Er kann die gesamte Eingabesequenz in einem Schritt als Matrix verarbeiten. Das ist auf GPUs sehr gut parallelisierbar.

Ein Decoder-Block, wie ihn GPT-Modelle verwenden, besteht im Wesentlichen aus vier Teilen:

1. Masked Multi-Head Self-Attention
2. Residual-Verbindung und LayerNorm
3. Feed-Forward-Netz
4. Eine weitere Residual-Verbindung und LayerNorm

Viele dieser Blöcke werden hintereinander gestapelt. Ein kleines Modell hat vielleicht vier Blöcke, GPT-2 Small hatte zwölf und große aktuelle Modelle sehr viel mehr.

## Self-Attention mit Query, Key und Value

Für jeden Eingabevektor `x` berechnen wir drei neue Vektoren:

<pre>
Q = x Wq
K = x Wk
V = x Wv
</pre>

`Q` ist die Frage, wonach dieses Token sucht. `K` beschreibt, welche Information ein Token anbietet. `V` ist die eigentliche Information, die bei einem Treffer weitergegeben wird.

Für alle Positionen berechnen wir zunächst die Ähnlichkeit zwischen Queries und Keys:

<pre>
Scores = Q K^T / sqrt(d_k)
</pre>

Die Division durch die Quadratwurzel der Key-Dimension verhindert, dass die Werte bei großen Vektoren zu stark anwachsen. Danach folgt Softmax. Aus den Scores werden Gewichte, deren Summe pro Zeile eins ist:

<pre>
Gewichte = softmax(Scores)
Ausgabe   = Gewichte V
</pre>

Das Token „sitzt“ kann dadurch lernen, auf „Hund“ und „Sofa“ zu achten. In einem anderen Kopf kann es um die Satzposition, ein Pronomen oder eine Klammer in Quellcode gehen. Multi-Head bedeutet, dass mehrere solcher Aufmerksamkeitsberechnungen parallel mit eigenen Matrizen stattfinden. Ihre Ergebnisse werden zusammengefügt und über eine weitere Matrix gemischt.

## Causal Masking

Beim Training liegt der komplette Satz vor. Das Modell darf bei der Vorhersage von „sitzt“ aber nicht bereits das spätere „Sofa“ lesen. Sonst wäre die Aufgabe geschummelt.

Dafür setzen wir die Attention-Scores oberhalb der Diagonalen auf minus unendlich. Die Softmax macht daraus Gewicht null:

<pre>
1  0  0  0
1  1  0  0
1  1  1  0
1  1  1  1
</pre>

Diese kausale Maske ist der Grund, warum das Modell während des Trainings parallel alle Positionen berechnen kann und bei der Erzeugung trotzdem nur in die Vergangenheit schaut.

## Feed-Forward und Residual Stream

Nach der Aufmerksamkeit wird jeder Positionsvektor einzeln durch ein kleines Feed-Forward-Netz geschickt. Typischerweise wird die Dimension zunächst vervierfacht, eine GELU-Aktivierung angewendet und anschließend wieder auf die Modellbreite reduziert:

<pre>
MLP(x) = W2 GELU(W1 x + b1) + b2
</pre>

Die Attention mischt Informationen zwischen Positionen. Das Feed-Forward-Netz verarbeitet die Information an einer Position und kann darin komplizierte Muster speichern.

Um viele Transformer-Blöcke trainierbar zu halten, wird die Eingabe nicht einfach ersetzt, sondern addiert:

<pre>
x = x + Attention(LayerNorm(x))
x = x + MLP(LayerNorm(x))
</pre>

Dieser sogenannte Residual Stream ist eine Art gemeinsamer Datenkanal durch das gesamte Modell. Jeder Block kann Informationen hinzufügen, ohne die bisherige Darstellung vollständig zerstören zu müssen.

# Die Ausgabe: Logits und Loss

Nach dem letzten Transformer-Block besitzt jedes Eingabetoken einen Vektor. Für die nächste Token-Vorhersage wird dieser über eine lineare Schicht auf die Vokabulargröße projiziert. Das Ergebnis heißt Logits.

<pre>
logits = hidden @ W_vocab
wahrscheinlichkeiten = softmax(logits)
</pre>

Die Differenz zwischen Vorhersage und tatsächlich vorhandenem nächsten Token wird mit der Cross-Entropy-Loss gemessen. Hat das Modell dem richtigen Token eine hohe Wahrscheinlichkeit gegeben, ist der Fehler klein. Hat es `Sofa` fast ausgeschlossen, ist der Fehler groß.

Der Optimierer berechnet über Backpropagation, wie jede einzelne Modellzahl verändert werden muss. In der Praxis wird häufig AdamW verwendet. Ein Trainingsschritt sieht vereinfacht so aus:

<pre>
logits = model(x)
loss = cross_entropy(logits, ziel)
loss.backward()
optimizer.step()
optimizer.zero_grad()
</pre>

Das wiederholt sich millionen- oder milliardenfach. MapReduce würde Zwischenergebnisse aus vielen Rechnern zusammenführen. Beim verteilten Deep Learning berechnen viele GPUs jeweils Gradienten für ihre Mini-Batches und synchronisieren anschließend die Parameter oder Gradienten. Das Prinzip der parallelen Datenverarbeitung ist also noch da, nur die Reduce-Operation besteht jetzt aus Gleitkomma-Addition statt aus `COUNT` und `SUM`.

# Das kleine Lab

Für das Lab verwenden wir PyTorch und ein winziges Zeichenmodell. Der Text ist absichtlich klein. Das Modell soll nicht die deutsche Sprache neu erfinden, sondern an einem überschaubaren Beispiel zeigen, wie Daten, Modell, Loss und Generierung zusammenhängen.

Installation:

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install torch
```

Die Datei `mini_llm.py` kann so aussehen:

```python
import torch
from torch import nn
from torch.nn import functional as F

text = "Der Hund sitzt auf dem Sofa. Der Hund schläft auf dem Sofa. " * 200
chars = sorted(set(text))
stoi = {ch: i for i, ch in enumerate(chars)}
itos = {i: ch for ch, i in stoi.items()}
data = torch.tensor([stoi[ch] for ch in text], dtype=torch.long)

block_size = 32
batch_size = 16
device = "cuda" if torch.cuda.is_available() else "cpu"

def batch():
    start = torch.randint(len(data) - block_size - 1, (batch_size,))
    x = torch.stack([data[i:i + block_size] for i in start])
    y = torch.stack([data[i + 1:i + block_size + 1] for i in start])
    return x.to(device), y.to(device)

class MiniLLM(nn.Module):
    def __init__(self):
        super().__init__()
        n = len(chars)
        self.token = nn.Embedding(n, 96)
        self.position = nn.Embedding(block_size, 96)
        layer = nn.TransformerEncoderLayer(
            d_model=96, nhead=4, dim_feedforward=384,
            dropout=0.0, batch_first=True, activation="gelu"
        )
        self.blocks = nn.TransformerEncoder(layer, num_layers=3)
        self.norm = nn.LayerNorm(96)
        self.head = nn.Linear(96, n)

    def forward(self, x, targets=None):
        positions = torch.arange(x.size(1), device=x.device)
        h = self.token(x) + self.position(positions)[None, :, :]
        mask = torch.triu(
            torch.ones(x.size(1), x.size(1), device=x.device), diagonal=1
        ).bool()
        h = self.blocks(h, mask=mask)
        logits = self.head(self.norm(h))
        loss = None
        if targets is not None:
            loss = F.cross_entropy(logits.reshape(-1, logits.size(-1)),
                                   targets.reshape(-1))
        return logits, loss

    @torch.no_grad()
    def generate(self, x, count):
        for _ in range(count):
            context = x[:, -block_size:]
            logits, _ = self(context)
            probabilities = F.softmax(logits[:, -1, :], dim=-1)
            next_token = torch.multinomial(probabilities, 1)
            x = torch.cat((x, next_token), dim=1)
        return x

model = MiniLLM().to(device)
optimizer = torch.optim.AdamW(model.parameters(), lr=3e-3)

for step in range(3000):
    x, y = batch()
    _, loss = model(x, y)
    optimizer.zero_grad(set_to_none=True)
    loss.backward()
    optimizer.step()
    if step % 300 == 0:
        print(step, float(loss))

start = torch.tensor([[stoi["D"]]], device=device)
result = model.generate(start, 120)[0].tolist()
print("".join(itos[i] for i in result))
```

Der Code enthält bereits alle wesentlichen Zutaten: Token-IDs, Token- und Positions-Embeddings, mehrere Transformer-Blöcke, kausale Maske, Linearschicht, Cross-Entropy, Backpropagation und autoregressive Generierung.

Die Ausgabe wird zunächst nicht besonders intelligent sein. Nach ausreichendem Training sollte das Modell aber Wörter und Satzfragmente erzeugen, die im Trainingsmaterial vorkommen. Das ist kein Zufall und auch kein Beweis für Verständnis. Es hat die Wahrscheinlichkeitsverteilung des kleinen Korpus auswendig gelernt.

Ein Hinweis zum PyTorch-Lab: Je nach installierter PyTorch-Version kann `TransformerEncoder` bei der Maskenübergabe eine Warnung ausgeben. Das ist für das Experiment nicht kritisch. In einer eigenen Implementierung würde man die Attention-Schicht direkt schreiben und die Form der Maske selbst kontrollieren.

# Vom Lab zum echten Modell

Mit dem Beispiel oben bauen wir ein Sprachmodell, aber noch kein nützliches LLM. Dafür fehlen vor allem Daten, Rechenleistung und sorgfältige Datenaufbereitung.

## Daten

Ein Modell kann nur Muster lernen, die in den Daten vorhanden sind. Vor dem Training müssen Texte gesammelt, vereinheitlicht und dedupliziert werden. HTML-Navigation, Spam, kaputte Zeichenkodierungen und private Daten gehören nicht ungeprüft in den Datensatz. Auch rechtliche Fragen sind Teil des Trainings: „Im Internet gefunden“ bedeutet nicht automatisch „für jedes Training freigegeben“.

## Skalierung

Die wichtigsten Größen sind Modellbreite, Anzahl der Blöcke, Anzahl der Attention-Heads, Kontextlänge und Batch-Größe. Verdoppelt man die Breite, wachsen viele Matrizen und damit Speicherbedarf und Rechenzeit. Die Attention selbst wird bei einer Sequenzlänge `T` ungefähr quadratisch teuer, weil jede Position mit jeder anderen Position verglichen wird.

## Training

Ein realistischer Trainingslauf benötigt Checkpoints, Monitoring, Validierungsdaten und einen reproduzierbaren Datenloader. Die Trainings-Loss allein reicht nicht aus. Ein Modell kann den Trainingskorpus auswendig lernen und bei unbekannten Texten trotzdem schlecht sein. Deshalb wird ein Teil der Daten zurückgehalten und nur zur Bewertung verwendet.

## Fine-Tuning und Chatverhalten

Ein vortrainiertes Modell kann anschließend auf Anweisungs-Antwort-Paare feinjustiert werden. Erst dadurch entsteht das Verhalten, das wir von einem Chatbot erwarten. Vortraining bedeutet im Wesentlichen „Text fortsetzen“. Ein hilfreicher Assistent benötigt zusätzlich Daten für gewünschtes Verhalten, Sicherheitsregeln und häufig eine Präferenzoptimierung.

# Was bedeutet „Verstehen“?

Unser kleines Modell kann nach dem Training wahrscheinlich „Der Hund sitzt auf dem Sofa“ erzeugen. Dabei besitzt es kein inneres Bild eines Hundes und keine Datenbank mit einem Sofa. Es hat Parameter so angepasst, dass bestimmte Zeichenfolgen aufeinander folgen.

Bei großen Modellen entstehen aus dieser Optimierung allerdings interne Darstellungen, die sehr viel strukturierter sind. Das Modell kann Beziehungen zwischen Wörtern, Satzmustern, Programmiersprachen und Themen abbilden. Ob man das bereits Verstehen nennt, ist eine philosophische Frage. Technisch sicher ist nur: Ein LLM ist kein Textarchiv, sondern ein neuronales Netz, das aus einem Kontext eine Verteilung über mögliche Fortsetzungen berechnet.

Auch deshalb kann ein LLM überzeugend klingende falsche Antworten erzeugen. Eine hohe Wahrscheinlichkeit ist kein Wahrheitsbeweis. Das Modell optimiert Textfortsetzung, nicht die Verbindung zu einer Datenbank der Realität. Für aktuelle oder überprüfbare Informationen braucht man zusätzliche Quellen, beispielsweise Retrieval-Augmented Generation, Werkzeuge oder eine Suchmaschine.

# Fazit

Der Weg von 2011 zu heute ist weniger mystisch, als die Benutzeroberflächen vermuten lassen. Damals haben wir Daten aus Dateien gelesen, mit einem Tokenizer zerlegt, gruppiert und Statistiken erzeugt. Heute zerlegen wir Text in Token, wandeln sie in Vektoren um und schicken diese durch viele Matrixmultiplikationen.

Der große Unterschied liegt in der trainierten Funktion. Ein MapReduce-Job liefert ein berechnetes Ergebnis. Ein LLM speichert die Regeln seiner Vorhersage verteilt in Millionen oder Milliarden Parametern. Der Transformer sorgt mit Self-Attention dafür, dass jedes Token den relevanten Kontext verwenden kann. Der Loss sagt dem Modell, ob die Vorhersage besser werden muss. Backpropagation und ein Optimierer verändern daraufhin die Parameter.

Für den Einstieg reichen ein kleiner Text, eine CPU und ein paar hundert Zeilen Python. Wer danach auf GPU, BPE-Tokenizer, größere Korpora und verteiltes Training umsteigt, erkennt die alten Muster wieder: Daten vorbereiten, Arbeit verteilen, Zwischenstände speichern, Ergebnisse prüfen. Nur dass statt der Pageviews diesmal die nächste Textstelle vorhergesagt wird.

# Links

* [1] [https://arxiv.org/abs/1706.03762 - Attention Is All You Need](https://arxiv.org/abs/1706.03762)
* [2] [https://openai.com/research/language-unsupervised - Language Models are Unsupervised Multitask Learners](https://openai.com/research/language-unsupervised)
* [3] [https://pytorch.org/docs/stable/generated/torch.nn.TransformerEncoder.html - PyTorch TransformerEncoder](https://pytorch.org/docs/stable/generated/torch.nn.TransformerEncoder.html)
* [4] [https://github.com/karpathy/nanoGPT - Ein kleines GPT-Trainingsprojekt](https://github.com/karpathy/nanoGPT)
* [5] [https://github.com/karpathy/makemore - Zeichenbasierte Sprachmodelle zum Lernen](https://github.com/karpathy/makemore)
* [6] [https://huggingface.co/docs/tokenizers - Tokenizer-Dokumentation](https://huggingface.co/docs/tokenizers)
* [7] [https://arxiv.org/abs/2005.14165 - Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165)

# Begriffserklärungen

* **LLM** - Large Language Model, ein großes neuronales Sprachmodell.
* **Token** - Ein vom Tokenizer erzeugtes Textstück, zum Beispiel ein Zeichen, ein Wortteil oder ein ganzes Wort.
* **Embedding** - Ein gelernter Vektor, der ein Token oder eine Position im Modell darstellt.
* **Transformer** - Architektur mit Attention, Feed-Forward-Netzen und Residual-Verbindungen.
* **Attention** - Berechnung, mit der ein Token relevante andere Positionen gewichtet.
* **Logit** - Unnormalisierter Ausgabewert für ein mögliches nächstes Token.
* **Softmax** - Funktion, die Logits in eine Wahrscheinlichkeitsverteilung umwandelt.
* **Cross-Entropy** - Fehlermaß für die Abweichung zwischen vorhergesagter und tatsächlicher Tokenverteilung.
* **Causal Mask** - Maske, die verhindert, dass ein Token bei der Vorhersage in die Zukunft schaut.
* **Parameter** - Trainierbare Zahlen im neuronalen Netz, beispielsweise Gewichte von Matrizen.
* **Fine-Tuning** - Nachtraining eines vortrainierten Modells auf einem speziellen Datensatz oder Verhalten.
* **RAG** - Retrieval-Augmented Generation, die Ergänzung eines Sprachmodells durch zur Laufzeit gesuchte Dokumente.
