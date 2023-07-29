---
layout: post
tag: cloud-computing
title: Backe Backe Linux II (physikalische und virtuelle Rechner aufsetzen mit razor-server)
subtitle: "Im letzten Jahr berichtete ich ueber ein Tool namens Razor, mit dem es moeglich ist, automatisiert (quasi wie beim Broetchenbacken) Betriebssysteme auf noch jungfraeuliche Rechner zu installieren. DIe schlechte Nachricht ist: Razor wird nicht mehr gepflegt;"
date: 2014-09-09
author: eumel8
---

Im letzten Jahr berichtete ich ueber ein Tool namens "Razor", mit dem es moeglich ist, automatisiert (quasi wie beim Broetchenbacken) Betriebssysteme auf noch jungfraeuliche Rechner zu installieren. DIe schlechte Nachricht ist: Razor wird nicht mehr gepflegt. Die gute Nachricht ist: Es gibt jetzt Razor-Server.
<br/>
Razor-Server unterscheidet sich grundsaetzlich in der Bedienung vom bisherigen Razor. Nur das Prinzip blieb erhalten: Ich boote einen Rechner ueber das Netz ein Minibetriebssystem, welches von Razor bereitgestellt wird, der Rechner checkt beim Razor ein und je nach der konfigurierten Policy wird ein Betriebssystem X mit entsprechenden Settings installiert. Der Broker uebergibt die fertige Maschine an das Konfigurationsmanagement Puppet oder Chef.
<p></p>
Wie fangen wir da am besten an? Die Installationsanleitung ist auf https://github.com/puppetlabs/razor-server/wiki/Installation beschrieben. Wir brauchen erstmal einen Rechner am besten mit 2 Netzwerkinterfaces eth0 (das Install-LAN) und eth1 (das Daten-LAN). 
Defaultgateway liegt am eth1:

```bash
# cat /etc/network/interfaces
auto lo
iface lo inet loopback

auto eth0
iface eth0 inet static
 address 172.16.227.1
 netmask 255.255.255.0

auto eth1
iface eth1 inet static
 address 192.168.0.65
 netmask 255.255.255.0
 gateway 192.168.0.1
```

Als Betriebssystem kommt Ubuntu 12.04 LTS zum Einsatz. Es reichen 6 GB Festplattenkapazitaet und 512 MB RAM. Ubuntu 12.04 ist schon etwas angestaubt, weswegen wir uns die Apt-Source von Puppetlabs besorgen und die neueste Version von Puppet installieren:

```bash
# wget -q https://apt.puppetlabs.com/puppetlabs-release-precise.deb 
# dpkg -i puppetlabs-release-precise.deb
# apt-get update
# apt-get upgrade
# apt-get install puppet puppetmaster
# puppet -V
3.7.0
```

Das A und O bei Puppet ist natuerlich eine gute Namensaufloesung. Dazu installieren wir das Programm dnsmasq:

```bash
# apt-get install dnsmasq
```

Wir editieren die Datei /etc/dnsmasq.conf, um einen Upstream-Server zu setzen, den dnsmasq fuer nicht selbst verwaltete Hostnamen fragen kann:

```
server=192.168.0.10@eth1
```

Der wichtigste Hostname steht in der /etc/hosts. Unser Razor-Server mit seiner IP-Adresse im Install-LAN:

```
172.16.227.1 razor.eurazor.local razor
```

Jetzt starten wir dnsmasq neu:

```
# /etc/init.d/dnsmasq restart
# host razor.eurazor.local 127.0.0.1
Using domain server:
Name: 127.0.0.1
Address: 127.0.0.1#53
Aliases:

razor.eurazor.local has address 172.16.227.1
```

Sieht gut aus. 
Unser erstes Puppet-Manifest installiert die Postgresql, die wir fuer razor-server brauchen:
/etc/puppet/manifests/postgresql.pp

```
class { 'postgresql::globals':
 manage_package_repo => true,
 version => '9.2',
}->

class { 'postgresql::server': }

postgresql::server::db { 'razor':
 user => 'razor',
 password => postgresql_password('razor', 'mypass'),
}
```

```
# cd /etc/puppet/modules
# puppet module install puppetlabs-postgresql
# cd /etc/puppet/manifests
# puppet apply postgresql.pp
```

Und weil das so gut geklappt hat, installieren wir so auch razor-server:

```
# cd /etc/puppet/modules
# puppet module install puppetlabs/razor
# puppet apply -e 'include razor'
```

Razor-Server wird sogar automatisch gestartet, aber das ist noch gar nicht erforderlich, denn wir muessen ja erst die Konfiguration anpassen. Dazu muss in /opt/razor die config.yaml.sample nach config.yaml umbenannt und der Connectionstring zur Postgresql angepasst werden: 

