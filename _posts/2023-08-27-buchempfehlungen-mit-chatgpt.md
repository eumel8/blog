---
layout: post
tag: inet
title: Buchempfehlungen mit ChatGPT
subtitle: Noch immer steht die Frage, was lese ich als Nächstes. Fragen wir dazu jetzt ChatGPT
date: 2023-08-27
author: eumel8
---

# Es war einmal

Manche Dinge halten wirklich nicht für die Ewigkeit. Gerade mal 8 Jahre ist es her, dass ich mir auf Basis `AWSECommerceService` einen [Buchempfehlungs-Dienst](https://blog.eumel.de/2015/07/29/meine-buchempfehlungen-selbst-gebaut.html) selber gebaut habe. Warum? Weil es keinen gibt und die [Stadtbibliothek](https://www.onleihe.de/) nicht kann. Aber Amazon. Natürlich. Man kennt das aus der Shop-Seite: Wenn man einen Artikel betrachtet, gibt es immer noch Empfehlungen zu ähnlichen Artikeln. Als wenn man einen spannenden Thriller sucht, bietet es neben dem gesuchten auch noch eine ganze Liste ähnlicher Bücher an. Dieser Dienst war als `ResponseGroup Similarities` per API abrufbar und man konnte ihn für einen Buchempfehlungsdienst auf seiner eigenen Webseite verwenden. Konnte. Das lief auch zu gut, als wenn es ewig Bestand hätte. Vor 2-3 Jahren war dann diese API kostenpflichtig mit einem Mindesumsatz gekoppelt. Man hätte also jeden Monat dann auch für x Euro Bücher bei Amazon kaufen und etwa nicht bei der Onleihe ausleihen können. Wenn man bei Amazon kaufen kann, dann kann man gleich den Amazon-Dienst und dessen E-Book-Flatrate `kindle unlimited` nutzen. Kostet dann halt 12 Euro im Monat statt 8 Euro im Jahr wie bei der Onleihe. Und man muss den Kindle nutzen statt des Tolino.

# Empfehlungsdienste als solche

Gibt es nicht. Viele Onlineshops und Buchläden sitzen auf einen wahren Schatz von Daten, die sie nur wenig oder gar nicht nutzen. Okay, es gibt Listen von Bücher, die am häufigsten gekauft oder gelesen werden, aber diese Verknüpfung: Wer dieses Buch gelesen hat, liest auch dieses Buch. Das gibt es meistens nicht. Und wenn, dann ist die Umsetzung entweder grottenschlecht und man merkt, dass nur bestimmte Buchtitel gepuscht werden sollen, die meistens gar nicht zum Thema passen. Oder die Datenbasis ist zu dünn und es wird gar nix empfohlen. Letztlich soll das ganze auch noch per API erreichbar sein und da siehts dann ganz dünn aus. Entweder geht gar nix oder es wird nicht mehr angeboten, da der Aufwand zu hoch oder wegen Datenschutzbedenken. Sehr schade ist das zum Beispiel bei der Onleihe, die auf Teufel komm raus auf Datenhaltung verzichtet, etwa die Liste aller Bücher, die man schon mal gelesen hat.

# ChatGPT

ChatGPT von OpenAI gilt als der Durchbruch in Sachen Künstliche Intelligenz. Versuche dazu gibt es schon seit Jahren. Sei es etwa ein Übersetzungsprogramm wie Google Translate oder Deepl oder mehr oder weniger intelligente Chatbots wie Cognigy, ChatGPT hat sie alle überholt, quasi über Nacht. Die Bedienung ist denkbar einfach: Keine Software installieren, keine Programmiersprache lernen, kein Machine-Learning Model trainieren - einfach im Browser in einem Chatfenster seine Frage stellen oder sein Problem darstellen. ChatGPT findet darauf eine Antwort und wenn man die Antwort nicht lesen kann, ordnet man einfach "auf Deutsch" an und schon wird alles in 0,nix ins Deutsche übersetzt. Das begeistert sogar Leute, die bislang so rein gar nichts mit AI am Hut hatten. Wenn ich also frage: Nenn mir 10 ähnliche Thriller zu "Der Schwarm von Frank Schätzing", dann weiss dass ChatGPT sofort. Und nicht nur im Browser, auch per API kann ich die Antwort bekommen.

# API

API Token für ChatGPT gibts [hier](https://platform.openai.com/account/api-keys). Das Ganze ist nicht mehr ganz kostenfrei, aber die Abfragepreise sind minimal. Wenn man 1 Buch pro Woche liest, müsste man ChatGPT 4 mal im Monat etwas fragen.
Die [API Referenz](https://platform.openai.com/docs/api-reference) ist sehr gut dokumentiert und bietet die üblichen Programmiersprachen an. Unsere Webanwendung soll möglichst ohne PHP auskommen und ohne zusätzliche Middleware.

# Javascript

Client-seitiges Javascript erfüllt all unsere Belange. Als Web-Scriptsprache funktioniert das Internet nicht mehr ohne, es läuft quasi überall und brauch keine zusätzlichen Programme. Eine gute Ausgangsbasis habe ich [hier](https://github.com/Gutoneitzke/chatgpt-with-javascript) gefunden.

# Token

Die `index.html` hält neben der Eingabezeile für Buchtitel und Author eine kleine Überraschung bereit:

```html
  <div class="box-questions">
    <div class="header">
      <p>Frage ChatGPT nach alternativen Buchtiteln</p>
      <p><label><a href="https://platform.openai.com/account/api-keys">API Key: </a></label>
      <input type="text" id="api-key"</p>
      <script>
        var apiKey = document.getElementById("api-key"),
            storage_key = "chatgpttoken";
        apiKey.value = localStorage[storage_key];
      </script>
    </div>
    <p id="status"></p>
    <div id="history">
      <!-- Hier steht die History vom Chat -->
    </div>
    <div class="footer">
      <input type="text" id="message-input" placeholder="Buchtitel/Author..." oninput="sendMessage()">
    </div>
  </div>
```

Zur Benutzung der ChatGPT bedarf es eines API-Keys. Der ist zum Teil kostenpflichtig und zu 100% geheim. Im client-seitigem Javascript kann man ihn nicht "verstecken" und ohne weiteren Zugriffsschutz auf die Seite könnten erhebliche Kosten für den Eigentümer entstehen, wenn der Key uneingeschränkt benutzt werden darf. Deswegen muss jeder Benutzer seinen eigenen Key mitbringen, um den Dienst benutzen zu können. Da die Eingabe bei jedem Benutzen des Dienstes recht umständlich wäre, bedienen wir uns der schon bekannten HTML5-Technik und speichern den Key lokal beim Benutzer im Browser ab. Wem das zu unsicher ist, kann entweder den Feldinhalt oder den `script`-Aufruf dazu löschen. Dann muss man den Key immer wieder neu eingeben.

# Abfrage

Hier machen wir jetzt in der `main.js` die Abfrage:

```js

    fetch("https://api.openai.com/v1/completions",{
        method: 'POST',
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey.value}`,
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt: "10 alternative Bücher von " + message.value + " in deutsch als Liste mit Titel",
            max_tokens: 2048,
            temperature: 0.5
        })
    })
