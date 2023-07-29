---
layout: post
tag: general
title: Rezepte und Kochbuecher - Puppet im taeglichen Einsatz
subtitle: "Frueher haben wir Perl programmiert. Das war schon ziemlich schlecht. Damit es besser wird, haben wir jetzt Ruuuuby"
date: 2012-10-03
author: eumel8
---

<p>"Frueher haben wir Perl programmiert. Das war schon ziemlich schlecht. Damit es besser wird, haben wir jetzt Ruuuuby!!!1"
</p>
<p>
Da ich mich in letzter Zeit vermehrt damit beschaeftigt habe, moechte ich noch einiges zu Puppet, dem Tool zum Konfigurationsmanagement im Cloud Computing verfassen. </p>
<br/>
<p>
Puppet kennen wir aus der 5-Minuten-Terrine, wo wir einen kompletten Applikationsserver in 5 Minuten aufsetzen. Die Arbeitsweise von Puppet war an der Stelle nur kurz umrissen, da es mehr um das Erstellen der virtuellen Maschine ging. Puppet ist ein ueberaus maechtiges Kochwerkzeug, was Konfigurationsdateien erstellen, aendern, loeschen kann, Programmpakete installiert oder deinstalliert, User anlegt oder loescht, Programme startet oder beendet - ja, sogar der ganze Rechner kann rebootet werden, wenn es durch eine Konfigurationsaenderung etwa am Kernel notwendig ist.
Die Arbeit des Puppet wird in Modulen, den sogenannten Rezepten definiert. Und wie es bei Rezepten so ist, kann es da beliebige Variationen fuer ein und dieselbe Suppe geben. 
</p>
<p>
Startdatei fuer das Puppet ist die init.pp. Man findet sie in allen Rezepten und auch dem Puppet selber im Unterverzeichnis manifests. In dem Verzeichnis befinden sich auch weitere Rezepte, jeweils mit der Dateiendung .pp, die ueber die site.pp included werden koennen. Das ist sowieso die grosse Staerke bei Puppet: includen, vererben, wiederverwenden. Es ist so bischen wie in der Kueche von Jamie Oliver, wo alle Zutaten irgendwo nochmal wiederverwendet werden. 
</p>
<p>
Ein weiteres wichtiges Verzeichnis in Modulen und in Puppet sind noch "files". Wie der Name schon sagt, kann man dort Files ablegen (muhahaha!), die von den Nodes nach Repetvorschlag des Puppetmaster einverleibt werden. Neben dem File-Storage eines jeden Modules kann man auch globale Verzeichnisse definieren, die etwa ueber S3, NFS, CIFS ins puppet eingebunden werden. 
</p>
<p>
Neben dem Lagerplatz fuer Kartoffeln, Gurken und Tomaten ist es Zeit, sich etwas den Gewuerzen unserer Suppe zu widmen. Im Verzeichnis "templates" befinden sich Dateien mit den Endungen <a href="http://ruby-doc.org/stdlib-1.9.3/libdoc/erb/rdoc/ERB.html">.erb</a>. 
</p>
<p>
Bei Templating kommt die Sache mit Ruby ins Spiel. Betrachten wir z.B. eine herkoemmliche Nagios-Konfiguration:
</p>
<p></p>
<!-- codeblock lang= line=1 --><pre class="codeblock"><code>

define host {
 use server
 address 192.168.0.101
 host_name vm1
}

define host {
 use server
 address 192.168.0.102
 host_name vm2
}

define host {
 use server
 address 192.168.0.103
 host_name vm3
}

</code></pre><!-- /codeblock -->
<p></p>
<p>
usw. - dasselbe dann nochmal fuer die Services. Es entstehen unendlich lange und unuebersichtliche Konfigurationsdateien. Wie waere es stattdessen mit 2 Templates:
</p>
host.erb:
<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
&lt;% node_array.each_pair do |key, value_hash| -%>
&lt;% if value_hash['monitor'] == "1" %>
define host {
 use server
 host_name &lt;%= value_hash['host'] %>.&lt;%= puppetdomain %>
 address &lt;%= value_hash['ip'] %>
}
&lt;% end -%>
&lt;% end -%>

