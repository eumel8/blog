---
layout: post
tag: general
title: Linux. remote Dateiverschluesselung
subtitle: "Zur verschluesselten Datenuebertragung unter Linux hat sich laengst OpenSSH laengst etabliert. Abundzu gibts mal paar kleine Sicherheitsprobleme, aber ansonsten ist die Verwendung ganz okay. Die meistverwendeten Programme sindnnssh (secure shell) und&hellip;"
date: 2012-04-02
author: eumel8
---

Zur verschluesselten Datenuebertragung unter Linux hat sich laengst <a href="http://www.openssh.org">OpenSSH</a> laengst etabliert. Abundzu gibts mal paar kleine Sicherheitsprobleme, aber ansonsten ist die Verwendung ganz okay. 
<br/>
Die meistverwendeten Programme sind

ssh (secure shell) und
scp (secure copy)

Auch Benutzer von rsync muessen mit einer Implementierung von OpenSSH nicht auf eine sichere Datenuebertragung verzichten:

<code>
/usr/bin/rsync -avzR --rsh=ssh \
--rsync-path='sudo /usr/bin/rsync' \
jambo.eumelnet.de:/var/named/ /usr2/server/jambobackup/
</code>

Den root-Zugriff brauchen wir nur, wenn wir Dateien oder Verzeichnisse als normaler Nutzer auf dem entfernten Rechner nicht lesen koennen. 

Etwas mehr Komfort bietet da ein VPN mit verschluesselter Datenuebertragung. Auf <a href="http://openvpn.net/index.php/open-source/documentation/miscellaneous/77-rsa-key-management.html">openvpn.net</a> ist ein Verfahren beschrieben, wie ich mit openssl (easy-rsa) eine eigene Zertifizierungsstelle aufbaue, Client-Zertifikate signiere und denen somit den Zugang zum VPN ermoegliche. Die Datenuebertragung innerhalb dieses Netzwerkes ist sicher, eine Verschluesselung von rsync mit ssh also nicht mehr notwendig. Wie sieht es jedoch mit sensiblen Dateien auf einem Host aus? Angenommen ich wollte die Mail-Logs von einem Linux-Server, die normalerweise nur als root lesbar sind, als normaler Benutzer auf einen anderen Rechner kopieren? Auch hier bietet <a href="http://www.openssl.org">openssl</a> eine Moeglichkeit.

Quellrechner:

<code>
#!/bin/sh

SERVER=kopernikus
cd /var/log
tar cfz /tmp/mail_info_$SERVER.tgz mail.info*
openssl enc -e -aes256 -a -pass pass:KoperNik18 -in /tmp/mail_info_$SERVER.tgz -out /srv/www/htdocs/mail_info_$SERVER.tgz.enc
rm -f /tmp/mail_info_$SERVERtgz
</code>

Zielrechner:

<code>
SERVER=kopernikus
DATE=`date +%Y`
cd /data/logs/$SERVER
wget -q -O mail_info_$SERVER.tgz.enc http://koperikus.eumel.de/mail_info_$SERVER.tgz.enc
openssl enc -d -aes256 -a -pass pass:KoperNik18 -in mail_info_$SERVER.tgz.enc -out mail_info_$SERVER.tgz
tar xfz mail_info_$SERVER.tgz
rm -f mail_info_$SERVER.tgz.enc
rm -f mail_info_$SERVER.tgz
</code>

Schwuppdiwupp, die Mail-Logs von kopernikus kann ich ueber Web unverschluesselt und doch sicher auf meinen Rechner uebertragen. Schwachstellen des Programms sind die temporaeren unverschluesselten Dateien, die hier zu Demonstrationszwecken dargestellt sind. Mit | wuerde man alle Programmteile verketten und so lediglich die Dateien im RAM-Speicher angreifbar machen. Zielpunkt war aber die Sicherheit der Dateien in einer unverschluesselten Uebertragung.
