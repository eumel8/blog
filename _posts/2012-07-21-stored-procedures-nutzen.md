---
layout: post
tag: general
title: Stored Procedures nutzen
subtitle: "Die meistennnndelimiter //nCREATE PROCEDURE 'Login'(Name VARCHAR(255), Pw VARCHAR(255))nREADS SQL DATAnBEGIN n  DECLARE Ergebnis TINYINT;n  SELECT COUNT(*) INTO Ergebnis FROM Benutzer WHERE Benutzername = Name;n  IF Ergebnis > 0 THENn     SELE&hellip;"
date: 2012-07-21
author: eumel8
---

<p>Fast taeglich ereilen uns Schreckensmeldungen der Underground Economy, dass das eine oder andere Portal oder Internetpraesenz einer Organisation, Institution oder Firma gehackt worden ist. Die Reaktion tendiert meist zur Schadensfreude derjenigen, an denen der Kelch vorbeigegangen ist bis eventuell nachdenkliche Gesichter. Bisweilen ist es auch interessant, wie es die Hacker in die entsprechenden Systeme geschafft haben.</p>
<br/>
<p>Am meisten befallen sind Test- oder Entwicklungssysteme, die mit am Netz haengen und die erfolgreichste Methode fuer den Einbruch ist die SQL-Injection.  Ich demonstrierte das <a href="/blogs/blog8.php/sql-injection-im-selbstversuch" target="_blank">hier unlaengst selber</a>. Allgemein ist es immer kritisch, wenn der User bei dynamischen Webanwendungen etwas eingeben darf, auf das das System reagieren soll. Die fehlende oder mangelhafte Eingabeueberpruefung fuehrt dann im schlimmsten Fall bis zum Shell-Zugriff oder dem SQL-Prompt auf der Datenbank, wenn man etwas den direkten Zugriff auf Tabellen in der Applikation oder der Datenbank erlaubt Dabei sind Sicherheitsmechanismen schon laengst etabliert, aber wenig benutzt.</p>
<p>Variante 1 ist der sogenannte VIEW:</p>

<!-- codeblock lang="" line="" --><pre><code> 
CREATE view vuser as 
SELECT u.site,u.status,u.failed,u.anrede,u.vorname,u.nachname,u.strasse1,u.strasse2 
FROM user u; 
</code></pre><!-- /codeblock -->

<p>VIEWS sind virtuelle Datenbanktabellen, die es so physikalisch in der Zusammensetzung nicht gibt. Dennoch werden beliebig viele Argumente fuer das Query entgegengenommen, weswegen es verwundbar wird.</p>
<p>Variante 2 ist die Stored Procedure. Hier wird eine Funktion in der Datenbank abgebildet, die nur zu bestimmte Anzahl von Uebergabeparameter erlaubt und auch nur definierte Rueckgabewerte liefert (anstatt der Daten aus den Datenbanktabellen). Hier einige Beispiele fuer eine MySQL-Webanwendung, die das Login und das Aendern eines Passwortes fuer einen User erlauben soll:</p>

```
delimiter // 
CREATE PROCEDURE 'Login'(Name VARCHAR(255), Pw VARCHAR(255)) READS SQL DATA BEGIN 
DECLARE Ergebnis TINYINT; 
SELECT COUNT(*) INTO Ergebnis FROM Benutzer WHERE Benutzername = Name; 
IF Ergebnis &gt; 0 THEN 
SELECT -1 INTO Ergebnis FROM Benutzer WHERE Benutzername = Name AND AnzahlFehlLogins &amp;gt;= 10 LIMIT 1; 
SELECT -2 INTO Ergebnis FROM Benutzer WHERE Benutzername = Name AND Geloescht = 1 LIMIT 1; 
END IF; 
IF Ergebnis = 1 THEN 
SELECT COUNT(*) INTO Ergebnis FROM Benutzer WHERE Benutzername = Name AND Passwort = SHA1(CONCAT(Hash, Pw)) LIMIT 1; 
IF Ergebnis = 1 THEN 
UPDATE Benutzer SET AnzahlFehlLogins = 0, LetzterLogin = NOW() WHERE Benutzername = Name LIMIT 1; ELSE UPDATE Benutzer SET AnzahlFehlLogins = AnzahlFehlLogins + 1 WHERE Benutzername = Name LIMIT 1; 
END IF 
END IF; 
SELECT Ergebnis; 
END; 
</code></pre><!-- /codeblock --> 

Eine Loginroutine, die mit Username/Passwort als Parameter angesprochen wird und 1 zurueckliefert, wenn nicht mehr als 10 fehlerhafte Logins erfolgten, der Account geloescht ist oder das Passwort nicht stimmt. Im folgenden Statement werden die Userdaten anhand eines Tokens aus der Datenbank herausgegeben. Das Token kann ein Cookie sein oder etwas ein openid-token: <!-- codeblock lang="" line="" --><pre><code> 
delimiter // 
CREATE PROCEDURE Benutzerdaten(Benutzertoken VARCHAR(40)) READS SQL DATA BEGIN SELECT Benutzername, Mail, Vorname, Nachname, AnzahlFehlLogins, Gesperrt, Geloescht FROM Benutzer WHERE Token = Benutzertoken LIMIT 1; 
END; // 
```
In der Prozedur zum Passwortzuruecksetzen wird neben der Aenderung des Passworts auch das Token neu gesetzt und die Anzah der fehlerhaften Logins auf 0 gesetzt: 

```
delimiter // 
CREATE PROCEDURE PasswortZuruecksetzen(Benutzertoken INT, PasswortNeu VARCHAR(255), Zufallstoken VARCHAR(100)) READS SQL DATA BEGIN 
DECLARE Ergebnis TINYINT; 
SELECT COUNT(*) INTO Ergebniis FROM Benutzer WHERE ID = Benutzertoken; 
IF Ergebnis = 1 THEN 
UPDATE Benutzer SET Passwort = SHA1(CONCAT(Zufallstoken, PasswortNeu)), Hash = Zufallstoken, AnzahlFehllogins = 0 
WHERE ID = Benutzertoken LIMIT 1; 
END IF; 
END; 
// 
```

Diese Beispiele sollen ausreichend sein, um die Funktion von Stored Procedures zu demonstrieren und sie in der praktischen Arbeit einzusetzen.
<p> </p>
<p>Security bei MySQL ist auch noch <a href="http://dev.mysql.com/doc/refman/5.0/en/security.html" target="_blank">hier</a> beschrieben</p>
