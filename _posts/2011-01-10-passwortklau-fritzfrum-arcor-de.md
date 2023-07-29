---
layout: post
tag: general
title: Passwortklau fritzfrum@arcor.de
subtitle: "Das Boese ist immer und ueberall - das hat sich auch 2011 noch nicht geaendert.  Das wichtigste Gut in der heutigen Zeit ist die Information. Und wer diese Informationen besitzt. Bekannt geworden ist dieser Umstand gerade durch die US-Regierung und die&hellip;"
date: 2011-01-10
author: eumel8
---

<p>Das Boese ist immer und ueberall - das hat sich auch 2011 noch nicht geaendert.  Das wichtigste Gut in der heutigen Zeit ist die Information. Und wer diese Informationen besitzt. Bekannt geworden ist dieser Umstand gerade durch die US-Regierung und die Internetplattform<a href="http://de.wikipedia.org/wikileaks" target="_blank"> Wikileak</a>s, aber im <a href="http://relay.arcor-online.net/blog/blogs/pblog.php/2009/08/06/sicherheitshinweis-userhomepages" target="_blank">kleineren Rahmen </a>wurde schon mal drauf hingewiesen.</p>
<br/>
<p>Und das ist letztlich auch das was jeden interessiert: Wo sind <strong>meine</strong> Daten und <strong>wer</strong> stellt gerade etwas damit an. So ziemlich jeder, der im Internet unterwegs ist, hat auch einen Mailaccount. In DE wahrscheinlich bei einem der Freemailer GMX, web.de oder Arcor.de. Die Accountinformationen bestehen aus Mailadresse und Passwort, wobei aus der Mailadresse schon abgeleitet werden kann, zu welchem Diensteanbieter die Adresse gehoert, auf welchen Hosts ich mich also damit einloggen kann. Die gestandenen Mailprovider stehen im Internet gut da. Sie haben ein gutes Rating, was den Versand von Mail betrifft, sofern sie eine Antispam-Policy vertreten. Ansonsten haette der Dienst auch keine Kunden, wenn der Mailserver des Anbieters auf all moeglichen Blacklisten steht und so keine Mails los wird. Deswegen ist auch ein Freemail-Account wie fritzfrum@arcor.de bei Spammern sehr beliebt, denn wenn ich ueber die Infrastruktur eines Freemail-Providers Spam versenden kann, dann ist das allemal besser, als der Versand ueber Dialup oder bereits verschmutzte Hosts, also die die schon auf der <a href="http://www.spamhaus.org" target="_blank">Blackliste</a> stehen.</p>
<p>Wie komme ich als Spammer an so einen Freemail-Account? Selber registrieren, ja nee - is klar. Meist sind die IP-Adressbereiche aus dem Ausland zum Registrieren aber gesperrt und auch deutsche Proxyserver stehen auf einer Sperrliste. Neue Accounts duerfen vielleicht erst auch nicht so viele Mails versenden wie althergebrachte. Um an solche Accounts zu kommen, bedarf es auch wieder einer Masche, die sich Phishing nennt: Beim Surfen im Internet faengt man sich ueber eine unbekannte Webseite, ein Javascript versteckt in einem hidden iframe einen Virus ein. Wenn man Pech hat, wird sofort der ganze Rechner gescannt, katalogisiert, Software nachinstalliert und der Service in einem Botnet zur Verfuegung gestellt (also Cloud Computing vom Feinsten).  Andererseits werden "bloss" Config-Files vom Mailprogrammen nach Usernamen/Passwort-Kombinationen untersucht und die Daten in einer Dropbox gesammelt. Dort werden sie von einem anderen Bot abgeholt und weiter ausgewertet, katalogisiert und ggf. verkauft. Ramsch landet dann in Tauschboersen fuer Spammer und da hilft uns wieder<a href="http://www.google.de" target="_self"> Google</a> weiter. Die Tauschboersen sind meist Webforen, deren Inhalt von Googlebots indiziert wird und die Suchergebnisse der Suchmaschine zur Verfuegung stellt. So schliesst sich der Kreis: Ich kann bei Google nach meiner eigenen Mailadresse suchen und finde sie ggf. in solchen Tauschboersen.</p>
<p>Das kann man automatisieren:</p>
<ol>
<li>Ich verwende meine Mailadresse nicht regelmaessig in Webforen und im Internet. (Treffer zu fritzfrum@arcor.de sollten zum Beispiel nur zu diesem Blog verweisen.)</li>
<li>Ich brauche einen Google-Account fuer die Google Search API auf http://code.google.com/apis/customsearch/v1/overview.html</li>
<li>Ich generiere ueber den Key eine Suchabfrage nach meiner Mailadresse im atom-Format: </li>
</ol>
<blockquote>
<p> </p>
<p>https://www.googleapis.com/customsearch/v1?cx=013036536707430787589:_pqjad5hr1a&key=AIzaSyDtO5UG7z2Y_BGSVNyK8nsMr-zQSGNrNck&alt=atom&q=%22fritzfrum@arcor.de%22</p>
</blockquote>
<p>4. Fast fertig. Diese Adresse gebe ich als Abo eines neuen RSS-Feeds in meinem Mailprogramm oder Smartphone ein. Bis zu 100 Mal kann ich am Tag diesen String abfragen oder von meinem RSS-Reader pollen lassen. Im guenstigesten Fall ist das Ergebnis immer leer. Aber wenn meine Adresse irgendwo einmal auftaucht, wird sie frueher oder spaeter von Google gefunden und dann kann ich ggf. reagieren.</p>
