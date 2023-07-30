---
layout: post
tag: general
title: openSUSE Netzinstallation
subtitle: "Neulich stellte sich das Problem, dass der Webhoster des Vertrauens keine neuen Betriebssystemversionen in seinem Administrations-Webfrontend zum Administrieren seines Root-Servers angeboten hat. Was bleibt, ist der Wechsel des Anbieters oder der Wechse&hellip;"
date: 2013-05-03
author: eumel8
---

<p>Neulich stellte sich das Problem, dass der Webhoster des Vertrauens keine neuen Betriebssystemversionen in seinem Administrations-Webfrontend zum Administrieren seines Root-Servers angeboten hat. Was bleibt, ist der Wechsel des Anbieters oder der Wechsel auf ein neues Produkt. Eine andere Version ist die Moeglichkeit der Remote-Installation im Selbstbau. Bei Suse gibt es (wenn man PXE-Boot aussen vor laesst), noch 2 andere Moeglichkeiten:</p>
<br/>
<p>1: <a href="http://de.opensuse.org/SDB:Fern_Installation" target="_blank">Manuelle Ferninstallation</a></p>
<p>Zunaechst braucht man eine entfernte Installationsquelle (die man am besten noch selbst unter Kontrolle hat). Dazu lade man sich die Betriebssystemversion seiner Wahl als iso-Image runter, mounte dieses und stellt es per Webserver zur Verfuegung:</p>
<pre># wget "http://download.opensuse.org/distribution/12.1/iso/openSUSE-12.1-DVD-x86_64.iso"
# mkdir /suse
# mount -o loop openSUSE-12.1-DVD-x86_64.iso /suse
</pre>
<pre>cat <<EOF>/etc/apache2/conf.d/suse.conf
 Alias /suse/ /suse/<br /> <Directory /suse/><br /> Options +Indexes +FollowSymLinks<br /> Order allow,deny<br /> Allow from all<br /> </Directory><br /> 
EOF
rcapache2 restart
</pre>
<p>Auf dem neu zu installierenden Rechner befindet sich eine alte Version von Suse oder eines anderen Linux-System mit GRUB Bootloader. Dort macht man einen neuen Eintrag in /boot/grub/menu.lst:</p>
<pre>title Boot -- openSUSE 12.1
 root (hd0,0)
 kernel /boot/vmlinuz.install noapic usessh=1 sshpassword="12345678" \
 install=http://192.168.0.121/suse hostip=192.168.0.123 netmask=255.255.255.0 \ 
 gateway=192.168.0.1 nameserver=192.168.0.1
 initrd /boot/initrd.install
</pre>
<p>Bedeutet: 192.168.0.121 ist der Installserver (siehe oben), unser Rechner hat die IP-Adresse 192.168.0.123, Default-GW und Nameserver ist jeweils die 192.168.0.1. Mit default=XX kann man den Menueeintrag aktivieren.</p>
<p>Jetzt muss man das den neuen Kernel vom Installserver herunterladen:</p>
<pre>cd /boot
wget --output-document=vmlinuz.install http://192.168.0.121/suse/boot/x86_64/loader/linux
wget --output-document=initrd.install http://192.168.0.121/suse/boot/x86_64/loader/initrd
</pre>
<p>und den Rechner neu booten. Danach sollte man sich mit ssh -X root@192.168.0.123 einloggen koennen (Passwort 12345678) und kann mit "yast" die Installation beginnen.Nach dem Reboot ist noch ein /usr/lib/YaST2/startup/YaST2.ssh auszufuehren</p>
<p>2: <a href="http://en.opensuse.org/openSUSE:SUSE_Studio_Disc_Image_Howtos#How_to_copy_an_image_into_hard_disc" target="_blank">Neues Image installieren</a></p>
<p>Bei dieser Variante wird der zu installierende Rechner mit einem Rettungssystem gebootet. Der Hoster bietet diese Moeglichkeit meist zur Reparatur von Problemen mit dem Kernel oder Bootloader an.  Das Betriebsystem laeuft zur Bootzeit im RAM und das eigentliche Betriebssystem ist auf /dev/hda oder /dev/sda erreichbar. Man startet nun ein Netzwerk-Socket mit</p>
<pre>netcat -l 0.0.0.0 12345 | dd of=/dev/sda<br /></pre>
<p>Auf einem anderen Rechner lade man sich das Disk-Image eines Betriebssystems herunter, was man sich etwa mit Suse-Studio erstellt hat und leite dies an das Netwerksocket des Zielrechners weiter:</p>
<pre>wget "http://susestudio.com/download/91a2c96d4d50210df26e4e3f7696bc37/Eumelnet64.x86_64-0.0.1.oem.tar.gz"<br />tar xvfz Eumelnet64.x86_64-0.0.1.oem.tar.gz<br />dd if=Eumelnet64.x86_64-0.0.1.raw | netcat 192.168.0.132 12345<br /></pre>
<p> </p>
Wenn das Kopieren beendet ist, kann man wahlweise mit "mount /dev/sda1 /mnt" das neue System mounten und etwa die Netzwerkkonfiguration noch anpassen oder das neue System einfach booten.
