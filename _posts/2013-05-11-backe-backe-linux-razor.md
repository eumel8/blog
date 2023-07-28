---
layout: post
tag: general
title: Backe Backe Linux - Rechner aufsetzen mit Razor
subtitle: "Metal-to-Cloud Application Lifecycle Management - was fuer ein cooles Wort. Genauso bezeichnen die Macher von Razor ihr neues Baby, mit dem es ein leichtes sein soll, neu angelieferte Hardware in Kuerze zu katalogisieren und mit einem neuen Betriebssyst&hellip;"
date: 2013-05-11
author: eumel8
---

Metal-to-Cloud Application Lifecycle Management - was fuer ein cooles Wort. Genauso bezeichnen die Macher von Razor ihr neues Baby, mit dem es ein leichtes sein soll, neu angelieferte Hardware in Kuerze zu katalogisieren und mit einem neuen Betriebssystem zu bestuecken. Wie geht:
<br/>
<p>
Razor kommt mit einem Buendel von Softwarekomponenten, die alle fuer sich eigentlich wohl bekannt sind: ein DHCP-Server, ein TFTP-Server, eine MongoDB ... Herzstueck ist der Razor-Daemon himself, der eine API bereitstellt, mit der all diese Komponenten zusammenwirken koennen. Wenn DHCP und TFTP im Spiel sind, ist eigentlich klar, dass es um Netboot geht. Razor-Server und neuer Rechner befinden sich also mindestens im selben Netzwerk und der neue Rechner wird auf Netboot eingestellt. Wenn der dann bootet, wird er vom DHCP-Server eine IP-Adresse kriegen. Ab dem Zeitpunkt ist er in den Faengen des Razor. 
Hier die relevante dhcpd.conf:
</p>
<pre>
host node1 {
 hardware ethernet 59:9e:c3:ff:f2:36;
 fixed-address 192.168.3.77;
 next-server 192.168.3.1;
 option host-name "node1";
 filename "pxelinux.0";
 }
</pre>
<p>
Der DHCPD wird ein Netboot inittieren, der vom TFTPD einen Bootloader (razor.ipxe) geliefert bekommt. Dieser wiederum wird ein kleines Boot-Image laden, mit dem der Rechner bei Razor angemeldet wird. Razor faengt an, die vom Boot-Image gelieferten Informationen zu verarbeiten: Also was ist das fuer ein Rechner, welche CPU hat der, welche Architektur, wieviel Speicher und ... hab ich den schon mal gesehen. Diese Phase wird auch als "Razor Discovery" bezeichnet. Ist der Rechner neu, passiert erst mal gar nichts weiter und Razor wartet auf das, was der Operator entscheidet. 
</p>
<p>
Bevor wir aber so weit sind, muessen wir Razor installiert und lauffaehig haben. Das setzt wieder voraus, dass puppet bei uns installiert ist und das Vorzugsweise in der Version 3.x. Ausserdem funktioniert das gute Stueck nur in der Debian/Ubuntu-Umgebung und vielleicht auch noch Fedora. OpenSuse wird von den hier vorgestellten Modulen nicht unterstuetzt. Bei http://software.opensuse.org ist auch noch kein passendes Paket aufgetaucht.
</p>

<!-- codeblock lang="" line="1" --><pre><code>
cd /etc/puppet/
chown -R puppet:puppet modules/
puppet --version
puppet module install puppetlabs/razor
puppet apply /etc/puppet/modules/razor/tests/init.pp --verbose
</code></pre><!-- /codeblock -->
<p></p><p>
Fertig. Razor laeuft. Zu schnell? Gerne! In puppet 3.0 haben wir als Module-Repository http://forge.puppetlabs.com automatisch konfiguriert bekommen. Mit "puppet module install" werden so gewuenschte Module (und deren Abhaengigkeiten) heruntergeladen und nach /etc/puppet/modules/ installiert. Mit "puppet apply" starten wir die Initialisierung von Razor und brauchen dazu noch nicht mal einen Puppetmaster. Die Initialislierungsphase wird aber schon etwas Zeit in Anspruch nehmen, ehe in /opt/razor der ganze Kram installiert ist und auch die mongodb laeuft. Diese koennte sich eteas zickig anstellen, wenn nicht genug Speicherplatz frei ist. Dann tut sie naemlich gar nicht erst starten. Gut zureden hilft mit
</p>

