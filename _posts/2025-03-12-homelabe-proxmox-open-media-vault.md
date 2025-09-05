---
layout: post
tag: inet
title: Homelab Proxmox Openmediavault
subtitle: Filme streamen mit altem Fernseher
date: 2025-03-12
author: eumel8
background: '/images/hollywood2.png?4362984378'
twitter: 'images/blog-eumel-de.png?4362984378'
---

# Einstieg

Wir alle werden immer älter, auch unsere Rechner. Bei mir zu Hause werkeln zwei Rechner, die deutlich älter als 10 Jahre sind. Auf einem laufen VMs im Citrix XEN Center - ein Produkt, dass es heute schon gar nicht mehr so gibt. Genaugenommen läuft auch nur eine VM drauf und darin einige LXD-Container, u.a. ein Gitlab mit zwei Runner. Der zweite Rechner hat Docker installiert, K3S und auch nochmal LXD als Backup.

Dazu kommt ein Filestorage WD MyCloud Home Duo (links im Bild):

<img src="/images/2025-03-12_1.jpg" />

Das Teil hat 2x4 TB, soll Filme im LAN streamen, die Workstations backupen, und auch Cloudspeicher von Google und Microsoft sichern. Das Problem: Der Support ist vor 2 Jahren ausgelaufen. Seitdem gehen keine Apps mehr und man kann es nur noch als Samba-Share im LAN verwenden (immerhin). Streamen hat noch nie funktioniert, da der Fernseher nur DLNA kann.

# Anforderungen

Wir brauchen also:

- einen modernen Rechner, der ausreichend schnell ist, die heutigen Aufgaben zu erfüllen, wie Sachen kompilieren oder gar ein wenig KI, um die zwei Rechner zu ersetzen
- genug Speicherplatz für Filestorage und Backups sein.
- eine Virtualisierunslösung als Ersatz für den Citrix

Das ganze soll möglichst länger als 4 Jahre halten (so alt war glaube ich das WD MyCloud), möglichst aus Open Source bestehen, das Budget wird mit maximal 1000 Euro festgesetzt.

# Minisforum MS-01

Inspiriert hat mich dieses Video. Das Proxmox NAS:

<iframe width="560" height="315" src="https://www.youtube.com/embed/IattZevg7xY?si=473S9Mbr7uWwmwNG" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

Gefällt mir eigentlich ganz gut. Andererseits schreckt mich das NAS schon wieder ab, denn es hat viel zu wenig RAM-Speicher und ist viel zu teuer. Es kostet leer schon fast tausend Euro. Und dann brauch man noch Festplatten. Eigentlich soll auch noch ein bisschen KI gemacht werden, also brauchen wir GPU, was bei so einem NAS schon mal die völlig falsche Adresse ist.