```

Die Parameter zu model kann man der API-Dokumentation entnehmen. Ausserdem reichern wir die Usereingabe mit weiteren Text an, um die Antwort in die richtige Richtung zu lenken.

# Antwort

Die Funktion `showHistory` beschäftigt sich mit dem Lebenszyklus des Chatfensters im Browser. Also das Darstellen unsere Frage an ChatGPT und dessen Antwort. Im Original-Code werden einfach Fliesstexte mit p-Absätzen ausgegeben. Wir haben das etwas angereichert:

```js
 chatResponse.className = 'response-message'

    myArray = response.split(/[0-9]. /);

    var myLinks = ""
    for (i = 1; i <= 10; i++) {
      myLinks = myLinks + "<a href=\"https://www.lovelybooks.de/suche/" + myArray[i] + "\">" + myArray[i] + "</a><br />";
    }
    chatResponse.innerHTML = myLinks

```

ChatGPT bildet üblichwerweise eine Liste, wenn wir sagen "nenn mir 10 Dinge von...", Die Antwort ist dann

1. ...
2. ...
3. ...

Wir splitten mit einer Regex den Text dort, nehmen den Rest der Antwort pro Zeile und bauen noch einen Link darum, damit man ihn anklicken kann. Am vielversprechensten scheint Lovelybooks zu sein, wo man dann hoffentlich zu diesem Treffer etwas findet.

An der Stelle könnte man zur Onleihe verweisen, aber dessen Sucheingabe ist abenteuerlich und an die jeweilige Ausleihe gebunden. Die Wahrscheinlichkeit ist auch nicht allzuhoch, dass es dort einen Treffer gibt, da nicht jedes Buch ausleihbar ist.

# Fazit

Die gute Nachricht an dieser Stelle: ChatGPT hat heute (2023) einen Datenbestand bis 2021. Neuere Bücher werden also (noch) nicht empohlen. Als Manko könnte man kritisieren, dass es keine weitere Eingabevalidierung gibt. Wenn der Nutzer also Müll eingibt, wird ChatGPT auch mit Müll antworten. Es wurde aber auch schon einmal beobachtet, dass ChatGPT selber Müll generiert, indem es einfach ISBN erfindet.

Das ganze Programm findet man auf dem Fork [https://github.com/eumel8/ebook-chatgpt/tree/ebook](https://github.com/eumel8/ebook-chatgpt/tree/ebook).

Viel Spass beim Stöbern.

# Nachtrag:

Das Eingabefeld in unserem Programm funktioniert ohne `form` tag und ist mit etwas Hokuspokus realisiert. In einer erste Programmversion wird sofort ChatGPT aufgerufen, beim ersten Buchstaben eintippen. Ist zwar rasend schnell, aber generiert Unfug. Für die älteren Mitbürger wurden dann waits eingeführt, indem die Funktion `waitMessage` statt `sendMessage` aufgerufen wird:

```js
function waitMessage(){
  var typingTimer;
  var myInput = document.getElementById('message-input');

  myInput.addEventListener('input', () => {
      clearTimeout(typingTimer);
      if (myInput.value) {
          typingTimer = setTimeout(sendMessage, 5000);
      }
  });
}
```

Der Nachteil: `sendMessage` wird nach der Wartezeit x mal eingetippte Zeichen aufgerufen, was jedes mal den POST Request an die ChatGPT API nebst Response triggert. Auch nicht so toll.

Es endete in diesem [Commit](https://github.com/eumel8/ebook-chatgpt/commit/d0ad5fddc4e819b9d634179a759f818d0d78985a), in dem man beherzt auf die Enter-Taste hauen muss, damit dann was passiert.