<!-- codeblock lang="" line="" --><pre><code>
nojournal = true
smallfiles=true
</code></pre><!-- /codeblock -->
<p></p><p>
in /etc/mongodb/mongodb.conf. Und der Startoption:
</p>
<!-- codeblock lang="" line="1" --><pre><code>
/etc/init.d/mongodb start --smallfiles
</code></pre><!-- /codeblock -->

Wir brauchen auch noch ein paar Pakete, die der Razor vergessen hat:

<!-- codeblock lang="" line="1" --><pre><code>
apt-get install rubygems
apt-get install ruby-net-scp
</code></pre><!-- /codeblock -->

Wenn die Installation durchgelaufen ist, schauen wir uns den Status von Razor an:

<!-- codeblock lang="" line="1" --><pre><code>
/opt/razor/bin/razor_daemon.rb status
</code></pre><!-- /codeblock -->

<p></p><p>
Ggf. muessen wir razor_daemon starten oder in /opt/razor/log/razor_daemon.log gucken was los ist.
Nun muessen wir in Razor ein paar Images bereitstellen. Als erstes das spezielle Razor-Boot-Image:
</p>
<!-- codeblock lang="" line="1" --><pre><code>
wget https://github.com/downloads/puppetlabs/Razor-Microkernel/rz_mk_prod-image.0.9.3.0.iso
razor image add -t mk -n mikro_kernel -p ./rz_mk_prod-image.0.9.3.0.iso
wget "http://susestudio.com/download/f3edb8ae8bc30d87d65e478fedfaa1ed/GNUUUser.i686-0.0.9.preload.iso"
razor image add -t os -n gnuuuser_preload -p ./GNUUUser.i686-0.0.9.preload.iso -v 0.0.9

</code></pre><!-- /codeblock -->
<pre>
# razor image all
Images
 UUID => 6aF9lDBGICILf1grol13tl
 Type => MicroKernel Image
 ISO Filename => rz_mk_prod-image.0.9.3.0.iso
 Path => /opt/razor/image/mk/6aF9lDBGICILf1grol13tl
 Status => Valid
 Version => 0.9.3.0
 Built Time => Thu Nov 15 23:09:40 +0100 2012

 UUID => JOIsCvIQjHLjgV1Hcw1cD
 Type => OS Install
 ISO Filename => GNUUUser.i686-0.0.9.preload.iso
 Path => /opt/razor/image/os/JOIsCvIQjHLjgV1Hcw1cD
 Status => Valid
 OS Name => gnuuuser
 OS Version => 0.0.9

</pre>
<p></p><p>
Jetzt brauchen wir noch razor policy und model. Fuer model gibt es schon default templates:
</p>

<!-- codeblock lang="" line="1" --><pre><code>
# razor model get templates
</code></pre><!-- /codeblock -->
<pre>
Model Templates:
 Template Name Description
ubuntu_precise Ubuntu Precise Model
redhat_6 RedHat 6 Model
xenserver_boston Citrix XenServer 6.0 (boston) Deployment
ubuntu_oneiric Ubuntu Oneiric Model
oraclelinux_6 Oracle Linux 6 Model
opensuse_12 OpenSuSE Suse 12 Model
debian_wheezy Debian Wheezy Model
ubuntu_precise_ip_pool Ubuntu Precise Model (IP Pool)
vmware_esxi_5 VMware ESXi 5 Deployment
sles_11 SLES 11 Model
xenserver_tampa Citrix XenServer 6.1 (tampa) Deployment
centos_6 CentOS 6 Model
</pre>
<p></p><p>
Es gibt also schon fuer jedes Betriebssystem ein Template, welches die Besonderheiten wie Namenskonventionen oder Verzeichnisnamen beruecksichtigt. Es ist auch recht einfach unter /opt/razor/lib/project_razor/model ein neues Template anzulegen oder ein bestehendes anzupassen. 
Nun verknuepfen wir ein Image mit einem neuen Model:
</p>
<!-- codeblock lang="" line="1" --><pre><code>
razor model add -i tvZzar7JnYFEafo2ymEsf -l gnuuuser_preload -t opensuse_12
</code></pre><!-- /codeblock -->
<p></p><p>

Der erste Parameter ist die uuid des hochgeladenen Suse-Images, das labeln wir mit gnuuuser_preload und verwenden das opensuse_2 Template. Wir werden nach root-Passwort und Hostnamen fuer dieses Model gefragt und erhalten zum Schluss die model uuid:
</p>

