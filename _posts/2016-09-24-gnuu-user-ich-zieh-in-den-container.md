---
layout: post
tag: container
title: gnuu user - ich zieh in den Container
subtitle: "Der Containerwahn macht auch vor UUCP und News nicht halt. Um die Dienste von uucp.gnuu.de nutzen zu koennen, muss man UUCP, News und Mail auf seinm Rechner installieren. Da das beliebig kompliziert werden kann, hatte ich im SuSE-Studio den GNUUUSER"
date: 2016-09-24
author: eumel8
---

Der Containerwahn macht auch vor UUCP und News nicht halt. Um die Dienste von uucp.gnuu.de nutzen zu koennen, muss man UUCP, News und Mail auf seinm Rechner installieren. Da das beliebig kompliziert werden kann, hatte ich im SuSE-Studio den GNUUUSER schon mal erfunden. Das ist quasi eine Appliance fuer User. Neu jetzt der LXD-Container fuer GNUU:
<br/>
Ueber LXD-Container habe ich <a href="http://blog.eumelnet.de/blogs/blog8.php?tag=lxd">hier</a> schon oft berichtet. Heut moechte ich einen weiteren praktischen Anwendungsfall vorstellen. 

Als erstes brauch man das Puppet-Modul <a href="https://github.com/eumel8/puppet-gnuuuser">puppet-gnuuuser</a>. Es installiert die notwendigen Programmpakete und richtet die Konfiguration entsprechend der Accountdaten ein. Der Aufruf des Modules geschieht etwa mit 

```
class {'gnuuuser':
 site => '6913306960778',
 password => 'xxxxxx',
}
```

Das funktioniert mindestens auf jeden OpenSuse 13.2 System. Das Deployment in den LXD-Container ist in LXD.md beschrieben. DIe Klasse muss in deploy-gnuuuser.sh eingebaut werden, damit der LXD-Container dann mit den richtigen Daten deployt wird.

```bash
lxc launch images:opensuse/13.2/amd64 gnuuuser
lxc file push deploy-gnuuuser.sh gnuuuser/
lxc exec gnuuuser -- bash /deploy-gnuuuser.sh
```

Der Connect zum UUCP-Server sollte so schon funktionieren:

```bash
/usr/sbin/uucico -f -s uucp.gnuu.de
```

Ich lese die Mails mit pine, also kopiere ich mit rsync das Homedir vom alten Rechner in den Container. Das Kopieren des Newsspools hat nicht funktioniert, da das alte System in 32bit-System war und das neu 64bit. DIe History und der CFNS-Spool mochte das nicht. Also muss man die Artikel zum neuen Newsserver im Container feeden. Port 119 muss erreichbar sein (iptables forward), in der incoming.conf ist die LXD-Host-IP erlaubt zum Einliefern als Transit (NAT-IP).
Jetzt kann man vom alten System die News zum LXD-Container feeden:

```bash
cd /usr/local/news/db
 perl -ne 'chomp; our ($hash, $timestamps, $_) = split " "; \
 print "$_\n" if $_' history \
 | tr . / > /usr/local/news/spool/outgoing/list
 innxmit 192.168.0.43 list
```

Hinweise zur Maintenance von INN finden sich auch auf [https://www.eyrie.org/~eagle/faqs/inn.html#S6.4](https://www.eyrie.org/~eagle/faqs/inn.html#S6.4)

Viel Spass mit UUCP im Container.

[https://github.com/eumel8/puppet-gnuuuser](https://github.com/eumel8/puppet-gnuuuser)

