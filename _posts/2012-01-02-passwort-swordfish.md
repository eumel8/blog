---
layout: post
tag: general
title: Passwort Swordfish
subtitle: "Das Boese ist immer und ueberall - so lautet eine alte Weisheit, aktuell ist sie auch heute noch. In Zeiten von  globaler Vernetzung und Rechnen in den Wolken (engl. Fachbegriffe Social Networking &amp; Cloud Computing) ist die Frage nach den Daten unse&hellip;"
date: 2012-01-02
author: eumel8
---

<div class="image_block"><img style="float: right;" src="/blogs/media/blogs/eumel/passwort_swordfish_2.jpg?mtime=1325709389" alt="" width="301" height="196" /></div>
<p>Das Boese ist immer und ueberall - so lautet eine alte Weisheit, aktuell ist sie auch heute noch. In Zeiten von  globaler Vernetzung und Rechnen in den Wolken (engl. Fachbegriffe Social Networking &amp; Cloud Computing) ist die Frage nach den Daten unserer werten Informationsgesellschaft immer wichtiger. Viel oft stellt man sich nicht nur die Frage: Wo sind die Daten? Sondern vielmehr: Wo sind die Daten gewesen?</p>
<br/>
<p>Alles was im Internet per Web erreichbar ist (http...) ist frueher oder spaeter ueber Google erreichbar. Wenn man mal nach seinem Passwort oder seiner Email-Adresse googelt, kann man manchmal wahre Wunder erleben.</p>
<p>Doch woher kommt eigentlich die Sache mit dem Passwort? Frueher hiess das ja immer noch Parole - eine Sache, die es auch heute noch beim Militaer gibt. Und ganz frueher hiess es noch Losung - also wenn man in die Burg wollte, brauchte man an der Zugbruecke die Losung.</p>
<p>Das Passwort ist also wie frueher die Losung an der Zugbruecke  das geteilte Geheimnis - ich weiss es, und der der es wissen muss, vergleicht das dann mit den ihm vorliegenden Informationen.  Stimmen diese ueberein, darf ich rein.  Und da ich nicht wie alle anderen in die Burg rein will, sondern in mein Email-Postfach, habe ich ein eigenes Passwort. Alle, die ins Email-Postfach wollen, haben ein eigenes Passwort.</p>
<p>Das macht den Email-Postfach-Anbieter recht interessant. Wenn man den entern koennte., koennte man alle Passwortinformationen aller Benutzer bekommen.  Vielleicht sitzt der dortige Koenig tatsaechlich wie auf einer Schatzkiste und verwaltet alle Passwoerter? Waere ja ziemlich bloed:</p>
<p><code> user1:passwort1<br /> user2:passwort2<br /> user3:passwort5<br /> </code></p>
<p>Wenn ich diese Schatzkiste erbeute, habe ich alle Benutzernamen und deren Passwoerter. Frueher war das tatsaechlich so. Wer das heute noch so macht, ist ein Tor. Wobei, die Konfigurationsdateien der meisten Anwendungen halten Passwoerter fuer Datenbankverbindungen und Kennungen fuer andere Resourcen in Klartext vor. Auch auf dem heimischen PC gibt es Programme, die Passwoerter in Klartext abspeichern, ohne dass es der Anwender merkt oder er etwas dagegen tun kann.</p>
<p>Heutzutage werden Passwoerter nur noch in sogenannte Hashes abgespeichert.  Der Trick dabei ist, dass Passwoerter so nicht mehr entschluesselt werden koennen. Wenn sich ein User mit einem Passwort irgendwo einloggt, wird das Passwort quasi nochmal verschluesselt und die Schluessel miteinander vergleichen. Der bekannteste "One-Way"-Verschluesselungsmechanismus  ist der <code>crypt()</code> Hash oder auch DES (Data Encryption Standard) genannt. Er hat eine Schluesseltiefe von 56 bit, das sind bei 7-bit-Zeichen-Codierung (a_z0-9./) 8 einzelne Zeichen. Der Inhalt meiner Schatzkiste saehe dann so aus:</p>
<p><code> user1:dzFuqRijEziNs </code></p>
<p><code>user2:f4TGeVz4/0dxs </code></p>
<p><code>user3:lCQjIXEAkj/vM </code></p>
<p>Gleiche Passwoerter liefern gleiche crypt()-Strings. Ueblicherweise werden die ersten beiden Zeichen als Salt herangezogen (siehe weiter unten). Beim Eingabe des Klartextpasswortes kann die Applikation ueber die crypt()-Routine die Angaben vergleichen und die Richtigkeit bestaetigen (oder nicht).  Aufgrund der Schluessellaenge ist dieses Verfahren aber nicht mehr sicher. Mit einer Woerterbuchattacke (dictionary attack) oder nacheinander Ausprobieren aller Kombinationen (brute force) kann so das Passwort innerhalb kurzer Zeit erraten werden.  Ich brauche bloss einen leistungsfaehigen Rechner und <a href="http://www.openwall.com/john/" target="_blank">"John the Ripper"</a>. Es kann mathematisch berechnet werden, wie lange die Entschluesselung dauert, wenn ich bloss Kleinbuchstaben, Zahlen oder bekannte Woerter aus dem Duden einsetze. Eine Erweiterung von DES stellt noch 3DES dar - die Salt-Strings sind hier verlaengert und es duerfen mehr unterschiedliche Zeichen eingesetzt werden. Das Verfahren ist aber ansonsten das gleiche.</p>
<p>Die naechste Stufe der Verschluesselung ist MD5 (Message Digest Version 5).  MD5-Hashes koennen beliebig lange Zeichen in 128 bit lange Strings codieren. Diese werden hexadezimal mit 32 Zeichen dargestellt. Unser Schatzkiste sieht so aus:</p>
<p><code> user1:a3cca2b2aa1e3b5b3b5aad99a8529074<br /> user2:2aa1e3b5ba3cca2b3b5a9a8529074ad9<br /> user3:1e3a3c3b5aad9074ca2b2aab99a8525b<br /> </code></p>
<p>Genau wie beim crypt() lassen sich die Passwoerter so nicht mehr entschluesseln. Man kann nur die Uebereinstimmung der Hashes vergleichen, wenn man das richtige Passwort weiss. Bei MD5 kann man aber die Hashes (Hashes sind eigentlich Pruefziffern) mit sogenannten Rainbowtables vergleichen. Solche Tools gibt es auch <a href="http://www.c0llision.net/webcrack" target="_blank">online</a>. In deren Datenbank befinden sich Millionen von MD5-Hashes. Wenn man diese nun vergleicht und es kommt zur Kollision: Bingo, der MD5-Hash ist entschluesselt.</p>
<p>Die naechste Stufe heisst md5crypt() oder MD5 mit Salt. Unsere Schatzkiste veraendert sich wieder:</p>
<p><code> user1:$1$a3cca2b2aa1e3b5b3b5aad99a8529074<br /> user2:$1$2aa1e3b5ba3cca2b3b5a9a8529074ad9<br /> user3:$1$1e3a3c3b5aad9074ca2b2aab99a8525b<br /> </code></p>
<p>Das "Salt" bedeutet tatsaechlich<a href="http://www.ww-a.de/GetaktetePasswoerter.htm" target="_blank"> "gesalzen".</a> Das Passwort wird nochmal mit einem 12 Zeichen langem Wort verschluesselt. Da ein 128-bit-Schluessel verwendet wird, ist es immer noch moeglich, dieses Passwort zu knacken. Man hat das vielleicht in "Password Swordfish" schon mal gesehen: "ich knacke einen 128-bit-Schluessel, hahaha". Der Aufwand ist aber schon recht erheblich.</p>
<p>Die naechste Stufe:</p>
<p>SHA (Secure Hash Algorithm). 160 Bit ist der Schluessel in der Version SHA-0 bzw. SHA-1 lang. Unsere Schatzkiste sieht so aus:</p>
<p><code> user1:{SHA}MyrQhpQcTD16ElwpWr6AH4Plk3A=<br /> user2:{SHA}MyrQhpQcTD16ElwpWr6AH4Plk3A=<br /> user3:{SHA}MyrQhpQcTD16ElwpWr6AH4Plk3A=<br /> </code></p>
<p>SHA-1 wird heute auch nicht mehr als sicher angesehen. Wissenschaftler in China konnten 2005 die Anzahl zum Berechnen eines SHA-1-Schluessels von 2 hoch 80 auf  2 hoch 59 senken.  Diese Leistung kann zu diesem Zeitpunkt schon durch Supercomputer erreicht werden.</p>
<p>SHA-256 ist eine Erweiterung von SHA mit einem 16 Zeichen Salt.  Die Laenge betraegt 256 Bit. In unserer Schatzkiste aendert sich wieder der erste Teil des Hashs und das Passwort wird viel laenger:</p>
<p><code> user1:$5$...<br /> user2:$5$...<br /> user3:$5$...<br /> </code></p>
<p>SHA-512 eine weitere Erweiterung von SHA mit einem 16 Zeichen Salt und einer Laenge von 512 Bit. Unsere Schatzkiste sieht in etwa so aus:</p>
<p><code> user1:$6$...<br /> user2:$6$...<br /> user3:$6$...<br /> </code></p>
<p>SHA kann auch nochmal mit SHA verschluesselt werden. Es aendert aber nichts dran, dass es sich genau wie MD5 eigentlich um ein Verfahren von Signieren grosser Dateien oder Ermitteln von Pruefsummen handelt. Zur Generierung von Passwoertern waren diese Verfahren nie vorgesehen, genuegten aber den Anspruechen der Zeit, da sie die Zeichenlaengen-Barriere von crypt() gebrochen haben. Laengere Passwoerter waren sonst sinnlos, da nur ersten 8 Zeichen des Passwortes bei der Verschluesselung Beachtung fanden.</p>
<p><img src="/blogs/media/blogs/eumel/openssh.png?mtime=1325627785" alt="" width="194" height="191" /></p>
<p>Naechste Stufe: Blowfish. Blowfish ist ein symetrisches Verschluesselungsverfahren mit 128 Bit Schluessellaenge. Es koennen aber auch bis zu 448 Bit sein. Intern arbeitet Blowfish mit 64 Bit Bloecken. In 16 Rundenschluesseln werden jeweils von links und rechts 32 Bit Bloecke verschluesselt, die dann zum Schluss mit2 weiteren Rundenschluesseln verschluesselt werden.  Die Schatzkiste sieht dann so aus:</p>
<p><code> user1:$2a$... <br /> user2:$2a$... <br /> user3:$2a$... <br /> </code></p>
<p>Der Rundenschuessel ist Bestandteil des Passworthashes, weswegen die Abspeicherung nicht sehr platzsparend ist. Aber Blowfish gilt als sicher. Bis 2011 gab es noch keine Moeglichkeit, Blowfish verschluesselte Hashs zu knacken. Die Weiterentwicklung von Blowfish ist Twofish, findet aber in der Praxis keine Verbreitung.</p>
<p>Alle bislang verwendeten<code> crypt</code> und <code>hash</code> Verfahren sind nochmal <a href="http://www.php.net/manual/de/function.crypt.php" target="_blank">hier</a> und <a href="http://www.php.net/manual/de/faq.passwords.php#faq.passwords.fasthash" target="_blank">hier</a> beschrieben.</p>
<p>Naechste Stufe: bcrypt. Bcrypt vereinigt die sicheren Verschluesselungsverfahren von Crypt mit Salt und den Verschluesselungsrunden der Hashes in Blowfish.  Unsere Schatzkiste saehe am Ende so aus:</p>
<p><code> user1:$2a$08$jb8v67zmCNMO9dlX1tkVqOxGlhQkJNL45AvfpbEWvqXnGC8YcO7Hm<br /> user2:$2a$05$NMO9dlX1tkVqjb8v67zmCOxGlhQkJYcO7HmNL45AvfpbEWvqXnGC8<br /> user3:$2a$05$O9dlX1tkjb8v67zmCNMVqOxGlhQknGC8YcO7HmJNL45AvfpbEWvqX</code></p>
<p>Nach dem Identifier fuer Bcrypt $2a$ wird die Anzahl der Runden in einer Potenz von 2 angegeben.  Ich kann also mit demselben Format Passwoerter in unterschiedlichen Staerken abspeichern - wenn man es fuer erforderlich haelt, weil manche Accounts hoehere Sicherheitsstufen benoetigen oder weil es einfach der User wuenscht.  Aber Vorsicht: die starke Verschluessung kostet! Zum einen Rechenleistung und vor allem Zeit. Es kann also sein, dass das Einloggen mit einem 2 hoch 8 Runden Passwoert erheblich laenger dauert als in 2 hoch 5 Runden. Das kommt auf die jeweilige Rechenumgebung an. Die Laenge des Passwortes ist eigentlich egal, denn Salt und  Shuffle fuellen die Bloecke auf die erforderliche Menge mit Daten auf, ehe sie verschluesselt werden. Hinweise dazu gibt es <a href="http://www.phpgangsta.de/schoener-hashen-mit-bcrypt" target="_blank">hier</a> und<a href="http://www.heise.de/security/artikel/Passwoerter-unknackbar-speichern-1253931.html?artikelseite=3" target="_blank"> hier.</a></p>
<p>Welche Passwoerter man nicht verwenden sollte, steht <a href="http://download.openwall.net/pub/wordlists/languages/German/2-large/" target="_blank">hier</a>. Das sind Woerterbuecher, die Passwort-Cracker verwenden, um verschluesselte Passwoerter zu erraten.</p>
<p>Wie kommt man nun aber zu einem sicheren Passwort? Erstmal ein paar No Go's:</p>
<ol>
<li>gar kein Passwort verwenden</li>
<li>Namen oder Zahlen wie Geburtstdatum</li>
<li>ein Wort aus dem Woerterbuch oder Staedtenamen</li>
<li>Zeichenreihen auf der Tastatur</li>
</ol>
<p>Und was hilft:</p>
<ol>
<li>Gross-/Kleinschreibung, Zahlen und Sonderzeichen mit mindestens 12 Zeichen Laenge</li>
<li>Passwoerter nie unverschluesselt auf dem PC speichern, stattdessen pgp verwenen</li>
<li>Nicht bei allen Diensten dasselbe Passwort verwenden sondern verschiedene Sicherheitsstufen einfuehren</li>
<li>Wenn man sich schon Passwoerter aufschreiben muss, dann die Geheimnisse teilen und in unterschiedlichen Orten aufbewahren. Auch kann man Benutzernamen und Kennwort trennen.</li>
<li>Und Passwoerter natuerlich regelmaessig aendern.</li>
</ol>
<p>Wenn der PC Internetanschluss hat, gehoeren immer Softwareupdates zum Tageswerk. Jede Ungewoehnlichkeit sollte man argwoehnisch beachten. Die Verschluesselungstechniken entwickeln sich immer weiter. Deswegen sollte man da auch immer auf dem neuesten Stand sein ;)</p>
<p> </p>
<div class="image_block"><img style="float: right;" src="/blogs/media/blogs/eumel/ritter_wolf.jpg?mtime=1325628211" alt="" width="222" height="222" /></div>