<pre>
--- Building Model (opensuse_12):

Please enter root password (> 8 characters) (example: P@ssword!)
default: test1234
(QUIT to cancel)
 
Please enter node hostname prefix (will append node number) (example: node)
default: node
(QUIT to cancel)
 
Model created
 Label => gnuuuser_preload
 Template => linux_deploy
 Description => OpenSuSE Suse 12 Model
 UUID => XlSzYdIUzKtiQWUn3au3e
 Image UUID => tvZzar7JnYFEafo2ymEsf
</pre>
<p></p>
<!-- codeblock lang="" line="1" --><pre><code>
# razor model
</code></pre><!-- /codeblock -->

<pre>
Models
 Label Template Description UUID
gnuuuser_preload linux_deploy OpenSuSE Suse 12 Model XlSzYdIUzKtiQWUn3au3e
</pre>


<p></p><p>
Nun brauchen wir noch eine policy. Da haelt razor auch schon einige Templates bereit:
</p>
<!-- codeblock lang="" line="1" --><pre><code>
# razor policy templates
</code></pre><!-- /codeblock -->
<pre>
Policy Templates:
 Template Description
vmware_hypervisor Policy for deploying a VMware hypervisor.
xenserver_hypervisor Policy for deploying a XenServer hypervisor.
linux_deploy Policy for deploying a Linux-based operating system.
</pre>
<p></p><p>
Wir erstellen unsere eigene policy auf Basise des linux_deply templates und dem frisch erstellten model:
</p>
<!-- codeblock lang="" line="1" --><pre><code>
# razor policy add --template=linux_deploy --label=gnuuuser --model-uuid=XlSzYdIUzKtiQWUn3au3e --broker-uuid=none --tags=memsize_512MB,suse
</code></pre><!-- /codeblock -->
<pre>
Policy created
 UUID => 2Bo5yNhiFmPfzfdtYhOi2M
 Line Number => 2
 Label => gnuuuser
 Enabled => false
 Template => linux_deploy
 Description => Policy for deploying a Linux-based operating system.
 Tags => [memsize_512MB, xenhvm_vm]
 Model Label => gnuuuser_preload
 Broker Target => none
 Currently Bound => 0
 Maximum Bound => 0
 Bound Counter => 0
</pre>
<p></p><p>
Mit den Tags koennen wir steuern, welche Rechner (nodes) welcher Policy unterlegen und somit welches Image installiert wird. Somit sind wir wieder am Anfang der "nodes discovery". Wenn der DHCP-Server einen Node eingefangen hat, wird er ja mit dem Razor-Image geladen und katalogisiert. Je nach Ausstattung des Rechners bekommt der Node bestimmte Tags und wird dem Razor zur Verfuegung gestellt:
</p>
<!-- codeblock lang="" line="1" --><pre><code>
# razor node
</code></pre><!-- /codeblock -->
<pre>
Discovered Nodes
 UUID Last Checkin Status Tags
2XyQpTRV3kUYA20RXzSJq1 50258.7 min B [xenhvm_vm,cpus_2,nics_1]
</pre>
<!-- codeblock lang="" line="1" --><pre><code>
# razor node get 2XyQpTRV3kUYA20RXzSJq1
</code></pre><!-- /codeblock -->
<pre>
 UUID => 2XyQpTRV3kUYA20RXzSJq1
 Last Checkin => 04-06-13 20:05:22
 Status => bound
 Tags => [xenhvm_vm,cpus_2,nics_1]
 Hardware IDs => [529EC3FFF236]
</pre>
<p></p><p>
Wenn also ein Node mit dem Feature "xenhvm_vm" daherkommt, wuerde es unserer Policy gnuuser unterliegen und ueber dem verknuepften Model mit dem entsprechenden Suse-Image installiert werden. Dabei wird der Status des Rechners festgehalten, damit er nicht immer und immer wieder neu installiert wird. Gerade in Bearbeitung befindliche Instanzen kann man sich so ansehen:
</p>
<!-- codeblock lang="" line="1" --><pre><code>
# razor active_model
</code></pre><!-- /codeblock -->
<pre>
Active Models:
 Label State Node UUID Broker Bind # UUID
