---
layout: post
tag: container
title: App-Deployment in LXD-Container
subtitle: "Wie LXD grundsaetzlich funktioniert, hatten wir ja im letzten Blog-Beitrag kennengelernt. Jetzt haben wir schon einige Erfahrungen und koennen versuchen, eine Applikation zu installieren. Automatisch."
date: 2016-05-22
author: eumel8
---

Wie LXD grundsaetzlich funktioniert, hatten wir ja im letzten Blog-Beitrag kennengelernt. Jetzt haben wir schon einige Erfahrungen und koennen versuchen, eine Applikation zu installieren. Automatisch.
<br/>
DIe schlimmste Erfahrung, die ich bislang mit LXD gemacht habe ist die, wenn der ZFS-Pool voll ist. Das Experimentieren mit verschiedenen Images und Snapshots kostet nun mal etwas Festplattenspeicher und wenn der zu schmal berechnet ist, ist er ziemlich schnell aufgebraucht. Wenn dann noch der Speicher der ganzen Festplatte aufgebraucht ist, nimmt das LXD ziemlich uebel. Was man dann noch an Fehler machen kann ist, den LXD-Host neu zu booten (um etwa die Festplatte zu vergroessern). ZFS wird beim Booten versuchen, die Pools zu recovern. Da kein Platz dazu da ist, wird das natuerlich ewig dauern und nichts bringen. Dennoch ist ZFS fuer LXD dringend empfohlen. Eine Anleitung fuer Ubuntu findet sich <a href="https://wiki.ubuntuusers.de/ZFS_on_Linux/">hier</a>
Sehr schoene Erfahrungen macht man aber mit

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
lxc copy c1 c2
</code></pre><!-- /codeblock -->

um einfach mal einen bestehenden Container zu kopieren. Oder 

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
lxc snapshot --stateful
</code></pre><!-- /codeblock -->

um einfach mal einen Snapshot eines laufenden Container anzufertigen, um ihn dann mit

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
lxc move c1 zwei:
</code></pre><!-- /codeblock -->

auf einen anderen Host zu migrieren. Das hatte am Anfang nicht funktioniert, aber der vermutete Bug war gar keiner. Unter Ubuntu muss nur das Paket linux-image-extra-4.4.0-22-generic installiert sein, weil von dort einige Module verwendet werden


Jetzt wollen wir aber endlich unsere App installieren.<a href="https://github.com/eumel8/lamp">Lamp on OpenStack</a> hatte ich ja schon ausprobiert. Kann man das auch als Lamp on Container verwenden? Unter Ubuntu geht das relativ problemlos, nur unter OpenSuSE 13.2 war es ein langer Weg, alle Fehler in den verwendeten Puppet-Modulen und OpenSuSe selbst zu umschiffen.
Entstanden ist dann<a href="https://github.com/eumel8/lamp/blob/opensuse-13.2/scripts/lxd/install.sh"> dieses</a> Install-Script, welches nach dem Starten im Container aufgerufen werden muss,

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
#!/bin/sh

# add extra repo for monitoring packages
zypper addrepo http://download.opensuse.org/repositories/server:monitoring/openSUSE_13.2/server:monitoring.repo
zypper --gpg-auto-import-keys refresh

# install puppet and git
zypper --non-interactive --no-gpg-checks --quiet install puppet vim git

# copy git repo
rm -rf /etc/puppet/
export GIT_SSL_NO_VERIFY=true
git clone -b opensuse-13.2 https://github.com/eumel8/lamp.git /etc/puppet
cd /etc/puppet
git submodule update --init

# install lamp
puppet apply /etc/puppet/manifests/site.pp

# hotfixes against systemd
sed -i 's/PrivateTmp=true/PrivateTmp=false\nNoNewPrivileges=yes/' /etc/systemd/system/httpd.service
sed -i 's/PrivateTmp=true/PrivateTmp=false\nNoNewPrivileges=yes/' /etc/systemd/system/multi-user.target.wants/apache2.service
systemctl daemon-reload
systemctl restart httpd.service

echo "done"
</code></pre><!-- /codeblock -->

Das Git-Repo wird also runterkopiert und mit puppet apply der LAMP-Stack installiert. Allerdings sind in dem eigenen Branch die meisten Anpassungen fuer opensuse-13.2 drin. Und trotzdem muessen noch Einstellungen am systemd behandelt werden, damit solche haesslichen Fehlermeldungen wie 
<code>
Failed at step NAMESPACE spawning /usr/sbin/start_apache2: Permission denied</code> 

verschwinden.

Auf dem LXD-Host haben wir nur ein paar Kommandos zu betaetigen, um unseren Container zu erstellen und das Deployment anzustossen und unseren Container vom externen Netzwerk erreichbar zu machen.:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
lxc remote add images https://images.linuxcontainers.org/ --public true --protocol=lxd
lxc launch images:opensuse/13.2/amd64 s2
lxc file push install.sh s2/
lxc exec s2 -- /install.sh

CONTAINER_IP=`lxc info s2 | grep eth0 | head -1 | awk '{print $3}'`
iptables -t nat -A POSTROUTING -j MASQUERADE
sysctl net.ipv4.ip_forward=1
iptables -t nat -A PREROUTING -p tcp -d 192.168.0.105 --dport 10080 -j DNAT --to-destination ${CONTAINER_IP}:80
</code></pre><!-- /codeblock -->

Voila, unter http://192.168.0.105:10080/icinga sollten wir das Monitoring unserr VM begutachten koennen. Beschrieben etwa auch <a href="https://github.com/eumel8/lamp/tree/opensuse-13.2/scripts/lxd">hier</a>

Zwei Usecases noch zur Ergaenzung.

Vom jetzigen Stand des Containers ein neues Image erstellen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
lxc snapshot s2
lxc publish s2/snap0 --alias lampsuse
</code></pre><!-- /codeblock -->

Den in der Entwicklungsumgebung aufgebauten Container in die Produktionsplattform verschieben:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
lxc remote add prod 5.104.106.106
lxc move s2 prod:
</code></pre><!-- /codeblock -->

Oder wie oben schon geliebt:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
lxc remote add prod 5.104.106.106
lxc copy s2 prod:
</code></pre><!-- /codeblock -->

<img src="/images/quick-uploads/p571/lxd_container.jpg" width="585" height="386"/>

Deswegen ist es eine schlechte Idee, die Nutzdaten wie Webcontent und Datenbanken ausserhalb der Container zu lagern und ueber Device-Mapping einzubinden wie in dieser kleinen Studie. Um sich die Flexibiitaet zu bewahren, gehoeren die Daten in die Container und sind somit schnell versandfaehig.
