---
layout: post
tag: general
title: LXD Update Ubuntu 24.04
subtitle: "Nighmare on Elm Street"
date: 2025-05-20
author: eumel8
---

Ubuntu 20.04. kommt zum Ende seiner Lebenszeit, und genau zum Ende diesen Monats. Höchste Zeit also, bestehende Rechnerlandschaften upzudaten.

LXD halte ich schon viele Jahre die Treue, ein Zwischending zwischen Docker Containern, Juju und Kubernetes. Man läd einfach mit dem lxc Client ein Image herunter und kann entsprechend darin Sachen installieren und konfigurieren. Mit ZFS Backend kann man die LXD Container snapshoten oder auf andere LXD-Instanzen kopieren. Deswegen gibt es für die Prod-Umgebung noch eine Backup-Instanz und eine Referenz-Umgebung. In der Regel werden dort auch die Updates ausprobiert. 
Im Container ist das relativ unkritisch. Geht ein Update schief oder gab es einen Einbruch, kann man einfach den letzten Snapshot zurückspielen, den man nächtlich anlegt. Geht der ganze Host verloren, gibt es auch relativ wenig Aufwand, um die Container aus dem Backup-System wieder in die Prod-Umgebung zu bringen.

Knackpunkt bleibt trotzdem der Host, denn in der Regel ist das physikalische Hardware, die irgendwo im Rechenzentrum steht. Mein Hoster hält auch einen seriellen Konsolendienst bereit, um per iLO auf den Rechner zuzugreifen. Das Ding ist state of the art 2010 und so ist das schon das erste Abenteuer, sich lokal ein Java einzurichten, was dann die Verbindung herstellt, falls das Netzwerk oder der Kernel beim Update kaputtgeht. In der Referenz-Umgebung hatte ich schon so einen Fall, dass die udev-Config angepasst werden musste, weil Ubuntu 24.04 sonst keine Netzwerkinterface findet. Blöd eigentlich.
Man bräuchte dann sowas:

/etc/udev/rules.d/10-network.rules

```
SUBSYSTEM=="net", ACTION=="add", ATTRS{address}=="42:2f:d2:f8:b4:23", NAME="eth0"
```

mit `udevadm  control --reload-rules`


Aber soweit kam es nicht. 

Es war viel schlimmer!

Passende Geschichte für den Linux-Stammtisch:

Aufgabe war also das Update von Ubuntu 20.04 auf 24.04. Keine grosse Sache. Erst kam natürlich der Zwischenschritt auf Ubuntu 22.04. Das dauerte vielleicht eine Stunde. Nach dem Reboot hatte ich das LXD auf den Ubuntu-Branch upgedatet, weil der LXD Fork Incus irgendwas mit ZFS nicht kann. So war es jedenfalls in der Referenz-Umgebung. Also geschwenkt mit

```
snap refresh --channel=5.0/edge lxd
```

Und schon hat man ein Ubuntu-supportes LXD. Und das war wahrscheinlich der Fehler, denn den Schritt hatte ich im Prod nach dem 22.04 Update gemacht und nicht wie in der Referenz nach dem 24.04 Update. WOZU HAT MAN EINE REFERENZ-UMGEBUNG!!!!^1

Naja, als letzten Schritt nach dem Release-Update kam wie immer die Frage, ob man obselete Pakete löschen will. Na klar, gibt ja neuen Stuff! Bisschen komisch kam es mir dann schon vor, dass er snapd, zfs und lxd Pakete löschen wollte. Aber gut, waren vielleicht die alten....

WAREN ES NICHT!!!

Nach dem Neustart des 24.04 Systems fühlte sich alles sehr leicht und schnell an. Jaaaa, gab ja auch kein LXD mehr und kein ZFS!!! WARUM???? 