```
production:
 database_url: 'jdbc:postgresql:razor?user=razor&amp;password=mypass'
```


```bash
root@razor:/opt/razor# /etc/init.d/postgresql status
9.2/main (port 5432): online
root@razor:/opt/razor# /etc/init.d/razor-server restart
Stopping razor-server: . done.
Launching razor-server: done.
Waiting 30 seconds for start: .................... done.
root@razor:/opt/razor# /etc/init.d/razor-server status
razor-server is running (pid 16454)
```

Jetzt muss bloss noch das Datenbankschema fuer die Produktionsumgebung angelegt werden:

```bash
# razor-admin -e production migrate-database
```

Das Script sollte fehlerfrei durchlaufen, andererseits ist die Verbindung zur Datenbank zu ueberpruefen.
<p></p>

Wo ein Server da natuerlich auch ein Client. Der Client "razor" ist eine eigenstaendige Applikation und er wird als Rubygem installiert. Als Abhaengigkeit hat er den Rest-Client, der in der neuen Version auch gleich Ruby 1.9 haben will. Vielleicht etwas uebertrieben und es tut auch eine nicht so neue Version:

```bash
# apt-get install rubygems libarchive-dev
# gem install rest-client -v 1.6.8
# gem install razor-client
`` 

Testen kann man die Funktion mit 

```bash
# razor help
`` 

Eine laengere Liste der moeglichen Befehle, die die angesprochene API auf Port 8080 unterstuetzt, sollte ausgegeben werden. Ansonsten muss man in den Logs unter /var/log/razor-server/ nach der Ursache der Nichtfunktion suchen.
<p></p>
Widmen wir uns nun dem Bootprozess der zu installierenden Clients. Der TFTP-Service und die notwendigen Bootfiles hat der Razor-Server-Installationsprozess schon nach /var/lib/tftpboot bzw. /etc/xinet.d/tftp kopiert. Der xinetd-Prozess sollte also laufen.
Als naechstes brauchenwir einen DHCP-Server:

```bash
# apt-get install isc-dhcp-server
```

Die Datei /etc/puppet/modules/razor/examples/isc-dhcpd-example.conf kann man nach /etc/dhcp/dhcpd.conf kopieren und macht entsprechende Anpassungen fuer domain-name-servers, domain-name und den verwendeten IP-Adressen des Install-LANs und unseres Razor-Servers dadrin.
Als naechstes brauchen wir das Bootimage, welches Razor-Server zum Checkin der Clients verwendet. 

```bash
# cd /var/lib/razor/repo-store
# wget "http://links.puppetlabs.com/razor-microkernel-latest.tar"
# tar xf razor-microkernel-latest.tar
```

Der zu installierende Client will vielleicht mal ein paar Pakete aus dem Internet herunterladen. Dazu routen wir am besten die Netzwerktraffic ueber unseren Razor-Server:

```bash
# iptables -A FORWARD -o eth1 -i eth0 -s 172.16.227.0/24 -m conntrack --ctstate NEW -j ACCEPT
# iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
# iptables -t nat -A POSTROUTING -o eth1 -j MASQUERADE
# sysctl -w net.ipv4.ip_forward=1
```

Wenn wir jetzt einen Client im Netz des Install-LANs booten, sollte er vom DHCP-Server des Razor-Servers eine IP-Adresse bekommen, weiter ueber PXE booten und ueber TFTP das Bootimage booten. Das erfolgreiche Checkin ueberpruefen wir sofort:

```bash
# razor nodes
From http://localhost:8080/api/collections/nodes:

+----------------+--------+-------------------+-------+--------+
| metadata count | tags | dhcp_mac | name | policy |
+----------------+--------+-------------------+-------+--------+
| 0 | (none) | 3e:c6:24:98:13:4c | node1 | --- |
+----------------+--------+-------------------+-------+--------+

Query an entry by including its name, e.g. `razor nodes node1`
```

Weitere sinnvolle Kommandos sind "razor nodes node1 state" oder "razor nodes node1 log"
Die naechsten Schritte sind die Erstellung eines Repository, eines Brokers und einer Policy.
Das Repository liegt als ISO-Image irgendwo in unserem DATA-LAN:

repo.json

```json
{
 "name": "ubuntu-12.04.i386",
 "iso-url": "http://192.168.0.10/isos/ubuntu-12.04.2-server-i386.iso",
 "task": "ubuntu_precise_i386",
}
```

```bash
# razor create-repo --json repo.json
```

Wir nutzen den Puppetmaster auf unserem Razor-Server zur weiteren Behandlung:

puppet.json

```json
 {
 "name": "my_puppet",
 "configuration": {
 "server": "razor.eurazor.local",
 "environment": "production"
 },
 "broker-type": "puppet"
 }
```


```bash
# razor create-broker --json puppet.json
```

In einer Policy legen wir root-Passwort, Hostname und Task fest:

