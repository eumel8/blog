---
layout: post
tag: general
title: Vollautomatisches Monitoring mit  Nagios
subtitle: "Die totale Ueberwachung wuenscht im reellen Leben niemand aber in der Cloud um so mehr. Ein vollautomatisches Monitoring fuer seine virtuellen Maschinen waere schon schick. Es wurden dazu auch Unmengen von Tools gebaut und Projekte geschaffen. Ganze Fir&hellip;"
date: 2013-05-12
author: eumel8
---

<p>
Die totale Ueberwachung wuenscht im reellen Leben niemand aber in der Cloud um so mehr. Ein vollautomatisches Monitoring fuer seine virtuellen Maschinen waere schon schick. Es wurden dazu auch Unmengen von Tools gebaut und Projekte geschaffen. Ganze Firmen haben ihr Geschaeftsmodell darauf ausgerichtet. Schlussendlich, bei all der ganzen Toolfrage, landet man erstaunlicherweise wieder bei Nagios.
</p>
<br/>
<p>
Als erstes gibts da ein paar Ideen:
</p>
<ul>
 <li><a href="https://docs.google.com/document/d/1rtrwrSEsXXM5gwaH7cUSkJ-pMbnmedMTdgvONO5k728/">http://blog.gurski.org/index.php/2010/01/28/automatic-monitoring-with-puppet-and-nagios/</a>
</li>
 <li><a href="http://www.fullyautomatednagios.org/">http://www.fullyautomatednagios.org/</a>
</li>
 <li><a href="http://projects.puppetlabs.com/projects/1/wiki/Nagios_Patterns">http://projects.puppetlabs.com/projects/1/wiki/Nagios_Patterns</a>
</li>
 <li><a href="https://docs.google.com/document/d/1rtrwrSEsXXM5gwaH7cUSkJ-pMbnmedMTdgvONO5k728/">https://docs.google.com/document/d/1rtrwrSEsXXM5gwaH7cUSkJ-pMbnmedMTdgvONO5k728/</a>
</li>
</ul>
<p>
Die Idee ist also, wir verwalten unsere Maschinen mit Puppet und haben Nagios als Basiselement fuer ein Monitoring und konfigurieren optimalerweise zu jedem definierten Service auch den Monitor (und zum Beispiel auch die Firewallregeln aus einem <a href="https://forge.puppetlabs.com/puppetlabs/firewall">Firewall-Modul</a>). Weitere Zutaten fuer die Suppe waeren Grundparameter zum Monitoring (also Erreichbarkeit, CPU, Memory, Diskspace) und grundlaufende Prozesse wie sshd, cron, ntpd usw. Fuer letzteres waere so ein Autodiscovery nicht schlecht. Schauen wir mal, was man daraus machen kann.
</p>
<p>
Unser Puppet Module zerfaellt in mehrere Teile.
</p>
<ol>
<li>
Nagios Client (aka NRPE): NRPE-Server installieren, lokale Default-Checks ausfuehren, definierte Service-Checks ausfuehren, System auf Services und Prozesse untersuchen, NRPE-Config erstellen und per facter exportieren.
</li>
<li>
Nagios Server (Kollektor): Nagios-Server installieren, von Puppet konfigurierte Checks einsammeln, vom Client erstellte Checks einsammeln
</li>
<li>
Nagios Server (Monitor): Alle gesammelten Checks ausfuehren und Ergebnisse aufbereiten.
</li>
</ol>

<p>
Teil 1 und 3 sind relativ einfach. Wir benutzen Puppet einfach als Filestore, der die verschiedenen Dateien wie HTML-Dateien, Bilder und statische Konfigurationsdateien vorhaelt und auf den definierten Host kopiert. Dazu werden notwendige Programmpakete installiert und die Services ueberwacht und ggf. gestartet, fertig.
</p>
<p>
In Teil 2 brauchen wir die Interaktion, die Puppet ueber exportierte Resourcen bereitstellt. Das bedeutet, dass die einzelnen Nodes bestimmte Resourcen anderen Hosts zur Verfuegung stehen. Typischerweise ist dies der Puppetmaster-Host, der diese Informationen in der PuppetDB speichert. Die PuppetDB ist zwingend erforderlich, kann aber natuerlich auch woanders laufen:
</p>
/etc/puppet/puppet.conf:
<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
storeconfigs = true
storeconfigs_backend = puppetdb
</code></pre><!-- /codeblock --> 

/etc/puppet/puppetdb.conf
<!-- codeblock lang= line=1 --><pre class="codeblock"><code>

[main]

server = wingui.dsl.eumel.local
port = 8081

