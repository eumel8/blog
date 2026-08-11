---
layout: post
tag: ai
title: KI Video Studio mit OpenCode
subtitle: Die beste Video-Software ist da
date: 2026-08-11
author: eumel8
background: '/images/hollywood.jpg?4362984378'
twitter: 'images/blog-eumel-de.png?4362984378'
---

# Einstieg

Ich beschäftige mich wieder mehr mit Videobearbeitung. Vor Jahren hatte ich mit dem Youtube Maker Karaoke-Versionen von Musikvideos erstellt. Grosser Erfolg, grosser Aufwand.
Jetzt habe ich viel neues Videomaterial - durch die GoPro, DashCam, von den Livestreams des RTSP-Projekts. Und damit fangen die alten Probleme wieder an. Wie kann ich die Rohvideos verabeiten, um sie etwas aufzupeppen, ehe ich sie weiter veröffentliche? Ein Trauerspiel - auch durch mein eigenes Unvermögen.

# Videobearbeitungsprogramme

Ich bin kein Grafiker, hab keine Ahnung von Ästhetik und Design. Ich weiss nur, wenn etwas gut aussieht. Deswegen kam ich schon mit Grafikprogrammen nicht zurecht. Die Hauptfunktion von MS Paint, das Zurechtschneiden und Grössenänderungen von Bildern, wurde mittlerweile in andere Hilfsprogramme integriert. Ein wahrer Segen.

Bei Videoprogrammen ist es ähnlich. Neben dem schon erwähnten Youtube Maker habe ich noch unzählige andere probiert. 

## Samsung Studio

Ist beim Samsung-Laptop mit dabei. Eigentlich ganz nett, es hat einen Medienspeicher für Bilder und Videos. Die kann ich in ein Projekt ziehen und daraus ein Video erstellen. Mit der Schnittfunktion kommt man nur manchmal zurecht.

## OBS Studio

Eigentlich eine Streaming-Software für Twitch. Man kann sehr viele Quellen hinzufügen wie Kameras und Mikrofone, aber auch Videos und Bilder. Den Ton kann man von allen Kanälen mischen oder aus- und einschalten. Das Zielbild kann aus vielen Fenstern bestehen für die verschiedenen Quellen, die man dann zur Laufzeit (Aufnahme/Streaming) ein- und ausblenden kann. Sieht dann irgendwie so aus:

<iframe width="560" height="315" src="https://www.youtube.com/embed/OEHkSkyDurU?si=uI7_9j4y5gMNhfBc" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Davinci Resolve

Angeblich die beliebteste Software unter Streamern. Naja, mich hat der Funktionsumfang schon wieder überfordert. Das Aus war dann die stundenlange Suche nach einer Zeitrafferfunktion. Manchmal war sie da, dann wieder nicht, dann hat sie nur auf einen Teil des Videos gewirkt. Danke für das Zumüllen meiner Festplatte.

# Der Traum

Ich habe mein Videomaterial und eine ungefähre Vorstellung, was damit passieren soll. Das erzähl ich einfach irgendjemanden und kriege dann das fertige Video.

