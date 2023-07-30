---
layout: post
tag: general
title: Computerprobleme 1004
subtitle: "Heute beschaeftigen wir uns mal mit zwei kleineren Computerproblemen und deren unspektakulaeren Loesung.n1. Webdav unter WindowsnZum Dateienaustausch benutzen wir immer noch von verschiedenen Rechnern unser altes Webdav-Laufwerk, was auf einem Webserv&hellip;"
date: 2011-04-10
author: eumel8
---

<p>Heute beschaeftigen wir uns mal mit zwei kleineren Computerproblemen und deren unspektakulaeren Loesung.</p>
<br/>
<p>1. Webdav unter Windows</p>
<p>Zum Dateienaustausch benutzen wir immer noch von verschiedenen Rechnern unser altes Webdav-Laufwerk, was auf einem Webserver liegt und per http und basic password authentication erreichbar ist. Das klappte schon unter Windows 2000 und auch Windows XP. Unter Vista wurde es schon etwas gruselig und man brauchte Digest-Authentifizierung auf dem Server oder sog. "Third Party Software". Das war dann ein Java-Client, der Webdav konnte. Toll.</p>
<p>Unter Windows 7 gehts natuerlich immer noch nicht so einfach, aber wenigstens wuerde ein anderes Webdav unter https funktionieren (Sicherheit und so).  Die Loesung fuer http gibts auf http://support.microsoft.com/kb/928692/de. Man muss in der Windows Registry mi regedit unter HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\WebClient\Parameters den Wert nur auf 2 setzen , neu booten und schon kann man das alte Webdav unter http bedienen.</p>
<p>2. Backup von USB-Drives unter Linux</p>
<p>Ein weiteres Teilprojekt. Von einer 1-TB-USB-Festplatte mit Mediaplayer sollen die Daten auf eine andere 2-TB-USB-Festplatte gebackuped werden. Die erste Platte ist mit dem WD TV Live Hub im LAN und freigegebenen Windows-Share erreichbar. Die zweite Platte haengt am Linux-Rechner, der sich im selben LAN befindet.  Beide Platten sind mit NTFS formatiert.</p>
<p>Ein kostenloses Unix-Tool fuer Backup ist zum Beispiel rsync. Der typische Befehl zum Backup lautet dann:</p>
<blockquote>
<p>rsync -av <altes Verzeichnis> <neues Verzeichnis></p>
</blockquote>
<p>Die Platte vom Mediaplayer ist per CIFS gemountet, also einfach</p>
<blockquote>
<p>mount //WIDI/WDTVLiveHub /media/widi</p>
</blockquote>
<p>Die zweite Platte kriegt man bloss mit extra Werkzeug mit Lese-Schreib-Rechten ans Fliegen. Mounten geht nur mit FUSE - dazu muss man schon die entsprechenden Programmpakete fuse, fuse-lib und fuse-devel installiert haben. Der passende Treiber dazu ist  NTFS-3G von http://www.tuxera.com. Es gibt aeltere RPMs, die aber alle buggy sind. Rsync arbeitet nicht richtig und quittiert das Kopieren mit "operation not supported (95)". ntfs-3g-2011.1.15 tut!</p>
<p>Sourcen von http://www.tuxera.com runterladen, auspacken, configure starten, make, make install, fertig. Mit</p>
<blockquote>
<p>mount.ntfs-3g /dev/sda1 /media/Backbook</p>
</blockquote>
<p>bekommt man die USB-Platte mit Schreib-Lese-Rechten eingebunden und kann freifroehlich seine Daten ueber das Netzwerk kopieren<a href="http://www.wdc.com/de/products/products.aspx?id=570" target="_blank">.</a></p>
<p><a href="http://www.wdc.com/de/products/products.aspx?id=570" target="_blank"><br /></a></p>
<p><a href="http://www.wdc.com/de/products/products.aspx?id=570" target="_blank">WD TV Live Hub</a></p>