Also gut, mit obigem Befehl LXD wieder installiert. Das ZFS-Programm-Paket liess sich auch auch wieder installieren und mit `zfs import meinpool` war ZFS wieder verfügbar und alle Daten waren noch da. ZFS ist eine eigene Partition auf den Festplatten und Ubuntu war so gnädig, den Pool nicht komplett zu löschen.

Gut, jetzt hatte man ZFS Storage mit den Containern und ein LXD, neu. Das wusste natürlich nichts von Containern. 

Es gibt eine `lxd recover` Funktion, um nach verlorengegangen Containern im Storage zu suchen. Schön, hatte aber nicht funktioniert. Die, die er gefunden hatte, jammerte er an, weil es Snapshots dazu gab. Ja, natürlich. 

Die nächste Idee von ChatGPT war, einen neuen Container zu erstellen und dann im ZFS den Pfad zum Container umzubenennen, nachdem man den gerade erstellen ZFS-Eintrag für den Container gelöscht hat.

Also

```
lxc init ubuntu:24.04 meincontainer -s meinpool
zfs destroy meinpool/lxd/containers/meincontainer # meinpool/lxd ist der neue LXD storage Endpunkt statt meinpool
zfs rename meinpool/containers/meincontainer meinpool/lxd/containers/meincontainer
lxc start meincontainer
```

JA! Da ist er wieder, mit allen alten Daten.

Aber gleich das nächste Problem: Die File-Permissions waren alle oberhalb von 100000. Also Dateien mit Besitzer `root:root` gehörten 100000:100000 statt 0:0.

Irgendwas mit [VFS idmap shifting im Linux Namespace](https://discuss.linuxcontainers.org/t/migrating-a-volume-from-an-lxd-3-0-container-to-an-lxd-5-0-container-with-a-couple-hundred-million-files-in-it/16135). Gelesen habe ich davon vieles, funktioniert hat davon nichts. Auch den Container bzw. das Profile auf `secure.priviledged` zu setzen, änderte nichts an den File-Permissions. Ich befand mich sowieso schon im unsupporteten Gefilde.

Nun ja, ChatGTP stellte dann einen Einzeiler zur Verfügung, um alle File-Permissions -100000 zu setzen.

Also:

```
lxc stop meincontainer
mount -t zfs meinpool/lxd/containers/meincontainer /mnt
cd /mnt/rootfs
find . -xdev -exec bash -c 'for f; do s=$(stat -c "%u %g" "$f"); set -- $s; uid=$1; gid=$2; if (( uid >= 100000 )); then uid=$((uid-100000)); fi; if (( gid >= 100000 )); then gid=$((gid-100000)); fi; chown "$uid:$gid" "$f"; done' _ {} +
```

Es dauert ewig, abunzu gibts Fehler, weil er Symlinks nicht findet. Man hätte noch ein `chroot /mnt/rootfs bash` machen sollen.

Danach klappts aber

```
cd /
umount /mnt
lxc start meincontainer
```

Puh, läuft wieder alles.




Ach, nochwas: ein Container bekam aus unerfindlichen Gründen immer zwei IP-Adressen vom DHCP zugewiesen. Stört ja local nicht weiter. Aber doch. Es war der Webserver Container, der keine Verbindung mehr zum Datenbank Container bekam, weil die Datenbank dort Zugriffsbeschränkungen auf den Hostnamen des Webserver Containers hat. Passte natürlich nicht mehr, wenn versucht wird, sich mit der falschen IP zu verbinden. Im dnsmasq lease stand immer "*" als Hostname drin.
Es waren viele Fragen beim ChatGPT notwendig. Dann die Ursache: Neben systemd-networking war auch netplaner.io installiert und dort hatte das cloud-init Paket eine Konfigurationsdatei für dhcp abgelegt. Beide Dienste fragten jetzt beim DHCP-Server eine IP an und bekamen auch jeweils eine zugewiesen. Das Löschen der cloud-init dhcp config und letzlich das Löschen des netplanner Pakets beendete den Spuk. Webserver und Datenbank konnten wieder miteinander reden.