Gesagt, getan. Über [OpenCode](https://opencode.ai/) hatte ich schon gebloggt. Ich benutze es täglich und meist nur noch in der Art: Mach mal! Da muss nichts Besonderes eingestellt oder irgendwelche Prompts generiert werden. Man muss auch keine Software manuell andocken oder konfigurieren.

Tatsächlich war meine erste Idee: Hat das Davinci Resolve vielleicht eine API, die OpenCode ansprechen kann? Hat es tatsächlich! Aber nur in der Bezahlversion. Ansonsten kann es Scripts ausführen. Ich hab OpenCode so weit gebracht, dass er das Programm unter Linux starten und im Menü "Scripts" auswählen konnte. Die Scripts hat er selber erstellt. Hat nach längeren Versuchen nicht funktioniert bzw. dache ich mich: Was soll das alles?

# FFmpeg

[FFmpeg](https://www.ffmpeg.org/) ist sowas wie das Schweizer Taschenmesser für Videobearbeitung. Es kann Videos schneiden, analysieren, umwandeln, neu zusammensätzen, umformatieren, Ton trennen oder hinzufügen usw. Alles von der Kommandozeile. Also etwas für Geeks. Kennen Sie einen Geek? Ich schon: OpenCode.

# OpenCode & FFmpeg

Meine ersten Versuche waren vor Wochen mal GoPro-Dateien zu stabilisieren. So eine GoPro wackelt nun mal ziemlich hin und her, ist normal bei einer Actionkamera. Jetzt sollen die Zuschauer beim Zuschauen aber nicht seekrank werden. Deswegen tut GoPro die Videos stabilisieren. Bei den teuren Geräten geht das in der Kamera selber, bei den billigeren in der GoPro-Cloud (Abo). Jetzt wollte ich das Abo sparen und das selber stabilisieren. Es waren zwei lustige Basteltage, die dann noch 100 Euro Cloud-Rechenzeit gekostet hatten, weil ffmpeg die Rohvideos mehrmals prozessieren musste. Vom Ergebnis war es aber nicht so toll.

Anyway, mein neues Thema waren Zeitraffer (siehe oben). Ich starte OpenCode, verbinde mich mit einem LLM-Provider, der mitgebrachte ZEN reicht völlig. Und schreibe einfach in die Chatzeile:

```bash
kürze das Video im Zeitraffer auf 10 Minuten: C:\Users\eumel\Videos\langes-video.mp4 
```

Die KI wird ziemlich schnell mitbekommen, dass es um Videobearbeitung geht und schauen, ob ffmpeg installiert ist. Dazu hat es natürlich shell Access in der WSL und kann auch den Windows-Pfad problemlos umwandeln nach "/mnt/c/Users..."

Über die Metadaten der MP4-Dateien kriegt es die Länge des Videos mit. Es sind DashCam-Videos, jedes eine Minute lang, insgesamt 271 Stück, also 3-4 Stunden Spielzeit. Die einzelnen Dateien habe ich bereits vorher mit OpenCode zu einer Datei zusammenfügen lassen, geht dann unter der Haube auch mit ffmpeg. Der Rest ist etwas Mathematik: 3 Stunden Filmmaterial, sollen in 10 Minuten abgespielt werden, wie schnell müssen die Frames verkürzt werden, damit alles reinpasst? Mit diesem Faktor kann dann ffmpeg arbeiten und erstellt uns ein 10 Minuten Video. OpenCode wird dann noch fragen, ob es die CRC noch runterstrippen soll, um die Dateigrösse von 700 auf 300 MB runterzukriegen. 

Als nächsten Schritt besorgen wir uns etwas Gema-Freie Musik, legen das MP3 in denselben Ordner wie der Videokram und sagen dem OpenCode:

```bash
Leg mal als Tonspur das musik.mp3 drüber, im Loop mit 3s Fade am Anfang und Ende
```

Wieder leichtes Spiel für OpenCode.

Das Ergebnis sieht dann so aus:

<iframe width="560" height="315" src="https://www.youtube.com/embed/_CRFXEbMmdM?si=B-tZbctWEjkYjGfP" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Aber es geht auch noch komplizierter. Ich habe noch einen anderen Roadtrip gemacht und von Zwischenstationen Fotos gemacht. Dann hab ich noch Screenshots von Google-Map angefertigt, die ich zwischendrin einblenden will. Also ein Mischmasch aus Videos und Bildern. In den Zwischenstationen hab ich auch noch Videos gemacht, im 9:16 Format statt den 16:9 wie das andere Material. Die Screenshots haben eine willkürliche Grösse.
Und das erzähle ich alles dem OpenCode: Im Ordner sowieso liegen die Projekt-Dateien und das roadtrip.mp4, ein 10-Minuten DashCam-Zeitraffer-Video. Am Anfang will ich Bilder von meinem Startort einblenden, jedes Bild 2s, alle Bilder liegen im start-Ordner. Dann ab 03:16 habe ich eine Zwischenstation erreicht, füge Karte 2.png ein. Bei 04:17 eine weitere Zwischenstation, Karte 3.png und alle Bilder aus dem Ordner zwischenstation1. Die Bilder jeweils 2s gezeigt, nur die mp4 im Ordner in voller Länge und im Original-Format. Und so geht das dann weiter. Das Prompt geht über 10 Zeilen und OpenCode hat daran schon mal zu knobeln, was der dumme User da wieder will. Deswegen macht es Sinn, später einen Skill zu erstellen bzw. erstellen zu lassen, damit OpenCode das Verfahren lernt. Am Schluss soll natürlich wieder Musik als Tonspur drüber und hier ist das Ergebnis:

<iframe width="560" height="315" src="https://www.youtube.com/embed/rsQLWHlnuOs?si=aMc8YruvMeGZQAXE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Am Schluss blieben irgendwie immer paar Szenen übrig, die OpenCode dann mit drangeklatscht hat. Keine Ahnung, ich habs erst mal so gelassen, könnte man natürlich noch korrigieren lassen.

Dritter Auftrag: Ein Short vom Städtetrip. Das Video habe ich schon mit Samsung Studio erstellt, indem ich manuell die Bilder und Videos aneinandergeklatscht habe. Dabei habe ich natürlich nicht aufs Format geachtet, für OpenCode und ffmpeg natürlich auch kein Problem. Mit dem Kommando

```bash
ffmpeg -i input.mp4 -vf "select='gt(scene,0.3)',metadata=print:file=scenes.txt" -an -f null -
```

erkennt ffmpeg Szenenwechsel, also der Zeitpunkt, wann im Video immer eine andere Sequenz drankommt. Die Timestamps der Szenen schreibt er in eine Datei. Mit der Datei nimmt er dann das Video auseinander und schaut sich die Formate der einzelnen Sequenzen an. Mit so Kommandos wie

```bash
ffmpeg -ss <zeit> -i input.mp4 -frames:v 1 -f rawvideo -pix_fmt gray -
```

passt er die Szene dann an das Panorama-Format vom Ziel und fertig ist das [Short](https://youtube.com/shorts/mE1lSGxxY58)


# Weitere Ideen

Das mit den Karten-Screenshots ist natürlich Amateurliga. Meine Bilder und auch die DashCam-Videos haben alle Location-Metadata. Die könnte wahrscheimlich ffmpeg bzw. OpenCode auch auslesen und dann die ganze Fahrt auf einer eingeblendeten Karte einblenden, brauch man wahrscheinlich nur einen API-Key für Google-Maps.

# Fazit

Mit KI wird so vieles einfacher, auch so für mich unlösbaren Probleme wie Videobearbeitung. Ich weiss, manch einer schlägt vielleicht die Hände über den Kopf zusammen: Junge! Lass es einfach! Aber mir hats halt geholfen. Und wahnsinnig viel Zeit und Frust erspart.