</code></pre><!-- /codeblock -->
<p></p>
<p>
Zur Installation der PuppetDB und dem Puppetmaster sei auf die einschlaegige Dokumentation verwiesen. Im Puppet sind schon diverse Resourcen enthalten, zum Beispiel
</p>
<pre>
# puppet resource package
package { 'ConsoleKit':
 ensure => '0.4.5-6.2.2',
}
package { 'SuSEfirewall2':
 ensure => '3.6.282-1.1.1',
}
package { 'aaa_base':
 ensure => '12.1-533.1',
}
package { 'aaa_base-extras':
 ensure => '12.1-533.1',
}
...
</pre>
<p>
Hier ist dann auch klar, wenn in der package-Definition eines Rezepts "latest" drinsteht, dass Puppet einfach die Nummern vergleicht und immer das Paket mit der groessten Nummer installieren wird. Aber Resourcen und Resourcentypen kann man beliebig erweitern, um sie zum Beipspiel als "fact" in einem Rezept weiterverwenden zu koennen. Fuer Nagios ist eine Erweiertung aber gar nicht notwendig, da das schlauerweise in Puppet mit eingebaut worden ist. <a href="https://codeclimate.com/github/puppetlabs/puppet/Puppet::Provider::Naginator">Naginator</a> ist ein Provider fuer Puppet, der Host- und Service-Defintionen bereitstellt. Die Resourcen kann man sich zum Beispiel mit 
</p>

<pre>
# puppet resource nagios_host
nagios_host { 'kifaru.eumelnet.de':
 ensure => 'present',
 address => '62.141.42.223',
 alias => 'kifaru',
 target => '/etc/nagios/nagios_host.cfg',
 use => 'cloud-host',
}
nagios_host { 'www.eumel.de':
 ensure => 'present',
 address => '62.141.43.200',
 alias => 'uucp',
 target => '/etc/nagios/nagios_host.cfg',
 use => 'cloud-host',
}
</pre>

ansehen. In der Node-Defintion saehe das so aus, um zum Beispiel einen Host zum Monitoren als exportierte Resource hinzuzufuegen:

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
 @@nagios_host {'www.eumel.de':
 use => 'cloud-host',
 address => '62.141.43.200',
 host_name => 'www.eumel.de',
 alias => 'www.eumel.de',
 }

</code></pre><!-- /codeblock --> 
<p></p>
<p>
Im Module werden alle exportierten Resourcen einer Sorte zusammengefuegt und letztlich in ein Stueck Nagios-Konfigurations-Datei reingeschrieben:

</p>

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>

# collect resources and populate /etc/nagios/nagios_*'cfg
Nagios_host &lt;<||>> {
 target => "/etc/$target/nagios_host.cfg",
 notify => Service['nagios']
}

</code></pre><!-- /codeblock -->
<p></p>
<p>
Also immer und immer wieder, falls sich eine Resource aendert. Somit ist die Konfigurationsdatei nicht mehr wichtig sondern vielmehr die Definition zum Erstellen derselben im Puppet.
</p>
<p>
Weiter oben beschrieb ich aber auch, dass Resourcen beliebig erweitert werden koennen fuer Facts. Facts kann man sich anschauen zum Beispiel mit:
</p>

<pre>
# facter -p ipaddress
62.141.42.223
</pre>

Die Erweiterung findet statt in dem selbst definierten Fact nagios_ext_services 

<pre>
# facter -p nagios_ext_services
define service {
 use cloud-service
 host_name kifaru.eumelnet.de
 service_description Proc amavisd
 check_command check_nrpe_1arg!check_amavisd
}
define service {
 use cloud-service
 host_name kifaru.eumelnet.de
 service_description Proc anvil
 check_command check_nrpe_1arg!check_anvil
}
... 
</pre>
<p>
Die Nagios-Checks werden generiert aus der Datei "/etc/nagios/nagios_ext_services.cfg", die durch das Programm "/usr/local/bin/collect_checks.pl" auf dem Node erstellt werden. 
</p>
Eine Defintion fuer den Nagios-Server sieht im Manifest ungefaehr so aus:
<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
 class {'nagios::server':
 engine => 'icinga',
 http_users => {
 admin => { 'password' => '$apr1$x6DQznUt$hh05hGiXnBzfi4m0iKlty1' },
 },
 twilio_account => 'Adw3d01c3757bbdwdww74d0adwdw48a88e',
 twilio_identifier => '5fa5d3f4ff248b7c8e4dsds2d5d8',
 twilio_from => '%2B18482425771',
 twilio_to => '%2B4917212345670',
 }
</code></pre><!-- /codeblock -->
<p></p>
<p>
<a href="https://codeclimate.com/github/puppetlabs/puppet/Puppet::Provider::Naginator">Twilio</a> ist ein SMS-/Voice-Call-Dienst, der ueber eine API-Schnittstelle verfuegt, also hervorragend geeignet fuer unsere Nagios-Notifizierung.
</p>
<p>
Tja, und letztlich, unser Nagios ist gar kein Nagios sondern Icinga. Dieses und andere Ueberraschungen gibt es im Nagios-Puppet-Module auf https://github.com/eumel8/nagios
</p>
<p></p>
