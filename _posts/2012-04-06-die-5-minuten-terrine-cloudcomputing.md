---
layout: post
tag: general
title: Linux. Die 5-Minuten-Terrine - Cloudcomputing vom Feinsten
subtitle: "EIne Frage an die Systemadministranten: Wie lange dauert es,  einen neuen Server aufzusetzen? So mit allem drum und dran? 5 Stunden? 5 Tage? Wie waere es mit 5 Minuten?! Folgendes Rezept zeigt die vollstaendige Virtualisierung und Automatisierung einer Linux Maschine"
date: 2012-04-06
author: eumel8
---

<p>Eine Frage an die Systemadministranten: Wie lange dauert es,  einen neuen Server aufzusetzen? So mit allem drum und dran? 5 Stunden? 5 Tage? Wie waere es mit 5 Minuten?!</p>
<br/>
<p>Folgendes Rezept zeigt die vollstaendige Virtualisierung und Automatisierung einer Systemlandschaft am Beispiel eine Installation von Joomla. 5 Minuten nach Auftragseingang soll der komplette Server mit Webpraesenz am Netz sein.</p>
<p>Los gehts:</p>
<div class="image_block"><a href="http://astore.amazon.de/wunschzettelc-21/detail/B003SE71JS"><img style="float: right;" src="/blogs/media/blogs/eumel/suppenterrine.jpg?mtime=1334329979" alt="" width="187" height="187" /></a></div>
<p></p>
<p>Zutaten:</p>
<ol>
<li>Herrkoemmlicher PC mit voll-virtualisierbarer CPU (jeder neuerer Intel)</li>
<li><a href="http://www.citrix.com/English/ps2/products/product.asp?contentID=683148&amp;ntref=prod_cat" target="_blank">XenServer</a> von Citrix (kostenlos in der Basisvariante ohne Hochverfuegbarkeit)</li>
<li>Eine virtuelle Instanz "puppetmaster" mit</li>
</ol> 
<ul>
<li>OpenSuse Betriebssystem, z.B. openSUSE 11.3</li>
<li>apache2, php5, dhcpd, bind, tftpd, puppet</li>
</ul>
<p>Vorbereitungen:</p>
<p>Die (einmaligen) Vorbereitungen nehmen schon einen gewaltigen Zeiraum ein. Man muss sich immer wieder fragen: Welche Installationsschritte muessen gemacht werden, welche Handlangertaetigkeiten gehoeren automatisiert. Der Weg zur Standardisierung lohnt sich aber. Am Ende werden wir nicht nur eine virtuelle Linux-Server-Instanz installiert haben, sondern ein hochdynamisches System besitzen, welches muehelos erweitert und angepasst werden kann.</p>
<p>Installation XenServer: Die Software kommt auf bootfaehiger <a href="http://www.citrix.com/English/ps2/products/feature.asp?contentID=2300356&amp;ntref=DLpromo2" target="_blank">CD</a> daher und moechte mindestens auf einer extra Festplattenpartition installiert werden. Bei der interaktiven Installation wird man nach IP-Adresse und festzulendes Admin-Passwort gefragt. Alles recht unspektakulaer. Wenn das XenCenter gestartet ist, bekommt man ein spartanisches Menue im DOS-Style zur Verfuegung gestellt. Man kann aber per HTTP und Browser auf die IP des XenServer zugreifen und von dort einen komfortablen Windows-Client herunterladen. Die Kommunikation mit dem XenServer erfolgt so ueber WEB und https-Verschluesselung</p>
<p>Konfiguration XenServer: Die Administration von Resourcen ist bei allen Virtualisierungsloesungen gleich (Vmware, Xen, AWS...):</p>
<ul>
<li>CPU</li>
<li>RAM-Speicher</li>
<li>Festplatten-Speicher</li>
<li>Netzwerk-Interface</li>
</ul>
<p>Um unsere virtuelle Instanz "puppetmaster" installieren zu koennen, tauschen wir die XenServer-Install-CD gegen eine OpenSUSE-Install-DVD in unserem physikalischen CD-Laufwerk. Im XenServer definieren wir ausserdem 2 Netzwerke:</p>
<ul>
<li>Netzwerk 0</li>
<li>Install LAN</li>
</ul>
<p>Unser "puppetmaster" bekommt auch 2 Netzwerk-Interface, 1 CPU, 6 GB Festplatte und ca. 512 MB RAM. Ueber den WIndows-Client laesst sich das recht komfortabel mit "New VM" zusammenklicken. Die Installation des Betriebssystems kann man im Consolen-Fenster der GUI durchfuehren. Am Schluss sollten wir einen Systemprompt und ssh-Zugriff auf den Rechner haben, um die restlichen Arbeiten ueber ein xterm oder putty durchfuehren zu koennen. WIr geben dem Rechner die IP-Adresse 192.168.0.10 fuer eth0 (Netzwerk 0) und 192.168.88.1 fuer eth1 (Install LAN). Defaultgateway soll 192.168.0.1 sein. Darueber gelangt der Rechner auch ins Internet.</p>
<p>Ueber das XenCenter sollte das CD-Laufwerk dem Host "puppetmaster" zugaenglich gemacht sein. Unter der Option "Storage" koennen wir dies kontrollieren (DVD Drive 0 on ...). Wenn dort die OpenSUSE-DVD drin liegt, koennen wir mit</p>
<p><code>mount /dev/dvd /mnt</code></p>
<p>auf "puppetmaster" die Installations-DVD mounten.Wir koennen auch das ISO-File downloaden und mit der loop-Option mounten:</p>
<p><code>mount -o loop </code>openSUSE-12.1-DVD-i586.iso /mnt/</p>
<p>Das Install-Medium machen wir durch unseren Webserver zugreifbar: /etc/apache2/conf.d/puppetmaster.conf</p>
<pre>Alias /mnt/ "/mnt/"<br /><br /> Options Indexes MultiViews<br /> AllowOverride None<br /> Order allow,deny<br /> Allow from all<br /><br /></pre>
<p><code>chkconfig apache2 on &amp;&amp; rcapache2 start </code></p>
<p>Jetzt sollten wir ueber http://puppetmaster/mnt auf das Installmedium zugreifen koennen.</p>
<p>Fuer die weiteren Virtual Machines erstellen wir uns am besten auf dem XenServer ein Template namens "autoyast". Diesem geben wir die Resource 1 CPU, 512 MB RAM, 6 GB Festplatte aber KEIN Netzwerk! Das konfigurieren wir spaeter dazu.  Es sind mindestens 512 MB noetig fuer YAST, das ist sehr gefraessig. Wenn wir weniger RAM konfigurieren, bricht die Installation irgendwann mal mit "exit code 137" ab und nach langem Suchen auf tty3 finden wir Melduingen zu "out of memory". Das sollte man sich ersparen. Ausserdem stellen wir die Boot-Reihenfolge in unserem Template auf</p>
<ol>
<li>"Boot from harddisk"</li>
<li>"Boot from network"</li>
</ol>
<p>Wir leben in der Annahme, dass auf der Festplatte kein boot-faehiges Betriebssystem installiert ist und dann immer von Netzwerk gebootet wird, um ein boot-faehiges Betriebssystem zu installieren. Anderenfalls muesste man mit Boot-Options im dhcpd arbeiten. Das geht zwar auch, ist aber nicht so toll. Wenn diese Massnahmen NICHT getroffen werden, kommt es zum Boot-Loop: Das System wird wieder und wieder neu installiert, weil es nicht mehr aus der Schleife rauskommt.</p>
<p>Installation DHCP:</p>
<p><code>zypper install dhcp-server</code></p>
<p>Konfiguration DHCP:</p>
<p>/etc/dhcpd.conf:</p>
<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
option domain-name-servers 192.168.88.1;
default-lease-time 600;
max-lease-time 7200;
ddns-update-style none; ddns-updates off;
log-facility local7;
subnet 192.168.88.0 netmask 255.255.255.0 {
 range 192.168.88.100 192.168.88.200;
 next-server 192.168.88.1;
 allow booting;
 allow bootp;
 option routers 192.168.88.1; <br /> filename "pxelinux.0";
}
</code></pre><!-- /codeblock -->
<p>chkconfig dhcpd on &amp;&amp; rcdhcpd start</p>
<p>Installation TFTP:</p>
<p><code>zypper install tftp</code></p>
<p>Konfiguration TFTP:</p>
<p>/etc/xinetd.d/tftp:</p>
<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
service tftp
{
 socket_type = dgram
 protocol = udp
 wait = yes
 flags = IPv6 IPv4
 user = root
 server = /usr/sbin/in.tftpd
 server_args = -s /srv/tftp/pxelinux.cfg
 disable = no
}
</code></pre><!-- /codeblock -->
<p>mkdir /srv/tftp/pxelinux.cfg &amp;&amp; chkconfig xinetd on &amp;&amp; rcxinetd start</p>
<p>Installation Booloader + AutoYast:</p>
<p>zypper install syslinux autoyast2 autoyast2-installation</p>
<p>cp /usr/share/syslinux/pxelinux.0 /srv/tftp/pxelinux.cfg/pxelinux.0</p>
<p>/srv/tftp/pxelinux.cfg/pxelinux.cfg/default</p>
<p> </p>

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
default linux
label linux
 kernel linux
 append initrd=initrd install=http://192.168.88.1/mnt/ autoyast=http://192.168.88.1/suse12.xml loghost=192.168.88.1
