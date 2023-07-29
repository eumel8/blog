---
layout: post
tag: cloud-computing
title: OpenSUSE 13.2 serviert per autoyast und puppet
subtitle: "Das Update auf eine neue Version des Betriebssystems steht wieder einmal an. Seit Version 13 hat sich bei OpenSUSE einiges getan. Startscripts vermisst man in /etc/init.d und ebenso die Logfiles in /var/log - allenfalls Fragmente sind noch da."
date: 2015-04-01
author: eumel8
---

Das Update auf eine neue Version des Betriebssystems steht wieder einmal an. Seit Version 13 hat sich bei OpenSUSE einiges getan. Startscripts vermisst man in /etc/init.d und ebenso die Logfiles in /var/log - allenfalls Fragmente sind noch da. Stattdessen sollte man sich mit neuen Tools wie systemctl und journalctl fuer Diensteverwaltung und Logfile-Management vertraut machen. Entsprechend ruppig verlief auch der Onlineupgrade von 12.3 auf 13.2 im Testsystem auf der heimischen Cloud. Mit 32-bit-System ging gar nichts mehr. Erst mit 64-bit-System war die Installation eines neuen Systems moeglich. 
<br/>
Ursache koennte eine wiederum zu alte Version von Xen-Center sein, wo alle Testsysteme laufen. Zwar kann man im Xencenter kostenlos auf 6.2.2 updaten, jedoch kosten weitere Updates und Patches extra, Aber das ist eine andere Baustelle, zurueck zu OpenSUSE 13.2. Bzw. Rolling Distribution like Tumbleweed. Das Projekt von OpenSUSE befindet sich gerade im Umbruch. Die neueste Version basiert auf 13.2 und soll quasi versionslos fortgesetzt werden - immer mit den neuen Paketversionen ohne die laestigen Versionsspruenge mit Historie der letzten 3 Versionen, weswegen man mit 12.3 ebend schon wieder outdatet ist. 
Aber jetzt los. Unsere Systemkonfiguration wird verwaltet von Puppet. Bislang hatten wir dazu einen puppetmaster, dort lief dann ein Syncjob, der die Manifeste zur Systemkonfiguration immer aus dem GIT gezogen und nach einigen Tests auf den Pfad fuer Manifeste im puppetmaster gsynct hat:

```bash
GITROOT="/srv/git"
GITCOPY="/srv/git_ok"
GITUSER="git"
GITSERVER="gitlab.eumel.local"
GITREPO="eumel/eumelnet.git"
GITPROJECT="eumelnet"
ADMIN="git@eumel.de"

cd $GITROOT/$GITPROJECT
 /usr/bin/git reset --hard HEAD

if test $? = 128; then
 logger "git fetch has error no environment"
 echo "`/bin/hostname` has git errors no environment. Please check" | /usr/bin/mailx -s "git environment errors on puppet managed host" $ADMIN
 exit 1
fi
/usr/bin/git clean -f -d
/usr/bin/git pull origin $BRANCH

if test $? != 0; then
 logger "git pull has error to connect"
 echo "`/bin/hostname` has git errors on pull. Please check" | /usr/bin/mailx -s "git environment errors on puppet managed host" $ADMIN
 exit 1
fi

/usr/bin/find $GITROOT/$GITPROJECT/puppet -type f -name "*.erb" | xargs /usr/bin/erb -P -x -T '-' | /usr/bin/ruby -c
if test $? = 1; then
 logger "git fetch has error templates"
 echo "`/bin/hostname` has git errors. Please check" | /usr/bin/mailx -s "git template errors on puppet managed host" $ADMIN
 exit 1
fi

find $GITROOT/$GITPROJECT/puppet -type f -name *.pp | xargs puppet parser validate
if test $? = 0; then
 /usr/bin/rsync -a --delete $GITROOT/$GITPROJECT/ $GITCOPY/$GITPROJECT
else
 logger "git fetch has error"
 echo "`/bin/hostname` has git errors. Please check" | /usr/bin/mailx -s "git errors on puppet managed host" $ADMIN
 exit 1
fi
```

Ja, ganz nett. Fassen wir mal die Nachteile des Vorgehens zusammen: 
<ul>
 <li>Ich brauche einen laufenden puppetmaster incl. Zertifikate fuer Client und Server</li>
 <li>Aenderungen in der Konfiguration werden nie sofort sondern spaetestens nach 30 Minuten, wenn der Puppet Agent laeuft, durchgefuehrt</li>
 <li>Der Puppet Agent brauch fuer meine alten betagten Systeme schon erhebliche Systemresourcen</li>
 <li>Durch die rasche Weiterentwicklung von Puppet in den letzten Monaten entsteht immer mal wieder ein Versionsmischmasch, welches nur durch die Einbindung zusaetzlicher Repos in Suse zu baendigen sind</li>
</ul>

Mit <strong>puppet apply</strong> lassen sich aber auch Manifeste lokal auf einen Rechner deployen. Man brauch bloss die erforderlichen Module auf jedem Rechner. 
Unsere site.pp sieht so aus:

```bash
# reference
node default {
 Package{
 allow_virtual => "true",
 install_options => "--force-resolution"
 }
 class {'my_repo':
 osversion => '13.2'
 }
 ->
 file {'/data/':
 ensure => directory,
 }
 include eumelnet::systems
 include eumelnet::mysql
 include eumelnet::services::named
 include eumelnet::services::saslauthd
 include eumelnet::services::dovecot
 include eumelnet::services::postfix
 include eumelnet::services::apache2
 include eumelnet::services::clamd
 include eumelnet::services::amavisd
 include eumelnet::services::dkimproxy
 include eumelnet::services::sqlgrey
 include eumelnet::services::policyd-weight
}
```

