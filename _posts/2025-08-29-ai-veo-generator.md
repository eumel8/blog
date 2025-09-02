---
layout: post
tag: ai
title: AI VEO Generator
subtitle: Die KI filmt
date: 2025-08-29
author: eumel8
twitter: 'images/blog-eumel-de.png?4362984378'
---

# Einstieg

KI Dienste spriessen wie Pilze aus dem Boden. Bei diesem Sommer nicht verwunderlich. Leider gibt es auch schmackhafte und weniger schmackhafte. Am Schluss muss man alles wieder selber bauen.
 
# KI Videogenerierung

Die Text-to-Video Funktion haben schon einige KI-Dienste inne. Es gibt Kling AI, Sora von OpenAI, oder Veo von Google. Die Videos sind noch nicht sehr lang und es bedarf jede Menge Rechenleistung, um ansprechende Ergebnisse zu erzielen. Die Dienste bieten aber alle eine API an und so gibt es jeden Tag neue Dienste, die angeblich auch Videogenerierung anbieten. Meist auch gleich mit Preistabelle und Abo, nicht nur für PC sondern auch als App auf dem Handy. Ein krasses Beispiel der letzten Tage ist [Nano Banana](https://nanobanana.ai/), was suggiert, Videos mit dem nagelneuen AI-Model von Google zu generieren. Dabei werkelt "nur" Chat-GPT im Hintergrund und man hat sich nur den Namen von Google gegriffen. Ein anderer Dienst war [Veo AI](https://veo3.ai), das Starter-Paket beginnt mit 60 Dollar netto, man bekommt 8000 Token, die Generierung eines Videos verbraucht in der fast-track 250 Token, Videos mit mehr Details 1500 Token. Kann man sich ausrechnen, wieviel Videos man für den Preis generieren kann.

Interessant ist, dass die Webseiten alle gleich aufgebaut sind. Login geht meist schnell mit Google, ein Zahlungsdienstleister ist schnell angebunden und dann die üblichen Menüs mit einem Textfeld und dann soll ein Video generiert werden. Da man sonst keine eigene Infrastruktur hat, dauert das im Free-Mode ewig oder geht gar nicht, weil alle Plätze "busy" sind. Recht frustierend.

Mehrwert finden da nur Dienste, die Storylines anbieten wie [Fliki](https://app.fliki.ai/), da kann man also mehrere Videos zusammenpappen und eine Geschichte dazu erzählen lassen. Es gibt auch Templates für Marketing und Erklärvideos.

# Anwendungsfälle

Da sind wir schon mitten drin in den Anwendungsfällen. Wozu brauch man solche Videos, zumal sie nur 5-8 Sekunden lang sind. Längere kann man wahrscheinlich nicht bezahlen, oder man generiert die lokal etwa mit [ComfUI](https://www.comfy.org/).

Auf Youtube werden gerade massenweise KI-Videos verbreitet. Es handelt sich meist um sogenannte Shorts, Videos die maximal eine Minute lang sind, und Frohmut und Fröhlichkeit verbreiten sollen. Hier ein paar Beispiele:

<iframe width="560" height="315" src="https://www.youtube.com/embed/77kNk0IGuPg?si=SEH-NtjQ5A2uIdN2" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

# Kommadozeilen-Generator

Um jetzt auch solche Videos generieren zu lassen, skippen wir diese ganzen Middelware-Dienste, die nur alle extra Geld kosten und setzen uns direkt mit VEO auseinander. Die API Beschreibung finden wir in den [Google Docs](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation?hl=de), wie immer bei Google gleich mit Beispielaufrufen in curl dabei.  Zusammen mit der API-Beschreibung hat man schon einen guten Überblick, wie der Dienst funktioniert. 
Zusätzlich gibt es das [Vertex AI Studio](https://console.cloud.google.com/vertex-ai/studio/media?hl=de). Wie bei den Middelware-Diensten kann man sofort einen Textprompt eingeben und ein Video generieren lassen. Was man brauch ist nur ein Projekt in der [Google Cloud](https://console.cloud.google.com/), welches die Vertex AI API aktiviert hat und mit einem Zahlungskonto verbunden ist. 

Wenn diese Vorbedingungen erfüllt sind, können wir schon dieses Shell-Skript bedienen, am besten unter Ubuntu in der WSL:


<details>
<script src="https://gist.github.com/eumel8/5478dbac2ad8fc192c707e4325a0b037.js"></script>
</details>

Im Prinzip werden folgende Aufgaben umgesetzt:

* Projekt-ID des Google-Projekts eingeben (Hinweis: Die ID kann man beim Anlegen des Projekts editieren und so einen menschenlesbaren Namen verwenden, etwa: meinveo
* Prompt aufnehmen von der Benutzer-Eingabe
* POST Request zur Vertex API der Google Cloud zwecks Beauftragung der Videogenerierung vom Prompt
* Abfrage des Operation-Jobs
* Download des Videos wenn fertig

Fertig! Die Abrechnung erfolgt über unser Google Cloud Projekt. Die Preise dazu befinden sich [hier](https://cloud.google.com/vertex-ai/generative-ai/pricing?hl=de) und bewegen sich derzeit bei 0.75 $ pro Sekunde. Das 8 Sekunden Video kostet also 6 Dollar bzw. knapp 5,13 Euro. Jetzt könnte man meinen, das ist viel teurer als der veo3.ai Dienst. Die Lösung steckt natürlich im ausgewähltem Model. Bei generierten Videos mit der hohen Qualität kommt man bei veo3.ai auf 12 Euro, also das doppelte als bei Google. Wenn man das veo-3.0-fast-generate-001 Model verwendet, wird nur ein Video statt 4 in weniger hohen Qualität erzeugt,  was bei Google 3,20 Dollar kostet. Da die Rechnungsstellung in der Google Cloud immer einen Tag hinterherhinkt und die Preise sich ständig ändern, kann man vielleicht erst mal ein Video generieren lassen und am nächsten Tag schauen, was das gekostet hat. Es gibt auch in der Google Cloud die Möglichkeit, Budgets zu setzen im jeweiligen Rechnungskonto. Da ist man auch vor Leeräumen der Kreditkarte geschützt.

Viel Spass

<iframe width="560" height="315" src="https://www.youtube.com/embed/e2vqmJX3DcI?si=zFs9ky7wbPSwlvM5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

[Meine Youtube Playliste](https://www.youtube.com/playlist?list=PLBYczRi39Ez6L1HkefT7VYTeQ5Yw77e5f)