prompt 1
timeout 10
</code></pre><!-- /codeblock -->

<p> </p>
<p>Die Konfiguration von Autoyast ist <a href="http://www.suse.de/~ug/" target="_blank">hier</a> beschrieben. Es gibt auch viele nuetzliche Links und Beispiele. In einer Mailingliste findet man die meisten Antworten. Unser Autoyast-File heisst also suse12.xml und liegt auf dem Webserver des puppetserver. EIne Version befindet sich im Anhang des Postings. Was wird alles gemacht:</p>
<ul>
<li>Konfiguriere eine Festplatte und partiioniere sie mit / und swap</li>
<li>Deaktiviere die Firewall</li>
<li>Boote nach der Installation</li>
<li>Aktzeptiere alle Installsourcen egal mit welchem Key</li>
<li>Installiere einige Softwarepakete</li>
<li>Konfiguriere das Netzwerk auf eth1</li>
<li>Setze Zeitzone auf Germany und konfiguriere den Timeserver (wichtig fuer puppet)</li>
<li>Setze das root-Passwort</li>
<li>Starte einige Services</li>
<li>Fuehre einige POST-Scripte aus</li>
</ul>
<p>Eine POST-Scripte sind im xml enthalten, eines wird vom Webserver gezogen. myPostScript.sh haengt ebenfalls am Posting dran. Wir installieren die zwei rpm-Pakete fuer puppet von unserem puppet-server, da sie aus unerfindlichen Gruenden nicht auf dem normalen Repository zu finden sind. Mit</p>
<p><code>/usr/bin/puppet agent --test</code></p>
<p>klopfen wir am puppetmaster an. Der Default-Hostname in der Grundinstallation heisst "puppet". Wenn wir diesen im DNS auf unseren puppetmaster zeigen lassen, wird automatisch die richtige Verbindung hergestellt. Zum erfolgreichen Verbindungsaufbau muessen allerdings SSL-Zertifikate ausgetauscht und signiert werden. Mit unserem --test-Aufruf haben wir schon mal einen Zertifikatrequest an den puppetmaster geschickt. Dieser muss den anfragenden Host nun signieren. An dieser Stelle waere also wieder Handarbeit notwendig. Abhilfe schafft ein cron-Eintrag auf dem puppetmaster:</p>
<p><code>*/5 * * * * /usr/bin/puppet cert sign --all</code></p>
<p>Nicht sehr schick. Hier fehlt noch ein Shell/Perl-Script, was das Vorhandensein von neuen Zertifikat-Requests prueft und nur dann eine SIgnierung durchfuehrt.</p>
<p>puppet fragt zyklisch beim puppetmaster an, ob es etwas zu tun gibt. Wenn das Zertfikat signiert ist, hat die Verbindung Erfolg und unser Client holt seine Aufgaben ab. Aber welche?</p>
<p>puppet bekommen wir entweder als rpm wie in unserem autoyast-Script, oder als Source von http://puppetlabs.com/ . Es gibt immer eine kommerzielle und eine Freeware-Version. In der kommerziellen ist mehr Support und ein Dashboard dabei. Auf unserem puppetmaster-Server brauchen wir einen puppetmasterd-Prozess. Entsprechende Start-Scripts finden wir im Source-Paket. Zur Installation brauchen wir ruby. Die eigentliche Konfiguration finden sich in /etc/puppet - wie auf allen puppet-Clients auch. DIe Zertifikate liegen in einem anderen Verzeichnis. Wenn irgendwann mal was schiefgegangen ist und die Zertifizierung nicht klappen will, kann man den ganzen Kram auch loeschen:</p>
<p><code><code>find /var/lib/puppet -type f -print0 |xargs -0r rm</code></code></p>
<p>Danach ist eine neue Ausstellung von Zertifikaten und dessen Signierung notwendig - wenn sich z.B. der Hostname geaendert hat und die Konfig im puppet eh nicht mehr passt.</p>
<p>Die weitere Konfiguration unterteilt sich in modules und maniefests.</p>
<p>module sind zum Beispiel "apache" und desen Konfiguration liegt in einem eigenen Unterverzeichnis. Dort gibt es ein weiteres Unterverzeichnis "files". Das sind Dateien, die wir von puppet verwalten wollen. Da ist zum Beispiel</p>
<ul>
<li>apache2 (Startdatei fuer /etc/sysconfig/apache2)</li>
<li>vhost.conf (Konfigurationsdatei fuer einen virtuellen Host)</li>
<li>hallowelt.cnt (unsere "Startseite" fuer unsere Webpraesenz und exemplarisch fuer weiteren Content</li>
</ul>
<p>Im Unterverzeichnis "manifests" gibt es eine init.pp:</p>
<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
class apache2 {
Package { ensure => "installed" }
$enhancers = [ "apache2", "apache2-mod_php5", "apache2-mod_perl" ]

package { $enhancers: }
# package { apache2: ensure => latest}
# package { apache2-mod_php5: ensure => latest }

file { "/etc/apache2/vhosts.d/vhost.conf":
 notify => Service["apache2"], # this sets up the relationship
 ensure => "present",
 source => [
 "puppet:///modules/apache2/vhost.conf"
 ],
}
file { "/etc/sysconfig/apache2":
 notify => Service["apache2"], # this sets up the relationship
 ensure => "present",
 source => [
 "puppet:///modules/apache2/apache2"
 ],
}

# create a directory 
file { "/srv/www/hallo.welt.eumel.local/":
 ensure => "directory",
}

file { "/srv/www/hallo.welt.eumel.local/index.html":
 ensure => "present",
 source => [
 "puppet:///modules/apache2/hallowelt.cnt"
 ],
}

# define the service to restart
service { "apache2":
 ensure => "running",
 enable => "true",
 require => Package["apache2"],
}

}
</code></pre><!-- /codeblock -->
<p>Die Syntax ist eigentlich recht selbsterklaerend:</p>
<ul>
<li>Das Paket apache2 soll mit php5 installiert sein.</li>
<li>Die Systemkonfig kommt von "uns".</li>
<li>Die Konfig fuer den VHost kommt von uns.</li>
<li>DIe Document-Root fuer den VHost  ist angelegt und enthaelt unsere Startseite.</li>
<li>Der apache2-Service laeuft</li>
</ul>
<p>Damit passiert jetzt folgendes:</p>
<ul>
<li>Wenn das Paket apache2 nicht installiert ist oder deinstalliert wird, wird es wiederhergestellt</li>
<li>Wenn die Systemkonfig geaendert wird, wird sie wieder neu ueberschrieben</li>
<li>Wenn die VHost-Konfig geaendert wird, wird sie wieder neu ueberschrieben</li>
<li>Wenn die Document-Root geloescht wird, wird sie neu angelegt und der Content neu kopiert</li>
</ul>
<p>Es passiert nicht weniger. Aber auch nicht mehr. Wenn anderen Konfigurationsdateien geaendert werden, obliegt das nicht in der Hoheit von puppet sie zurueckzuaendern - wenn sie nicht im maniefest irgendwo hinterlegt sind.</p>
<p>So kann man dann mit einzelnen Diensten beispielsweise /etc/passwd oder sudo-Eintraegen fortfahren. Alle Konfigurationsparameter sind auf <a href="http://www.puppetcookbook.com" target="_blank">http://www.puppetcookbook.com</a> beschrieben.</p>
<p>Noch ein letzter Tip fuer die Installation. WIr machen unserem Vhost den Garaus:</p>
<p><code>dd if=/dev/zero of=/dev/sda1 bs=512 count=1</code></p>
<p>Das sind bis jetzt aber nur die Arbeiten im Hintergrund. Fuer unsere Kunden muss man noch ein passables Frontend zur Verfuegung stellen. Eine gute Veranlagung fuer die Verbindung der einzelnen Komponenten ist Cobbler. <a href="http://suse.gansert.net/?p=42" target="_blank">Hier</a> ist eine Anleitung fuer OpenSuSE. Cobbler ist in erster Linie ein Frontend fuer Fedora, was aber auch mit anderen Betriebssystemen kompatibel ist. Leider erfuellt es nicht ganz die Beduerfnisse des Szenarios, was wir uns oben schon aufgebaut haben. SO fehlt zum Beispiel die Anbindung an unser XenCenter.  Klar kann man das auch irgendwie in Cobbler implementieren, aber mit CodeIgniter habe ich selbst ein Frontend fuer unseren puppetmaster geschrieben. Es arbeitet zustandlos, speichert also keine Passwoerter oder Daten und kann die <a href="http://docs.vmd.citrix.com/XenServer/6.0.0/1.0/en_gb/api/" target="_blank">API des XEN-Centers</a> bedienen. Eine Vorab-Version befindet sich im Anhang.</p>
<p></p>
<div class="image_block"><a href="/blogs/media/blogs/eumel/suppenterrine_m.jpg?mtime=1334329995"><img src="/blogs/media/blogs/eumel/suppenterrine_m.jpg?mtime=1334329995" alt="" width="462" height="283" /></a></div>
<p></p>
<p>Damit waere das Rezept fuer unsere 5-Minuten-Terrine abgeschlossen. Aaaaber, leider kommt noch ein Aber zum Schluss ;)</p>
<p>Leider haben wir unterwegs unsere neue Maschine verloren. Der Server wuerde vom Netz booten, bekommt eine zufaellige IP-Adresse, fuer den fehlen die Rezepte im puppet, der Endanwender kriegt niemals mit, ob die neue Maschine verfuegbar ist, wie sie heisst und wie er sich einloggen kann.</p>
<p>Also, ToDo's:</p>
<ol>
<li>Die Konfiguration des DHCP-Servers ist doch nicht so ganz trivial. Im Prinzip brauchen wir 2 DHCP-Server fuer beide Netze. Die Wahl der IP-Adresse koennen wir nur im "Install-LAN" dem Zufall ueberlassen. Fuer "Network 0" haben wir die Wahl: IP-Adresse statisch vergeben und dafuer extra-autoyast-File fuer jeden Host erstellen. IP-Adresse dynamisch zuweisen lassen und dafuer das Config-File vom dhcpd im "Network 0" selbst verwalten</li>
<li>Die Auswahl des Install-Types im Frontend ist funktionslos. Bis jetzt gibt es keine Verbindung vom Frontend zum puppet, wie es dafuer notwendig waere.</li>
<li>Parallel-oder Massenverarbeitung ist so noch nicht ganz problemlos moeglich. Das Frontend hat auch keine Authentifizierung und das root-Passwort ist so ueberall gleich. In Bestimmten Umgebungen mag dies aktzeptabel sein. Sonst faellt der Weg zurueck auf Cobbler.</li>
<li>Die DNS-Konfiguration ist so noch nicht automatisiert. Es fehlt ein Eintrag fuer unsere hallo.welt-Domain und dem eigentlichen Host. Letzteres sollte auch ueber den DHCP im "Network 0" moeglich sein.</li>
<li>Unser neuer Host sollte in ein zentrales Monitoring (zum Beispiel Nagios) mit eingebunden werden. </li>
</ol>
<p>Fazit: Ein bischen was gibt es noch zu tun. Den Beweis der erfolgreichen Installation bleibe ich diesmal noch schuldig B)</p>