Der Grossteil unseres Manifests fuer den Node "default" (damit ist grundsaetzlich jeder gemeint) beschaeftigt sich mit dem Modul "eumelnet", bei dem diverse Services installiert und konfiguriert werden, wobei dann in dem Modul auf weitere Module zurueckgegriffen werden kann. Meist wird aber nur mit file-Option die Konfiguration 1:1 vom Modul ins Livessystem kopiert.
Auf /data befinden sich alle Livedaten wie Document-Root vom Websever, MySQL-DB-Files usw. Eine Besonderheit ist die Package-Deklaration:

```bash
 Package{
 allow_virtual => "true",
 install_options => "--force-resolution"
 }
```
Irgendwie ist der Aufruf des Package-Manager zypper in OpenSUSE 13.2 nicht ganz sauber. Bei Kollisionen kommt es bei zypper install immer wieder zu Rueckfragen oder Abbruch, was bei einer automatisierten Installation nicht so guenstig ist. Hilfreich ist die Option force-resolution, bei der immer der erste Vorschlag zum Loesen von Konflikten bei zypper angenommen wird.

Wie in <a href="http://blog.eumelnet.de/blogs/blog8.php/opensuse-netzinstallation">OpenSuSE Netzinstallation</a> beschrieben, praeparieren wir unseren Installserver mit einem OpenSUSE 13.2 Image und kopieren Kernel und Initrd vom Image ins laufende System. Unser Eintrag im Grub-Menue sieht ungefaehr so aus:

```bash
title Netboot Autoyast -- openSUSE 13.2
 root (hd0,1)
 kernel /boot/vmlinuz.install noapic \
 install=http://192.168.0.20/suse132 hostip=192.168.0.53 netmask=255.255.255.0 \
 autoyast=http://192.168.0.60:82/eumelnet.xml \
 gateway=192.168.0.1 nameserver=192.168.0.10
 initrd /boot/initrd.install
```

Der Installserver hat die IP-Adresse 192.168.0.20 und hat einen laufenden Webserver, bei dem unter /suse132 das Image gemountet ist. Unser Server mit dem neuen System soll unter 192.168.0.53 erreichbar sein, Gateway ist die 192.168.0.1 und unter 192.168.0.10 ist der Nameserver erreichbar. Nameserveraufloesung ist sehr wichtig, da puppet bzw. facter einige Variablen im DNS aufloesen moechte. Die autoyast-Konfiguration (und das ist der Unterschied zur Installation ueber netssh), ist auf dem Host 192.168.0.60 Port 82 erreichbar. Die vollstaendige XML-Datei fuer Autoyast befindet sich im Anhang. Im Wesentlichen werden folgende Aufgaben erledigt: Netzwerkkonfiguration, Formatierung der ersten Festplatte, Einbinden der zweiten Festplatte, Installieren einiger Programmpakete, Starten sshd. Ueber User-Scripts werden noch weitere Repositories eingebunden, damit z.B. puppet installiert werden kann. Yast autoyast bietet uebrigens einen Editor zum Erstellen und Veraendern solcher XML-Dateien. Der wahrscheinlich interessante Part ist vielleicht dieser hier:

```
 <script>
 <debug config:type="boolean">false</debug>
 <filename>eumelnet_conf</filename>
 <location><![CDATA[]]></location>
 <source><![CDATA[zypper up; zypper -n -q install puppet; rpm -ivh http://192.168.0.60:82/eumelnet-conf-reference_latest.rpm]]></source>
 </script>
 <script>
 <debug config:type="boolean">false</debug>
 <filename>eumelnet_install</filename>
 <location><![CDATA[]]></location>
 <source><![CDATA[puppet apply -l /tmp/manifest.log --modulepath /etc/puppet/modules /etc/puppet/manifests/site.pp]]></source>
 </script>
```

DIe Scripts laufen in der Sektion init-skripts, die nach der Installation einmal ausgefuehrt werden. Im ersten Script wird direkt mit zypper puppet installiert und das RPM mit der Konfiguration vom selben Host installiert, auf dem auch das Autoyast-XML ausgeliefert wird. Das RPM enthaelt die aktuelle Konfiguration unseres Referenz-Servers in Puppet-Manifest. Erstellt haben wir es mit fpm durch Aufruf in unserem GIT-Repo:

```bash
#!/bin/sh
BRANCH=`git rev-parse --abbrev-ref HEAD`
DATE=`date +%s`
fpm -s dir -t rpm -d 'puppet' -v "$BRANCH-$DATE" \
 -n eumelnet-conf -a all \
 -x .git -x .gitmdules \
 --rpm-auto-add-directories \
 --replaces eumelnet-conf \
 --description "Eumelnet Configuration package" \
 --prefix /etc/puppet .
```

Durch Installieren des RPMs werden also nur Puppet-Modue und Manifests unter /etc/puppet ausgerollt. Mit einem zweiten Userscript m Autoyast-xml wird puppet gestartet, der das Manifest mit all seinen Anweisungen ausrollt. Nach dem automatischen Reboot haben wir unser fertig laufendes System.

Links: 
<ul>
 <li><a href="https://www.suse.com/documentation/sles11/book_autoyast/data/book_autoyast.html">SUSE Autoyast Doku</a></li>
 <li><a href="http://www.tcm.phy.cam.ac.uk/~mr349/suse/autoyast.html">More Usecases with Autoyast</a></li>
 <li><a href="http://users.suse.com/~ug/autoyast_doc/">Originaldoku von Uwe Gansert</a></li>
 <li><a href="https://github.com/jordansissel/fpm">FPM Package Builder</a></li>
</ul>