Im Beitrag wird aber das [Minisforum MS.01](https://minisforumpc.eu/products/ms-01?variant=42210216313015) erwähnt, ein leistungsstarker Mini-Rechner mit ausbaubarem Speicher und Platz für eine Grafikkarte.

<img src="/images/2025-03-12_2.jpg" />

650 Euro kostet das Teil mit 32 GB Ram und 1 TB Festplatte. Leider sind 2x16 GB RAM verbaut, sodass man beide Chips auswechseln muss, um auf 64GB Endausbau RAM zu kommen.

Hätte man wissen m0ssen und die Barebone-Variante gekauft und den RAM nachträglich bestückt:

<img src="/images/2025-03-12_4.jpg" />

Der RAM ist sogenannter Laptop-Ram und auch die Festplatten habe ich so noch nicht gesehen. 2 Steckplätze sind im Gerät noch frei, passen also noch 2 solche 4 TB SSD-Speicher-Chips rein:

<img src="/images/2025-03-12_3.jpg" />

Ich weiss, wieder Western Digital, eigentlich sollte man das nicht mehr kaufen. Richtigerweise zwei Tage später [die Nachricht](https://winfuture.de/news,149405.html), dass WD die nicht mehr herstellt. Super, drum waren die bei Amazon auch 3 Euro günsitiger als Vergleichsprodukte.

Einzubauen war alles relativ einfach. Nur das mit der KI Grafikkarte hatte nicht funktioniert. Irgendwie war die kleinste immer noch zu gross (RTX 3050). Der Trick war wohl die Abkürzung LP für Low Profile, aber die hätte dann statt 250 Euro gleich 700 gekostet, oder eine A2000 zum gleichen Preis. Also ohne externe Grafikkarte weiter (also man hätte die wohl tatsächlich extern betreiben können). Anschlüsse gibts am MS-01 genug: HDMI, USB, LAN, Netzteil ... ab geht's.

# Proxmox

[Proxmox](https://www.proxmox.com/en/) ist der Open Source Clone von VMware, der gerade gross Furore macht, da VMware aufgekauft wurde und der neue Eigentümer kräftig die Preise anzieht. Im privaten Sektor ist uns das egal, Proxmox läuft auch ohne Lizenz und lässt sich über den Installer, den man auf USB-Stick kopieren muss, um davon den MS-01 zu booten, wunderbar installieren.

Ein schickes Webfrontend verspricht eine einfache Bedienung:

<img src="/images/2025-03-12_5.jpg" />

Jetzt geht's an die Datenmigration vom Citrix Xen Center. Dort kann man die VMs exportieren mit:

```
xe vm-export filename=/mnt/nas/blue/xlxd.export vm=XLXD
```

Der Import bei Proxmox wäre mit 

```
qm disk import 102 /mnt/nas/blue/xlxd.vhd  nda
```

Das VHD-Format kriegt man mit 

```
qemu-img convert -f raw -O vpc output.raw output.vhd
```

Naja, eines der vielen Optionen, die ich probiert habe. Im Prinzip sind das alles LVM und sollte man irgendwie an die Daten rankommen. Allerdings hatte ich mehrere Festplatten an einer VM, und das LXD lief auf ZFS, was jetzt mit dem xe/qm nicht funktionierte. ZFS hat zwar sein eigenes Exportprogramm, was über ssh funktioniert. Zum Schluss habe ich aber einen leeren ZFS-Pool angelegt und die LXD-Container mit `lxc copy` auf den MS-01 verschoben. Wenn man dann noch die IP-Adressen beibehält, muss man gar nichts ändern, denn das Host-Betriebssystem der VM wurde ja mit der Root-Disk erfolgreich migriert. Natürlich sollte man das alte System ausschalten, wenn das neue läuft, sonst hat man doppelte IP-Adressen im Netz. Aber das ist ja per Mausklick überhaupt kein Problem.

# OpenMediaVault

[OpenMediaVault](https://www.openmediavault.org/download.html) ist ein File-Server-Dienst, der viele Spezifikationen bereithält. Installiert wird es wieder mit ISO-Image, was wir in unsere erste VM auf ProxMox laden. Dazu lädt man das ISO-Image aus dem Internet lokal runter und auf den ProxMox hoch, oder man lädt es gleich dort hin. Anschliessend erstellt man eine neue VM mit dem ISO-Image als Boot-Medium. Der File-Server-Dienst soll die 2 4TB-Disk als Raid bekommen. Die Anleitung gibt's oben im Video.

Einige Vorzüge, die OpenMediaVault anbietet:

- Multi-User-Mode und anonyme Gast-Account
- SMB Version 1-3
- NFS
- S3

und was mir besonders wichtig war:

- DLNA
- Microsoft OneDrive Sync

Dazu muss man das [Extra Plugin Repo](https://wiki.omv-extras.org/) installieren. Geht aber ganz einfach und dann sieht das so aus:

<img src="/images/2025-03-12_6.jpg" />

Man kann auf den Disks beliebige Dateisysteme installieren, auf diesen dann die Dienste wie SMB oder DLNA einbinden und dann die Shares dazu definieren.

Alsdann sollte unser OpenMediaVault im Netzwerk auftauchen und kann vom Windows-Rechner mit SMB angesprochen werden. Der Fernseher findet den DLNA-Share und kann damit die Filme abspielen.

# Fazit

Das OpenMediaVault hat mich nochmal überrascht. Mit so einer Funktionsvielfalt und guten Bedienung über Web rechnet man nicht bei einem Open Source Modell. Auch das ProxMox macht viel her, obwohl ich VMs in letzter Zeit nicht mehr so viel nutze. Hab jetzt wieder angefangen, ein Ubuntu-Template zu erstellen und in 0,nix kann man sich wieder mal schnell eine VM aufsetzen, um etwas auszuprobieren. Weitere Datenmigration war erstmal nicht nötig. Die alten Systeme können jetzt in den Ruhestand gehen.
