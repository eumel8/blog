---
layout: post
tag: container
title: Applikationen containerisieren mit LXD
subtitle: "Containerization, auch ein schoenes Wort. Klingt so bischen wie verdeutschen von Englisch. Also es geht um Anwendungen, die man von herkoemmlicher Infrastruktur in Container packen tut. Eigentlich muesste man ja Applikationen reverse engineeren (sic!)&hellip;"
date: 2016-06-05
author: eumel8
---

Containerization, auch ein schoenes Wort. Klingt so bischen wie verdeutschen von Englisch. Also es geht um Anwendungen, die man von herkoemmlicher Infrastruktur in Container packen tut. Eigentlich muesste man ja Applikationen reverse engineeren (sic!) und dann nach Container-Manier neu installieren. Was passiert bei brachialer Gewalt mit der Brechstange? Ein Selbstversuch
<br/>

Was ist eigentlich ein LXD-Container? Neben der ganzen Mimik drumrum und ZFS ist es am Schluss ein Verzeichnis auf der Festplatte:
<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
root@ubuntu:/var/lib/lxd/containers/s2# ls -l
insgesamt 3
-rw-r--r-- 1 root root 800 Jan 1 1970 metadata.yaml
drwxr-xr-x 2 100000 100000 2 Jun 5 19:22 rootfs
drwxr-xr-x 2 root root 5 Jun 5 09:32 templates
</code></pre><!-- /codeblock -->
Unter <strong>rootfs</strong> befindet sich quasi die System-Root des Container-Betriebssystems. 
Die <srong>metadata.yaml ist eine Steuerdatei mit Metadaten-Informationen zum den Container:
<!-- codeblock lang=xml line=1 --><pre class="codeblock"><code>
{
 "architecture": "x86_64",
 "creation_date": 1465087980,
 "properties": {
 "architecture": "x86_64",
 "description": "opensuse 13.2 x86_64 (default) (20160605_00:53)",
 "name": "opensuse-13.2-x86_64-default-20160605_00:53",
 "os": "opensuse",
 "release": "13.2",
 "variant": "default"
 },
 "templates": {
 "/etc/hostname": {
 "template": "hostname.tpl",
 "when": [
 "create"
 ]
 },
 "/etc/hosts": {
 "template": "hosts.tpl",
 "when": [
 "create"
 ]
 },
 "/usr/lib/systemd/system/dbus.service": {
 "template": "dbus.tpl",
 "when": [
 "start"
 ]
 }
 }
}
</code></pre><!-- /codeblock -->

Es wird also beschrieben, um welches Betriessystem es sich hier handelt, welche Version, Architektur usw. Dann werden noch 3 Templates aus dem template-Ordner angezogen, um dynamischen Content zu laden, wie etwa vom Containernamen den Hostnamen zu setzen in <strong>templates/hostname.tpl</strong>

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
{{ container.name }}
</code></pre><!-- /codeblock -->

Um jetzt einen LXD-Container von einer Applikation zu erstellen, brauchen wir erstmal einen normalen Container, bei dem zumindest das Betriebssystem gleich sein sollte. Wir nehmen dazu OpenSuSE:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
lxc remote add images https://images.linuxcontainers.org/ --public
lxc launch images:opensuse/13.2/amd64 s2
lxc stop s2 --force
</code></pre><!-- /codeblock -->

So, jetzt haben wir die Verzeichnissruktur von oben auf der Festplatte. Jetzt kann ich vom bestehenden Applikationsserver alle Daten rueberkopieren. Als Kandidat fuer den Applikationsserver steht mir mein <a href="http://www.gnuu.de">GNUU-Client</a> zur Verfuegung. Frueher war das ein richtiger physikalischer Rechner, der alles moegliche machte: UUCP, Mail, News, Datentransfer. Mittlerweile ist diese virtualisiert und man kann ihn auch als <a href="https://susestudio.com/a/s2wNPs/gnuu-user">Appliance im SUSE-Studio</a> runterladen. Zum Betrieb brauch man immer noch VMWare, KVM oder wie bei mir das Citrix XenCenter. Von der laufenden VM kopieren wir alle Daten auf den LXD-Host, auf dem unser Containter s2 mit dem GNUU-Client drauf laufen soll:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
# rsync -av /* 192.168.0.103:/var/lib/lxd/containers/s2/rootfs
</code></pre><!-- /codeblock -->

LXD-Container beinhalten eigentlich die ganz grosse Magie mit Device-Mapping und Mapping von UIDs, also Benutzer-IDs von Dateien und Prozesse. Im normalen Leben waere es das mit dem rsync schon gewesen, Allerdings werden bei LXD alle UID mit 100000 gemaped. Aus User root (uid 0) wird User root (uid 100000). Alle anderen UIDs und GIDs entsprechend hoeher. 
Wenn Permissions > 0 gesetzt werden, gehen SUID bits verloren. Also muss man die vorher sichern, damit man weiss, welche das gewesen sind. Gerade bei UUCP oder SMTP gibt es eine Handvoll Programme, die gerne mit den Bits versehen werden, damit normale Benutzer sie als root laufen lassen koennen. 
Nach dem Kopieren geht es als an das Sichern der Rechte und dann erhoehen aller Dateirechte mit +100000:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
cd /var/lib/lxd/containers/s2/rootfs
find . -perm -2000 > /tmp/s2_2000.txt
find . -perm -4000 > /tmp/s2_4000.txt
find . -perm -4000 > /tmp/s2_6000.txt
for i in `awk -F: '{print $3}' &lt; etc/group`; do find . -gid $i -exec chgrp $(( 100000 + $i )) {} +; done
for i in `awk -F: '{print $3}' &lt; etc/passwd`; do find . -uid $i -exec chown $(( 100000 + $i )) {} +; done
for i in `cat /tmp/s2_2000.txt`; do chmod +2000 $i; done
for i in `cat /tmp/s2_4000.txt`; do chmod +4000 $i; done
for i in `cat /tmp/s2_6000.txt`; do chmod +6000 $i; done
</code></pre><!-- /codeblock -->

Wenn der Applikationsserver eine statische IP-Adresse hatte, muss man eventuell in <strong>/etc/sysconfig/network/ifcfg-eth0</strong> das Interface auf DHCP stellen, damit es von LXD eine IP-Adresse und Einstellungen fuer /etc/resolv.conf (DNS) zu beziehen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
STARTMODE='auto'
BOOTPROTO='dhcp'
</code></pre><!-- /codeblock --></srong>

Jetzt ist es Zeit, den Container s2 zu starten:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
lxc start s2
lxc exec s2 -- bash
</code></pre><!-- /codeblock -->

Es funktioniert UUCP, SMTP (Postfix), Probleme gabs noch mit NEWS (inn). Normalerweise startet der als User news, aber das endete in Permission denied/Segmentation fault. Offenbar hat was mit den Dateirechten doch nicht ganz gestimmt. Als root gestartet funktioniert auch NEWS. Im Syslog gibt es noch seltsame Meldungen:

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
2016-06-05T22:24:20.006474+02:00 gnuuuser systemd[1]: Failed to start udev Kernel Device Manager.
2016-06-05T22:24:20.006616+02:00 gnuuuser systemd[1]: Starting udev Kernel Device Manager...
</code></pre><!-- /codeblock -->

Und es gibt noch keine Moeglichkeiten fuer ein OS-Upgrade. Aber die Anwendung laeuft erstmal im Container.
