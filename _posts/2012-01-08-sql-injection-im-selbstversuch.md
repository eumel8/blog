---
layout: post
tag: general
title: SQL Injection im Selbstversuch
subtitle: "Dynamische Webseiten sind eine tolle Sache. Der Besucher kann interaktiv am Geschehen teilnehmen und bekommt die Ergebnisse in Echtzeit praesentiert. Das macht die Webpraesenz agil und interessant - sei es wie hier beim Schreiben eines Blogbeitrages, ei&hellip;"
date: 2012-01-08
author: eumel8
---

<p>Dynamische Webseiten sind eine tolle Sache. Der Besucher kann interaktiv am Geschehen teilnehmen und bekommt die Ergebnisse in Echtzeit praesentiert. Das macht die Webpraesenz agil und interessant - sei es wie hier beim Schreiben eines Blogbeitrages, ein Webformular zum Versenden von Daten oder eine Webanwendung, die auf Abruf Content erstellt.</p>
<br/>
<p>Ein Standardkonzept zur technischen Umsetzung solcher Webanwendungen heisst LAMP - Linux Apache MySQL PHP. Ich habe also einen Linuxrechner beliebiger Distribution (SuSE, RedHat, Ubuntu, Debia...), ein Apache-Webserver zur Darstellung im Web, eine MySQL-Datenbank zur Vorhaltung der Daten und eine Skriptsprache PHP, um die Daten aus der Datenbank zu holen und per Web darzustellen. An den Administrator solcher Anwendungen werden heutzutage keine grossen Ansprueche gestellt. Linuxserver mit fertigen LAMP-Umgebungen gibt es ueberall zu kaufen. Fast alle Blogs oder CMSs wie Joomla funktionieren "out of the box" - es gibt ein Programmpaket und ein webgestuetztes Installationsmenue, was keinerlei Programmierkenntnisse mehr voraussetzt, wenn die Installation in 99% der Faelle sauber verlaeuft. In weniger als 15 Minuten habe ich meine fertige interaktive Webanwendung. Weniger als 15 Minuten dauert es auch, um Daten aus dieser Anwendung zu stehlen...</p>
<p><img style="float: right;" src="/images/injection.png?mtime=1326023715" alt="" width="48" height="48" /></p>
<p>Bei der Verarbeitung von Daten in dynamischen Webanwendungen zaehlt die alte Regel: Nimm nichts von Fremden. Nun ist es aber in der Sache, genau von Fremden etwas anzunehmen: Eingabewerte von Parametern, die vom Browser an die Webanwendung uebergeben und vom PHP-Interpreter ausgewertet werden.</p>
<p>Ich bin im Lab. In meiner alten Musikdatenbank moechte ich zum Beispiel nach dem Medium "MCD" suchen. Der von der Webanwendung erstellte Request heisst</p>
<p><code>http://web.eumel.de.local/cgi-bin/music.cgi?select=cdmedium&search=MCD</code></p>
<p>Es gibt also den Parameter <code>select</code> und die Parameter <code>search</code>. Statt PHP wird als Interpreter Perl verwendet. Der relevante Teil im Programm steht hier:</p>
<pre>my $search = $in{'search'};<br />$sth = $dbh-&gt;prepare("SELECT discnr FROM alben WHERE dtyp =  '$search'");</pre>
<p>Das Array der Eingabevariablen wird einer einzelnen Stringvariable $search zugewiesen und diese dann in einem SELECT als WHERE Parameter uebergeben. Wird die Eingabevariable auf ihre Glaubwuerdigkeit ueberprueft? Noe!</p>
<p>Aus meinem obigen Request koennte ich auch ein</p>
<p><code>http://web.eumel.de.local/cgi-bin/music.cgi?select=cdmedium&search=MCD;SHOW TABLES;</code></p>
<p>basteln, um nach dem SELECT den naechsten SQL-Befehl an das Query ranzubasteln. Das wird hier nicht ganz funktionieren, da nach der ersten WHERE Klausel noch ein AND kommt, womit durch das SHOW TABLES ein ungueltiges SQL-Query erzeugt wird (was man unter Umstaenden dann dem Anwender praesentiert). Aber mit etwas rumprobieren schafft man es vielleicht an das<code> information_schema </code>von MySQL zu kommen und hat danach leichtes Spiel.  Den Weg dahin nimmt einem <strong>Havij</strong> ab - ein aeusserst agiles Tool, was die verschiedenen Moeglichkeiten der SQL-Sprache bei verschiedenen Datenbanken einfach ausprobiert. Dazu kommt noch ein</p>
<p> </p>
<pre>mysql&gt; show grants for 'root'@'localhost';<br />+---------------------------------------------------------------------+<br />| Grants for root@localhost                                           |<br />+---------------------------------------------------------------------+<br />| GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION |<br />+---------------------------------------------------------------------+<br /></pre>
<p>wo ich mit uebermaessigen Rechten auf der Datenbank, mit TRUNCATE die Datenbanktabelle leeren oder mit DROP DATABASE die ganze Datenbank loeschen kann.</p>
<p>Wie sieht jetzt die Loesung dazu aus? Ueberpruefung der Eingabevariablen. Immer!</p>
<pre>my $badstrings = '&`\'\\|"*?~&lt;&gt;^(){}\$\n\r\[\]';<br />&HTMLdie("not allowed strings in search query.") if ($search =~ /[$badstrings]/);<br /></pre>
<p>In umgebkehrten Fall kann man statt der "gefaehrlichen" Strings auch nur die erlaubten aufzaehlen. Also sowas wie [a-zA-Z0-9]. Danach kann man auch noch die Laenge des Strings ueberpruefen. Und die Anzahl der Aufrufe pro Minute, um eine Ueberlastung der Datenbank durh zu viele Abfragen zu vermeiden.</p>
<p>Auch die Rechte des Datenbankusers sollten auf ein Minimum eingeschraenkt werden. Fuer die Musikdatenbank oben reicht ein SELECT, um Daten abzufragen, eingeschraenkt auf das Datenbankschema und den 2 Tabellen fuer Alben und Musik-Titel. Selbstredend sollte der Datenbankaccount auch ein Passwort haben, was modernen Anspruechen genuegt (siehe Passwort Swordfish) und die Rechte sollten auch auf den Host eingeschraenkt werden, auf der die Anwendung wohnt (vorzugsweise localhost = lokale Socket), wenn alles auf einem Rechner installiert ist.</p>
<p>Wer aus Datenbanksicht der Applikation ueberhaupt nicht traut, laesst eine direkte Verbindung auf die echten Datenbanktabellen erst gar nicht zu. Stattdessen werden entweder <a href="http://dev.mysql.com/doc/refman/5.0/en/create-view.html" target="_blank">VIEWS</a> zur Verfuegung gestellt, die der Anwendung eine Datenbanktabelle virtuell vorgaukelt. Oder es werden <a href="http://dev.mysql.com/doc/refman/5.0/en/stored-routines.html" target="_blank">Stored Procedures</a> programmiert, die nur mit bestimmten Werten aufgerufen werden duerfen und auch nur bestimmte Rueckgabewerte haben. Hilft aber auch nicht richtig, wenn der aufgerufene Wert vorher nicht ueberprueft wird. Es hilft also hier nur ein Zusammenspiel der Massnahmen.</p>
<p>Wer seine Daten strenger kontrollieren will, goennt sich eine Datenbank-Firewall. Da die meisten Webanwendungen auf MySQL basieren, sollte man sich mal http://www.greensql.net/ ansehen. Greensql haengt zwischen Applikationsserver und Datenbank und untersucht staendig den SQL-Verkehr. Bei gefaehrlichen Queries wird der Befehl rausgefiltert und es wird ein leeres Ergebnis oder ein Fehler zurueckgeliefert. Es gibt auch einen Lernmode, um die Firewall auf seiner Applikation zu "trainieren". Und es loggt alle Aktivitaeten. Das sollte sowieso zum Schluss der letzte Tipp sein: Applikations- und Datenbank-Logs staendig auf ungewoehnliche Ereignisse untersuchen. Oder einen Nagios-Alarm als Event generieren. Ich habe fertig :-)</p>
<p> </p>

<div class="image_block"><img style="float: right;" src="/images/dbplus.png?mtime=1326023769" alt="" width="48" height="48" /></div>

<p> </p>
