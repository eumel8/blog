---
layout: post
tag: cloud-computing
title: Citrix XenCenter
subtitle: "Mit dem Citrix XenCenter kann man virtuale Maschinen erstellen und verwalten. Es laeuft auf einem handelsueblichen PC, kann aber auch mit 2 Instanzen zur Hochverfuegbarkeitsloesung ausgebaut werden. Dazu bedarf es aber eine kostenpflichtigen Lizenz. "
date: 2014-05-07
author: eumel8
---

Mit dem Citrix XenCenter kann man virtuale Maschinen erstellen und verwalten. Es laeuft auf einem handelsueblichen PC, kann aber auch mit 2 Instanzen zur Hochverfuegbarkeitsloesung ausgebaut werden. Dazu bedarf es aber eine kostenpflichtigen Lizenz. Die Basisversion benoetigt zwar auch eine, aber die ist kostenlos und kann auch jedes Jahr kostenlos erneuert werden. Fuer den Hausgebrauch ist das voellig in Ordnung. 
<br/>
Als Fallbeispiele seien genannt:
<ul>
<li>Entwicklungs- und Referenzugebung fuer den eigenen Webauftritt</li>
<li>Testinstallationen beliebiger Software und beliebiger Betriebssysteme</li>
<li>Testen von verteilten Systemen wie Ceph, HDFS, Hadoop oder bloss verteilte Konfigurationen mit Puppet oder MCollective</li>
<li>Eigener Git-Server zur Softwareverwaltung</li>
<li>Eigener Backupserver, der Daten von Laptops und Rechnern einsammelt und auf einem "attached Storage" abspeichert</li>
<li>Snapshots ganzer Maschinen vor/nach Installationen und Updates</li>
<li>...</li>
</ul>
Jetzt koennte man auch sagen: Es gibt doch <a href="http://aws.amazon.com">AWS</a>. Bloss das Vorbereiten der virtuellen Maschinen ist doch relativ zeitaufwendig und wenn eine Maschine laenger als 24 Stunden laeuft, ist es relativ teuer. Fuer das Citrix XenCenter gilt: Home sweet home. Alle Daten bleiben zu Hause, die Maschinen koennen beliebig lange laufen.
Die Installation des XenCenter und auch die Bedienung ist recht intiutiv. Im <a href="http://www.citrix.com/downloads/xenserver/evaluations-and-trial-software/view-all-xenserver-trials.html">Citrix Downloadcenter</a> kann man sich ein CD-Image als Test- und Evaluierungsversion herunterladen. Eventuell ist eine kostenlose Registrierung auf citrix.com notwendig. 
Citrix XenCenter moechte eine kleine Festplattenpartition fuer sein eigenes System und ein eine grosse Festplatte als Speicher fuer die virtuellen Maschinen. Dort wird dann ein LVM angelegt, damit die Snapshotfunktion genutzt werden kann. Die Bedienung erfolgt mit einem Client, den man entweder separat runterlaedt oder ueber die Webschnittstelle des XenCenter-Servers bezieht (einfach http://<xencenter -IP> eingeben). Mit "Create VM" kann man dann seine erste virtuelle Maschine herstellen. Gast-Betriebssysteme kann man entweder ueber das CD-Laufwerk des XenCenter-Servers installieren oder man definiert ein Storage-Repository (SR) mit diversen ISO-Files. Natuerlich auch mit dem XenCenter-Client oder aber auch mit dem Kommando "xe", denn man kann sich auch mit ssh auf den XenCenter-Server einloggen und findet dort eine ganz normale Linux-Umgebung vor.
Von welchen Erfahrungen kann noch berichtet werden:
<ul>
 <li>
64-bit-Systeme koennen nicht als Gast auf der virtuellen Maschine (VM) installiert werden.
Problem mit alten Versionen von Citrix XenCenter (5.6.0), ab 6.0 behoben.
</li>
 <li>Update von 5.6.0 auf 5.6.1 bzw. 6.0 klappt nicht 
Problem in 6.2 geloest
</li>
 <li>Backup/Restore von VMs:

```bash
xe vm-export vm=gitlabci filename=gitlabci.vda
xe vm-import filename=gitlabci.vda
```

</li>
 <li>
Festplatte in VM zu klein (LVM/BTRFS/OpenSuSE):
VM herunterfahren
Diskspace der Disk im XentCenter fuer VM erwweitern.
VM starten und per root mit ssh einloggen:

```bash
pvdisplay
pvresize /dev/sdb
pvdisplay
lvdisplay
lvresize /dev/vg_data/lv_data -L +16G
lvdisplay
btrfs filesystem resize +16G /data
```

</li>
<li>
Festplatte in VM zu klein (LVM/EXT4/Ubuntu):
VM herunterfahren
Diskspace der Disk im XentCenter fuer VM erwweitern.
VM starten und per root mit ssh einloggen:
</li>
</ul>

```bash
fdisk /dev/xvda
Ansicht:
/dev/xvda1 2048 999423 997376 487M 83 Linux
/dev/xvda2 999424 41943039 40943616 19,5G 5 Erweiterte
/dev/xvda5 1001472 41943039 40941568 19,5G 8e Linux LVM
#
Linux LVM Partiion loeschen
Erweiterte Linux Partition loeschen
Neue erweiterte Partition anlegen
Linux Partition anlegen 
Typ auf 8e (lvm) aendern
Partitionstabelle schreiben
reboot
pvdisplay
pvresize /dev/xda
pvdisplay
lvdisplay
lvm lvresize /dev/ubuntu-vg/root -l+100%FREE
lvdisplay
resize2fs /dev/ubuntu-vg/root
```


Nach jahrelangen und dauerhaften Betrieb ist Citrix XenCenter uneingeschraenkt empfehlenswert.

Bezugsquellen: http://www.citrix.de/downloads/xenserver/evaluations-and-trial-software.html (veraltet)
