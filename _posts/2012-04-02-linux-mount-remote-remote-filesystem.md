---
layout: post
tag: general
title: Linux. Mount remote/remote Filesystem
subtitle: "Klar, in diesem Beitrag koennte es um NFS gehen - das Network File System, womit ein Server sein Dateisystem ueber Netzwerk anderen zur Verfuegung stellt. Dazu ist aber (wenn man es richig implementiert) root-Zugriff noetig und es ist eine eher dauerhaf&hellip;"
date: 2012-04-02
author: eumel8
---

Klar, in diesem Beitrag koennte es um NFS gehen - das Network File System, womit ein Server sein Dateisystem ueber Netzwerk anderen zur Verfuegung stellt. Dazu ist aber (wenn man es richig implementiert) root-Zugriff noetig und es ist eine eher dauerhafte Sache. Um schnell mal als normaler Benutzer durchs entfernte Dateisystem browsen zu koennen und Dateien oder Verzeichnisse zu kopieren, bietet sich <a href="http://www.novell.com/products/linuxpackages/opensuse102/sshfs.html">sshfs</a> an. Die Implementierung ist recht einfach. 
<br/>
Auf "meinem" Rechner muss das RPM sshfs installiert sein. Es hat einige Abhaengigkeiten zu fuse (File System Userland). Mit 
<code>modeprobe fuse</code> 
muss auch ein entsprechendes Kernelmodule geladen werden

Einen ssh-Account brauche ich natuerlich auf beiden Rechnern. 

Die Anwendung ist denkbar einfach: 
<code>
# sshfs zielrechner:/hadoop/data /home/user/hadoop
# mount
sshfs#zielrechner:/hadoop/data on /home/user/hadoop type fuse (rw,nosuid,nodev,max_read=65536,user=user)
</code>


Klar ist auch, dass der Zugriff wegen der Verschluesselung von ssh und der "nicht echten" Kernelimplementierung nicht so schnell wie NFS ist. Es ist aber eine einfache Moeglichkeit, als User auf entfernte Dateisysteme zuzugreifen und diese in meinem System zu benutzen.
