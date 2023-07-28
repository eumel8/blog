---
layout: post
tag: cloud-computing
title: Ich mach jetzt auch Container
subtitle: "Aber Docker ist es nicht. Da war mir doch zu viel Trubel drum und so richtig Vorteile hat es ja nicht, denn unter jedem Docker liegt noch ein Betriebssystem, was man hegen und pflegen muss. Seine Anwendung muss man dann auch noch ausnanderzergeln,&hellip;"
date: 2016-05-08
author: eumel8
---

Aber Docker ist es nicht. Da war mir doch zu viel Trubel drum und so richtig Vorteile hat es ja nicht, denn unter jedem Docker liegt noch ein Betriebssystem, was man hegen und pflegen muss. Seine Anwendung muss man dann auch noch ausnanderzergeln, 'dockerizieren'. Aufmerksamgeworden bin ich bei <a href="https://www.youtube.com/watch?feature=player_embedded&amp;v=lM2wwYDLB2M">Canonical auf LXD</a>
<br/>
LXD 2.0 heisst der neue Stern am Virtualisierungshimmel. Erst gabs die Paravirtualisierung mit Vmware und Xen, dann die Hardware-Accelerator mit KVM und VirtualBox und jetzt <a href="http://www.ubuntu.com/cloud/lxd">LXD</a>. LXD verspricht vollstaendige Hardwareemulation vom Hostsystem ohne Geschwindigkeitsnachteile, die eine Virtualisierung sonst mitbringt. Sehr kurze Bootzeiten unter einer Sekunde. Eine sehr hohe Packungsdichte von etlichen hundert oder gar tausenden Systemen auf einem Rechner mit vollstaendiger Isolierung, also einer sehr hohen Systemsicherheit auf Netzwerk und Betriebssystemebene. Und die Moeglichkeit der Live-Migration von einem zu einem anderen Host.
Schauen wir uns das mal an:
Am besten startet man mit der neuen LTS-Version von <a href="http://releases.ubuntu.com/16.04/">Ubuntu</a>, in der LXD schon mit ausgeliefert wird.
Mit <code class="codespan">lxd init</code> beginnt man mit der Initialisierung seines Systems. Erst werden einige Fragen zu Dateisystem und Netzwerkanbindung gestellt. Das Netzwerk brauch eine Bridge und bedienen laesst sich LXD ueber eine API, die praktischerweise auch ueber Netzwerk erreichbar sein sollte. DIe Verbindung ist automatisch verschluesselt, Zertfikate werden automatisch erstellt und man brauch sich nicht drum zu kuemmern. Bei der Frage nach dem Dateisystem (dir or zfs) sollte man ZFS nehmen. ZFS, das ist jetzt fuer Leute, die SUN nicht nur fuer eine Tageszeitung halten, hat hier tatsaechlich ein Remake erlebt. Das Dateisystem wird verwendet, um Snapshots der Container machen zu koennen, um die dann auf andere Hosts zu migrieren. Alternativen sind noch LVM, BTRFS oder XFS, favorisiert wird aber tatsaechlich ZFS. Installieren kann man es mit
<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
apt install criu
apt install zfsutils-linux
</code></pre><!-- /codeblock -->
Das Criu ist fuer das Erstellen der Snapshots zustaendig und ZFS fuer das Abspeichern.

In der ausgelieferten Version von LXD sind schon ein paar Repositories fuer Container eingebunden. So kann man recht einfach einen Ubuntu-Container erstellen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
lxc image list ubuntu:
lxc launch ubuntu:16.04 c1
lxc exec c1 bash
</code></pre><!-- /codeblock -->

lxc ist praktisch das Command-Line-Tool, um auf den von lxd bereitgestellte API zuzugreifen. Ich kann mir die Liste der bereitgestellten Images anschauen, einen Container <em>c1</em> davon erstellen und in diesem Container die bash-Shell aufrufen.
Praktischerweise ist ein NAT auf dem Hostsystem eingerichtet, sodass man jetzt im Container Dinge installieren kann. 

Sowas funktioniert dann zum Beispiel:
<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>

apt-get -y install git apache2 libapache2-mod-php5 php-sqlite3 sqlite3 php-xml
git clone https://github.com/eumel8/ebook-wunschliste.git /var/www/html/ebooks
chown www-data:www-data /var/www/html/ebooks
sed -i -e "s/^\$AWSSecretKey.*/\$AWSSecretKey='4ZjsdHDheLDJe87jdhDHlJhwksjshe2DDhw98';/" /var/www/html/ebooks/index.php
sed -i -e "s/^\$AWSAccessKeyId.*/\$AWSAccessKeyId='AKHSZEGJSH72JDHSK';/" /var/www/html/ebooks/index.php
sed -i -e "s/^\$AssociateTag.*/\$AssociateTag='ebookswishlist-21';/" /var/www/html/ebooks/index.php
service apache2 restart
</code></pre><!-- /codeblock -->

Um unsere Webseite von der Aussenwelt auch erreichbar zu machen, brauch es wieder ein paar iptables Regeln:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
iptables -t nat -A POSTROUTING -j MASQUERADE
sysctl net.ipv4.ip_forward=1
iptables -t nat -A PREROUTING -p tcp -d 192.168.0.104 --dport 80 -j DNAT --to-destination 10.21.37.51:80
</code></pre><!-- /codeblock -->

192.168.0.104 ist unser Hostsystem, auf dem LXD laeuft
10.21.37.51 ist der Container mit unseren kleinen Webapplikation
Kann sein, dass es schon Bordmittel in lxc gibt, aber ich habe bis dato nichts gefunden.

Was ich auch nicht gleich gefunden hatte, waren Container-Templates von anderen Betriebssystemen. Da hilft ein
<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
lxc remote add containerhub https://images.linuxcontainers.org/ --public
</code></pre><!-- /codeblock -->
um zum Beispiel ein OpenSuse 13.2 starten zu koennen oder andere Betriebssysteme.
Wie geht das jetzt mit Live-Migration? Dazu brauchen wir einen zweiten Host mit Ubuntu 16.04. Wenn wir eine VM haben, kann man die einfach clonen. Verwiesen sei aber dazu auf diesen <a href="https://bugs.launchpad.net/ubuntu/+source/lxc/+bug/1581818">Bug</a>, wo es Probleme offenbar mit KVM gibt. 
Snapshots kann man jederzeit von einem Container anlegen, entweder mit Systemstatus oder ohne (stateful/stateless). Letzteres funktioniert immer, stateful muss man testen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
lxc snapshot c1 --stateful
</code></pre><!-- /codeblock -->

Den zweiten LXD-Host bindet man mit folgendem Befehl in sein System ein:
<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
lxc remote add zwei 192.168.0.105
</code></pre><!-- /codeblock -->

Verschoben wird der Container dann so:
<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
lxc move c1 zwei:
</code></pre><!-- /codeblock -->

Fertig! 
<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
lxc list zwei:
</code></pre><!-- /codeblock -->
Dort sollte jetzt der Container zu sehen sein.

Wie man sieht, ist die Sache recht simpel und vielleicht deswegen auch recht genial. Informationen findet man auf <a href="https://linuxcontainers.org/">https://linuxcontainers.org/</a> und eine sehr umfangreiche Beschreibung im Blog des Entwicklers
<a href="https://www.stgraber.org/2016/03/11/lxd-2-0-blog-post-series-012/">https://www.stgraber.org/2016/03/11/lxd-2-0-blog-post-series-012/</a>

Happy Container!