gnuuuser init 2XyQpTRV3kUYA20RXzSJq1 none 1 2b0deglhA3VngAeKj2dCnV
</pre>
<p></p><p>
Geht die Installation schief oder moechte man nicht mehr razoren, kann man die Instanz auch von der Verknuepfung wieder loesen:
</p>
<!-- codeblock lang="" line="1" --><pre><code>
# razor active_model remove 2XyQpTRV3kUYA20RXzSJq1
</code></pre><!-- /codeblock -->
<p></p><p>
Razor bietet im Bootmenue des Razor-Bootimages auch immer die Moeglichkeit des normalen Bootens an. 
Weiter gibt es noch die Moeglichkeit des Broker. Der Broker uebergibt die installierte Instanz an ein Konfigurationsmanagement. Auch dazu hat Razor vorinstallierte Module:
</p>
<!-- codeblock lang="" line="1" --><pre><code>
# razor broker plugin
</code></pre><!-- /codeblock -->
<pre>
Available Broker Plugins:
Plugin Description
chef Opscode Chef
script Script Execution
puppet PuppetLabs PuppetMaster
</pre>
<p></p><p>
Die Erstellung eines eigenen Brokers ist wieder denkbar einfach:
</p>
<!-- codeblock lang="" line="1" --><pre><code>
# razor broker add -p puppet -n our_puppet -d this_is_our_puppet
</code></pre><!-- /codeblock -->
<pre>
--- Building Broker (puppet):

Please enter Hostname of Puppet Master; optional (example: puppet.example.com)
(SKIP to skip, QUIT to cancel)
 > ubuntu01.eurazor.local
Please enter Puppet Version; for gem install, blank for latest (example: 3.0.1)
(SKIP to skip, QUIT to cancel)
 >

 Name => our_puppet
 Description => this_is_our_puppet
 Plugin => puppet
 UUID => 7B1ripWMunfZiDEfXhbzr3
 Server => ubuntu01.eurazor.local
 Broker Version =>
</pre>
<p></p><p>
Wir verknuepfen den Broker mit der Policy:
</p>
<!-- codeblock lang="" line="1" --><pre><code>
# razor policy update AHKwaf1Z7lguxEdpEu1nJ -b 7B1ripWMunfZiDEfXhbzr3
</code></pre><!-- /codeblock -->
<pre>
 UUID => AHKwaf1Z7lguxEdpEu1nJ
 Line Number => 4
 Label => ubuntu_precise64
 Enabled => true
 Template => linux_deploy
 Description => Policy for deploying a Linux-based operating system.
 Tags => [xenhvm_vm]
 Model Label => ubuntu_precise64
 Broker Target => our_puppet
 Currently Bound => 1
 Maximum Bound => 0
 Bound Counter => 2
</pre>
<p></p><p>
Wir koennen mit
</p>
<!-- codeblock lang="" line="1" --><pre><code> 
# razor active_model remove all
</code></pre><!-- /codeblock -->
<p></p><p>
unseren neuen Rechner nochmal neu installieren und ihn so direkt an Puppet uebergeben. Dokumentation zu Razor gibts im Wiki unter <a href="https://github.com/puppetlabs/Razor/wiki">https://github.com/puppetlabs/Razor/wiki
</a></p>
<p>
Tips &amp; Tricks: 
</p>
<ul>
<li>
Alle von Razor verwalteten Images verbrauchen zusaetzlichen Speicherplatz, weil die ISOs unter /opt/razor/images ausgepackt werden
</li>
<li>
In den Templates der Models werden nur 64-bit-Betriebssysteme oder nur eine bestimmte Architektur unterstuetzt. Wenn zum Beispiel ein i386-Image installiert werden soll, wird das nicht gehen, wenn der Kernel-Pfad unter amd64... gesucht wird. Es lohnt sich ein Blick nach /opt/razor/lib/project_razor/model.
</li> 
<li>
Das Handover von der fertigen Installation an den Broker (puppet) funktioniert nicht, wenn irgendwelche ssh-keys fuer "root" abgelegt sind. Zum Schluss wuerde sich naemlich der Install-Server per ruby::net::ssh auf den installierten Rechner einloggen und Puppet per Script installieren. Wenn statt Passwortauthentifierung (Razor kennt ja das root-Passwort, haha) eine Keyauthentfizierung als erstes vorgeschlagen wird.
</li>
</ul>
<p>
Gerade am letzten Beispiel ist zu sehen, dass an Razor noch sehr viel rumgeschraubt wird. Es lohnt sich also ein Blick in die <a href="https://github.com/puppetlabs/Razor/issues?state=open">Bugliste</a> und kritisches Hinterfragen.
</p>
