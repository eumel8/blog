---
layout: post
tag: general
title: Joomla Update 2.5.irgendwas
subtitle: "Der typische Spruch heisst ja immer: Die Welt draussen dreht sich weiter. Und so musste ich eines Tages feststellen, dass das Content Management System der Homepage nicht nur alt sondern auch sehr veraltet ist. Sicherheitstechnisch sicher fragwuerdig, a&hellip;"
date: 2012-06-24
author: eumel8
---

Der typische Spruch heisst ja immer: Die Welt draussen dreht sich weiter. Und so musste ich eines Tages feststellen, dass das Content Management System der Homepage nicht nur alt sondern auch sehr veraltet ist. Sicherheitstechnisch sicher fragwuerdig, andererseits sind manche Sachen einfach mal so fertig und muessen nicht staendig upgedatet werden. 
<br/>
Aber jetzt solls mal so sein. Joomla wird von 1.0.15 auf 2.5.6 upgedatet. Wie geht.

1. Wir sichern uns die komplette Datenbank und das htdocs-Verzeichnis komplett. 
2. Wir loggen uns im Administrationsbereich ein und notieren uns den Namen des verwendeten Templates z.B. myflower und nachtraeglich installierte Module und Komponenten. Auch der Datenbank-Connectstring sowie table-praefix sollten bekannt sein sowie eventuell FTP-Daten falls vorhanden.
3. Wir suchen nach neueren Versionen der sogenannten 3th Party Software. Wenns unser Lieblingstemplate nicht mehr gibt, muessen wir uns ein neues suchen - oder wir versuchen das alte. Genauso ist es mit den Modulen und Komponenten.
4. Wir installieren das <a href="http://joomlacode.org/gf/download/frsrelease/10646/41924/migrator.zip">Migrator-Plugin</a>. Damit koennen wir Joomla auf 1.5 migrieren.
5. Ueber Components/Migrator starten wir den Migrator. Wenn man die 3th Party Software ausser acht laesst, kann man es bei den Defaulteinstellungen belassen und mit "Create Migration SQL File" ein Datenbank-Migrations-File erstellen und auf seinen Rechner downloaden.
6. Wir besorgen uns Joomla_1.5.26-Stable-Full_Package.zip und Joomla_2.5.6-Stable-Full_Package.zip von www.joomla.org
7. Jetzt wuerde man gerne die Joomla_1.5.26 drueberbuegeln, aber das geht leider nicht. Wir muessen alle Dateien in htdocs loeschen. Wir haben natuerlich noch das Backup, was wir spaeter auch noch brauchen.
8. Entpacken des Joomla_1.5.26-Stable-Full_Package.zip, Beginn der normalen Installation ueber Browser.
9. Nach Spracheinstellungen, Lizenbestimmungen, Datenbankkonfiguration und FTP-Daten kommt ein Punkt: "Lade Migrationsscript". Dort tragen wir den alten table-prefix ein und laden unser Migrations-sql-script hoch. Es sollte nach Ausfuehrung sowas erscheinen wie "Migration erfolgreich". 
10. Sitenamen eintragen, Admin-Account und Passwort, Fertig - Teil 1 ist geschafft.
11. Wir besorgen uns <a href="http://extensions.joomla.org/extensions/migration-a-conversion/joomla-migration/11658">com_jupgrade-2.5.1.zip</a>. Um es gleich vornweg zu nehmen: Das Ding ist ein bischen eigenwilig und reicht in der vorliegenden Version keineswegs dem hohen Qualitaetsstandard der sonstigen Joomla-Software. 
12. Wir loggen uns als im Administrationsbereich ein und installieren jUpgrade.
13. Wir starten jUpgrade. Hey, es ist Punkt 13, natuerlich funktioniert das Tool so nicht und bricht bei "Upgrading Progress" ab. Bzw. laeuft es in eine Endlosschleife. Man kann dem beliebig lange zusehen.
14. Wir wechseln mit dem Browser in das Webunterverzeichnis /jupgrade. Dort sollte sich die Installationsueberflaeche von Joomla 2.5.x befinden, wenn jUpgrade das Download der Software geschafft hat. Wenn nicht, kann man es manuell nach /jupgrade installieren.
15. Wir durchlaufen einmal den Installationsprozess per Browser, sodass wir nach Loeschen des Installations-Ordners ein lauffaehiges Joomla-2.5 haben.
16. Wir loggen uns wieder in den normalen Administrationsbereich unseres Joomla 1.5 ein und waehlen nochmal jUpgrade. Es ist drauf zu achten, dass jUpgrade nicht anfaengt die Software erneut runterzuladen und zu entpacken. Stattdessen soll sofort mit der Migration begonnen werden. Ansonsten muss man bei Punkt 15 wieder ansetzen.
17. Das Installationsverzeichnis ist zu loeschen und das Ergebnis im Browser unter /jupgrade zu begutachten. Wenn alles okay ist, kommt
18. Alle Daten aus htdocs nach /OLD verschieben. Inhalt aus /OLD/jupgrade* in die DocumentRoot verschieben, in /OLD/images/ eigene Mediaverzeichnisse nach /images kopieren, Pfade in configuration.php anpassen und /OLD loeschen. Fertig.

Nachtrag: In der Datenbank hat man eventuell noch mehrere Prefixe. Ausser dem aktuell verwendeten Prefix koennen alle geloescht werden. Joomla kann sich uebrigens jetzt selbst updaten. Bleibt zu hoffen, dass das Release-Update in Zukunft einfacher wird.
