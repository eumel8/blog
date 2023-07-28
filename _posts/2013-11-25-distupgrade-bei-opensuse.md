---
layout: post
tag: general
title: Distupgrade bei OpenSUSE
subtitle: "Eigentlich startet eine neue Version einer Linux-Distribution immer mit einer Neuinstallation - zumindest wenn man alle paar Jahre mal Zeit hat oder Programm Gnuutoolfuergel mit dem alten Betriebssystem ums Verrecken nicht laufen will.nDazu habe ich je&hellip;"
date: 2013-11-25
author: eumel8
---

<p>
Eigentlich startet eine neue Version einer Linux-Distribution immer mit einer Neuinstallation - zumindest wenn man alle paar Jahre mal Zeit hat oder Programm Gnuutoolfuergel mit dem alten Betriebssystem ums Verrecken nicht laufen will.
Dazu habe ich jetzt mal die Option mit Distributions-Update ausprobiert.
</p>
<br/>
<p>
Bei OpenSUSE ist die prinzipielle Vorgehensweise ja eigentlich sehr gut <a href="http://de.opensuse.org/SDB:Distribution-Upgrade">beschrieben</a>. Man brauch bloss die neuen Installsourcen und 5 Kommandos spaeter hat man die neue Distribution. Ein Selbstversuch. 
</p>
OpenSUSE 12.1 ist outdated, disconnected, unsupported ... was soll man sagen, keiner hat es mehr lieb. OpenSUSE 13.1 ist zwar gerade erschienen, aber wir moechten erst mal auf 12.3 upgraden.
Vorbereitungen:
<pre>
karibui:~ # cat /etc/SuSE-release
openSUSE 12.1 (i586)
VERSION = 12.1
CODENAME = Asparagus
karibui:~ # uname -a
Linux karibui 3.1.0-1.2-default #1 SMP Thu Nov 3 14:45:45 UTC 2011 (187dde0) i686 i686 i386 GNU/Linux
</pre>
<p>
Um Bandbreite zu sparen, besorge ich mir das ISO von OpenSUSE 12.3, mache es von einem anderen Rechner per HTTP verfuegbar und binde es in meine Update-Repositories mit ein. Wer das nicht macht, muss je nach Updateversion und installierter Software 800 MB Programmpakete aus dem Internet herunterladen.
Alle bestehenden Repositories deaktivieren und neue hinzufuegen:
</p>
<pre>
karibui:~ # zypper mr -adR
karibui:~ # zypper ar -n "OPenSuse 12." http://192.168.0.10/suse/ opensuse-standard
karibui:~ # zypper ar -n "openSUSE-12.3 OSS" http://download.opensuse.org/distribution/12.3/repo/oss/ repo-12.3-oss
karibui:~ # zypper ar -n "openSUSE-12.3 Non-OSS" http://download.opensuse.org/distribution/12.3/repo/non-oss/ repo-12.3-non-oss
karibui:~ # zypper ar -f -n "openSUSE-12.3 Updates OSS" http://download.opensuse.org/update/12.3/ repo-12.3-update-oss
karibui:~ # zypper ar -f -n "openSUSE-12.3 Updates Non-OSS" http://download.opensuse.org/update/12.3-non-oss/ repo-12.3-update-non-oss
</pre>
<p>
Metadaten der Repositories herunterladen, Referenzen pruefen:
</p>
<pre>
karibui:~ #zypper clean -a
karibui:~ #zypper ref
</pre>
<p>
Upgrade beginnen, Softwarelizenz bestaetigen:
</p>
<pre>
karibui:~ # zypper dup
</pre>
<p>
Wenn alles gut aussieht am Ende und keine Fehler aufgetreten sind:
</p>
<pre>
karibui:~ # reboot
</pre>
<p></p>
<pre>
root@karibui:# cat /etc/SuSE-release
openSUSE 12.3 (i586)
VERSION = 12.3
CODENAME = Dartmouth
root@karibui:# uname -a
Linux karibui.dsl.eumel.local 3.7.10-1.16-default #1 SMP Fri May 31 20:21:23 UTC 2013 (97c14ba) i686 i686 i386 GNU/Linux
</pre>
<p>
Die Rolle rueckwaerts klappt bei Fileystem mit Snapshotfunktion, z.B. btrfs:
</p>
<pre>
karibui:~ # snapper list
Type | # | Pre # | Date | Cleanup | Description | Userdata
-------+---+-------+--------------------------+----------+--------------+---------
single | 0 | | | | current |
pre | 1 | | Mon Nov 25 16:11:30 2013 | number | zypp(zypper) |
post | 2 | 1 | Mon Nov 25 16:37:59 2013 | number | |
single | 3 | | Mon Nov 25 19:51:35 2013 | | |
single | 4 | | Mon Nov 25 20:00:02 2013 | timeline | timeline |

karibui:~ # snapper -v undochange 1..2
</pre>
<p>
Nach dem naechsten Reboot ist man wieder bei OpenSUSE 12.1 Das war ja einfach
</p>