ubuntu.json

```json
{
 "name": "ubuntu-for-small",
 "repo": "ubuntu-12.04.i386",
 "task": "ubuntu_precise_i386",
 "broker": "my_puppet",
 "enabled": true,
 "hostname": "node${id}",
 "root_password": "hasi",
 "max_count": 20,
 "tags": []
}
```

```bash
# razor create-policy --json ubuntu.json
```

Wenn wir "razor tasks" eingeben, finden wir schon ein paar Betriebssystem-Templates vor, die das entsprechende Betriebssystem automatisch installieren sollen. Die Files dazu liegen in /opt/razor/tasks/. ubuntu_precise_i386.task/metadata.yaml verweist auf das Verzeichnis ubuntu.task/, indem sich Rezepte fuer die verschiedenen Phasen der Installation befinden. In preseed.erb koennen wir Zeitzone setzen und Keyboardlayout. Sehr wichtig ist auch die zu formatierende Festplatte. Haben wir wirklich eine /dev/sda im Angebot? Oder ist es nicht eher eine /dev/xvda. Wenn alles passt, installiert sich das System automatisch.
Nach Abschluss der Installation erfolgt die Uebergabe per Broker zu Puppet. Sagen wir mal, wir wollen ein Wiki auf unserem neuen Rechner installieren In /etc/puppet/modules holen wir uns ein paar Puppetmodule:

```bash
# puppet module install puppetlabs-apache
# puppet module install puppetlabs-mysql

# wget https://github.com/saz/puppet-memcached/archive/master.zip
# unzip master.zip
# mv puppet-memcached-master/ memcached
# rm master.zip

# wget https://github.com/eumel8/puppet-mediawiki/archive/master.zip
# unzip master.zip
# mv puppet-mediawiki-master/ mediawiki
# rm master.zip
```

Die Datei /etc/puppet/manifest/site.pp wird mit folgendem Inhalt erstellt:

```
node /node/ {

 class { 'mysql::server':
 root_password => '82f4eafb-44fb-4c4e-96cc-cbe43297186d' ,
 }

 database { 'frank':
 charset => 'latin1',
 }

 database_user { 'frank@localhost':
 password_hash => mysql_password('3b1a9a0f-0c03-4468-a847-3205b89b1cc9'),
 }

 database_grant { 'frank@localhost/frank':
 privileges => ['all'] ,
 }

 mediawiki::new { "wiki.eurazor.local":
 admin => 'f.kloeker@telekom.de',
 serveralias => 'wiki', #Default to $name
 ip => '*', #IP for apache configuration. Default to *
 targetdir => '/wikis'
 }
 ->
 class {'memcached':}

}
```

Damit das laestige Zertifikatsignierung automatisch geschieht, muss noch in /etc/puppet/puppet.conf in der Rubrik [master] die Option "autosign = true" gesetzt werden und ein /etc/init.d/puppetmasterd den Dienst damit neu starten.

Apropos neu starten. Mit

```bash
# razor delete-node --name=node1
```

loeschen wir die Registrierunng unseres Clients. Nach einem Reboot wuerde wieder das Checkin beginnen und die Neuinstallation. 
Ansonsten hat der Client den Flag "installed: true" und bootet das normale Betriebssystem. 
Mit "tags" kann ich die Installation in der Form steuern, welches Betriebssystem installiert wird. Beim Checkin sammelt der Razor-Server alle Informationen ueber den Client als fact:

```bash
# razor nodes node1 facts

From http://localhost:8080/api/collections/nodes/node6:

 netmask_eth0: 255.255.255.0
 netmask_eth1: 255.255.255.0
 blockdevice_xvda_size: 6442450944
 processorcount: 1

```

Man koennte so zum Beispiel den Fact processorount als Flag einrichten, um alle Clients mit einer CPU mit Ubuntu_i386 zu installieren. 

flag.json

```json
 {
 "name": "small",
 "rule": ["=", ["fact", "processorcount"], "1"]
 }
```

```bash
# razor create-tag --json flag.json.
```

Den Tag "small" muss man dann in der entsprechendn Policy oben (ubuntu.json) einfuegen. Die Policies kann man aber auch disablen, wenn man sie nicht brauch oder eine andere Policy bevorzugt werden soll. 

Fazit: In Razor-Server ist zwar alles neu, aber nach Darstellung der Entwickler mit Version 0.15 noch keineswegs fuer den Produktionsbetrieb geeignet. Tatsaechlich Probleme gab es beim Testen, dass der Client nach dem Boot des Mikrokernels nicht inventarisiert wird. Da half bloss Loeschen und neu uebers Netz booten, bis es klappt.

Dokumentation: [https://github.com/puppetlabs/razor-server/wiki/Getting-started](https://github.com/puppetlabs/razor-server/wiki/Getting-started)