</code></pre><!-- /codeblock -->
<p></p>
services.erb:

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>

&lt;% node_array.each_pair do |key, value_hash| -%>
&lt;% if value_hash['monitor'] == "1" %>
define service {
 use service
 host_name &lt;%= value_hash['host'] %>.&lt;%= puppetdomain %>
 service_description ping
 check_command check_ping!200.0,20%!500.0,60%
}
&lt;% end -%>
&lt;% if value_hash['monitor'] == "1" && value_hash['host'] == "fileserver" %>
define service {
 use service
 host_name &lt;%= value_hash['host'] %>.&lt;%= puppetdomain %>
 service_description Disk /dev/vdb1
 check_command check_nrpe_1arg!check_vdb1
}
&lt;% end -%>
&lt;% end -%>
</code></pre><!-- /codeblock -->
<p></p>
<p>
Fertig. Voraussetzung fuer die Nutzung waere die Definition der Variablen in einem hoeher gelegenen Rezept:
</p>
<!-- codeblock lang= line=1 --><pre class="codeblock"><code>

 $puppetdomain = "internal.mycloud.local"
 $node_array = {
 vm1 => { 'host' => 'vm1', 'ip' => '192.168.0.101', 'monitor' => '1' },
 vm2 => { 'host' => 'vm2', 'ip' => '192.168.0.102', 'monitor' => '1' },
 vm3 => { 'host' => 'vm3', 'ip' => '192.168.0.103', 'monitor' => '1' },
</code></pre><!-- /codeblock -->
<p></p>
<p>
Dokumentiert ist Puppet auf der <a href="http://puppetlabs.com/" target="_blank">Homepage von Puppetlabs</a> in <a href="http://docs.puppetlabs.com/puppet/2.7/reference/" target="_blank">http://docs.puppetlabs.com/puppet/2.7/reference/</a> (fuer die Version 2.7).
</p>
<p>
Praktische Beispiele sind auf <a href="http://www.puppetcookbook.com/" target="_blank">http://www.puppetcookbook.com/</a> beschrieben - so wie etwa Files angelegt werden oder Programme installiert werden.
</p>
<p>
Module sind gespeichert etwa auf <a href="https://www.google.de/search?q=puppet+site%3Agithub.com" target="_blank">Github</a> oder dem Sammelsurium auf <a href="http://forge.puppetlabs.com" target="_blank">http://forge.puppetlabs.com</a>, wo nach Kategorien sortiert ueber 500 Module verfuegbar sind. Fuer Nagios gibt es zum Beispiel ein Dutzend Variationen. 
</p>
<p>Wie geht man also jetzt vor? Als bequemster Weg waere der Download und die Installation eines fertigen Modules aus der Community. ABER: Welche Funktionen bietet das Modul an? Sind die gewuenschten Funktionalitaeten abgedeckt? Es gibt zum Beispiel ein Module zur Installation von MySQL, welches Datenbanken und Datenbankuser anlegen kann. Es koennen auch Datenbackups automatisch erstellt werden, aber nur von Datenbankrechner selber aus, weil es keine Variable fuer Datenbankserver gibt und stattdessen "localhost" als Servernamen statisch gesetzt ist. Dies rauszufinden bedarf sehr viel Zeit und die Loesung bedeutet dann eine Erweiterung des bestehenden Modules in Eigenregie oder komplettes Neuschreiben der Funktion oder gar des Modules. Deswegen muss man sich die Frage stellen, ob man sich darauf einlaesst, fremde Module zu benutzen oder alle Module bzw. Funktionen selbst zu schreiben. Die korrekte Antwort heisst wie immer: Kommt drauf an!
</p>
<p>
Puppet selbst bringt genug Funktionalitaeten mit, um Konfigurationsdateien von einer Stelle ins System zu verteilen. Deswegen macht Puppet auch auf einem Einzelsystem Sinn, obwohl es seine Faehigkeiten natuerlich bei sehr vielen Rechnern ausspielen kann. Die Konfiguation verschiedener Programme eines Rechners sind an einer Stelle zusammengefasst. Wichtig dabei aber ist: Aendere niemals etwas von Hand! Wenn eine Aenderung durch einen ersten puppet-Lauf nicht von Erfolg gekroent ist, liegt es meist an faehigen Abhaengigkeiten.
</p>
Ein Beispiel:

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>

 file { '/srv/www/htdocs/index.html':
 ensure => file,
 replace => no,
 content => "Hello GNUU",
 notify => Exec['fetch_gnuuweb'],
 require => [File['/srv/www/htdocs'],Package['wget']],
 }

 exec { '/bin/sh -c "cd /srv; /bin/tar xfz /mediacenter/gnuuweb.tgz"':
 alias => 'fetch_gnuuweb',
 refreshonly => true,
 require => Mount ["/mediacenter"]
 }
</code></pre><!-- /codeblock -->
<p></p>
<p> Fuer unseren Webserver-Content soll die index.html present sein. Wenn die fehlt, soll fetch_gnuuweb ausgefuehrt werden, der die Datei von einem Archiv auspackt, wozu aber der Mountpoint /mediacenter verfuegbar sein muss:
</p>

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>

 file {"/mediacenter":
 ensure => directory
 }

 file { '/etc/davfs2/secrets':
 ensure => file,
 content => "https://webdav.mediencenter.t-online.de xyxyxyxy@t-online.de zzzzzzzzzz",
 owner => root,
 group => root,
 mode => 600,
 }

 package { 'davfs2':
 ensure => present
 }

 mount { "/mediacenter":
 device => "https://webdav.mediencenter.t-online.de",
 fstype => "davfs",
 ensure => "mounted",
 options => "uid=root,gid=root",
 atboot => false,
 remounts => false,
 require => [Package['davfs2'], File['/etc/davfs2/secrets'], File['/mediacenter']],
 }
</code></pre><!-- /codeblock -->
<p></p>
<p>
Zum Anlegen der index.html ist ausserdem das Verzeichnis /srv/www/htdocs notwendig und das Programmpaket wget soll auch installiert sein. 
</p>
<p>
Puppet funktioniert also wie ein Workflow mit lauter Anweisungen, die nacheinander abgearbeitet werden. Alle Anweisungen bekommen danach einen Stempel aufgedrueckt: Fertig, erledigt! Wenn danach im System Sachen geaendert werden, die Puppet unter seiner Kontrolle hat, wird Puppet diese wieder rueckgaengig machen. Dazu laeuft der Client-Prozess staendig im Hintergrund. Werden also Dateien geloescht, wird Puppet diese wiederherstellen, werden Dateien geaendert, wird Puppet diese wieder rueckgaengig machen, werden Programme deinstalliert, wird Puppet diese wieder installieren. Aber ebend nur fuer die Prozesse im Workflow. Dieser beginnt nach der Installation des Betriebssystems von DVD oder ISO, in dem optimalerweise der erste Aufruf von puppet und die Installation des Clients schon eingearbeitet ist. Nur mit einer durchgaengigen Automatisierung kommt man zum Erfolg. 
</p>
<p>
Wer uebrigens mit Ruby nicht so bewandert ist, findet Hilfe etwa im <a href="http://wiki.ruby-portal.de/Hauptseite" target="_blank">Ruby-Portal</a> oder bei <a href="http://openbook.galileocomputing.de/ruby_on_rails/" target="_blank">Galileo-Computing</a>
</p>
<p>
Und demnaechst beschaeftigen wir uns dann mit <a href="http://www.opscode.com/chef/" target="_blank">Chef</a> :-)
</p>
<p>
<a href="http://www.pro-linux.de/artikel/2/1510/5,grundlagen.html" target="_blank">Artikel zu Puppet in Pro-linux</a>
</p>
<p></p>
