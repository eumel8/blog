---
layout: post
tag: cloud-computing
title: Citrix XenCenter und OpenStack
subtitle: "Bislang lebte das Citrix XenCenter unbehelligt von anderen Virtualisierungsloesungen in meiner Umgebung. Von der Gebrauch der API und den sonstigen Vorzuegen hatte ich hier schon berichtet. Vielleicht ein paar Updates: Auf http://xenserver.org/ wird ab&hellip;"
date: 2015-12-20
author: eumel8
---

Bislang lebte das Citrix XenCenter unbehelligt von anderen Virtualisierungsloesungen in meiner Umgebung. Von der Gebrauch der API und den sonstigen Vorzuegen hatte ich hier schon berichtet. Vielleicht ein paar Updates: 
<ul>
 <li>Auf <a href="http://xenserver.org/">http://xenserver.org/</a> wird ab Version 6.5 eine lizenzfreie Version bereitgestellt. Das jaehrliche Update der Lizenz sollte damit hinfaellig sein. </li>
 <li>Auf <a href="https://github.com/OpenXenManager/openxenmanager">https://github.com/OpenXenManager/openxenmanager</a> gibt es eine GUI fuer Linux, um auf die XenCenter-Verwaltung zugreifen zu koennen. Damit ist man nicht mehr auf das WIndows-Client gebunden
</li>
</ul>

Und jetzt kommt noch OpenStack?
<br/>

In der Tat. Auf https://github.com/openstack-dev/devstack/blob/master/tools/xen/README.md hat sich jemand Gedanken gemacht, wie man das Citrix XenCenter mit OpenStack benutzen kann. Eine Testinstallation von OpenStack mit VirtualBox in der Xen-VM (basierend auf https://github.com/openstack/training-labs) scheitert, da VirtualBox irgendwann merkt, dass es kein Blech zur Verfuegung hat, sondern nur virtuell laeuft).
DevStack stellt aber ein Tool bereit, welches das XenCenter soweit vorbereiten kann, dass es Festplatte, vCPU, RAM-Speicher und Netzwerk fuer OpenStack bereit haelt. Dieses laeuft auf einer VM im Citrix XenCenter.
Die empfohlene Vorgehensweise ist:
Auf unserem XenCenter-Host

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
# wget --no-check-certificate https://github.com/openstack-dev/devstack/zipball/master
# unzip -o master -d ./devstack
# cd devstack/*/
</code></pre><!-- /codeblock -->

Wenn man die aktuelle OpenStack-Version nicht moechte, kann man noch andere Branches mit aelteren Versionen wie Icehouse, Juno oder Kilo auswaehlen.
Als naechstes ist die Datei localrc in diesem Verzeichnis zu erstellen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
cat > ./localrc &lt;<eof # At the moment, we depend on github's snapshot function.
GIT_BASE="http://github.com"

# Passwords
# NOTE: these need to be specified, otherwise devstack will try
# to prompt for these passwords, blocking the install process.

DATABASE_PASSWORD=my_super_secret
SERVICE_TOKEN=my_super_secret
ADMIN_PASSWORD=my_super_secret
SERVICE_PASSWORD=my_super_secret
RABBIT_PASSWORD=my_super_secret
SWIFT_HASH="66a3d6b56c1f479c8b4e70ab5c2000f5"
# This will be the password for the OpenStack VM (both stack and root users)
GUEST_PASSWORD=my_super_secret

# XenAPI parameters
# NOTE: The following must be set to your XenServer root password!

XENAPI_PASSWORD=my_xenserver_root_password

XENAPI_CONNECTION_URL="http://address_of_your_xenserver"
VNCSERVER_PROXYCLIENT_ADDRESS=address_of_your_xenserver

# Explicitly set virt driver
VIRT_DRIVER=xenserver

# Explicitly enable multi-host for nova-network HA
MULTI_HOST=1

# Give extra time for boot
ACTIVE_TIMEOUT=45

EOF
</code></eof></code></pre><!-- /codeblock -->

Adressen des XenServer, Username und Passwort sind zu ersetzen.
Im Unterverzeichnis tools gibt es das
<pre>
#./install_os_domU.sh
</pre>
Das legt im XenCenter die erforderlichen Netze fuer OpenStack an und erstellt eine neue VM namens DevStackOSDomU. OS-Image und Sourcen werden aus dem Internet bezogen, die Installation kann also etwas dauern. Wahrscheinlich aus Performancegruenden wird die VM mit mindestens 6 GB RAM festgenagelt. Wenn man bloss 8 oder weniger hat, laeuft zwar hervorragend die OpenStack-VM, aber wir koennen keine weiteren VMs mehr starten. Um den Engpass zu beseitigen, koennen wir den Speicher der VM auf 2 GB limitieren:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
# xe vm-param-set uuid=9c938fbe-fbe3-717c-4469-42ce9712b3cc memory-static-min=2147483648
# xe vm-param-set uuid=9c938fbe-fbe3-717c-4469-42ce9712b3cc memory-dynamic-min=2147483648
</code></pre><!-- /codeblock -->

Wenn die VM gestartet ist und sich alles installiert hat, sollte man mit dem Browser auf die VM zugreifen koennen und dort das Login des 
OpenStack Dashboards sehen. Einloggen kann man sich mit dem user "admin" oder user "demo" und dem vorher in localrc festgelegten Passwort. 
Nachdem an sich ein bischen umgesehen hat, moechte man vielleicht ein paar VMs starten. 2 Boot-Images sind schon installiert und eigentlich koennte es losgehen. Aber ich will auch gleich die naechste Falltuer verraten, wenn das Booten der VMs nicht gelingen will und man sowas in den Logfiles findet:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>

There are 0 hosts available but 1 instances requested to build. from (pid=10174) select_destinations /opt/stack/nova/nova/scheduler/filter_scheduler.py:78
n-sch.log.2015-12-19-215531:2015-12-20 17:51:53.204 DEBUG nova.scheduler.filters.retry_filter [req-a4eae3c0-822f-49a5-bd4f-63b219b320bc demo demo] Host [u'DevStackOSDomU', u'xenti.dsl.eumel.local'] fails. Previously tried hosts: [[u'DevStackOSDomU', u'xenti.dsl.eumel.local']] from (pid=10174) host_passes /opt/stack/nova/nova/scheduler/filters/retry_filter.py:47

</code></pre><!-- /codeblock -->

und 

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
n-cond.log.2015-12-19-215531:2015-12-20 17:20:47.176 ERROR nova.scheduler.utils [req-50c29e27-4982-40a9-be91-21621c351c2b demo demo] [instance: d0999a8c-3c01-49e5-aab5-639d2787d1ab] Error from last host: DevStackOSDomU (node xenti.dsl.eumel.local): [u'Traceback (most recent call last):\n', u' File "/opt/stack/nova/nova/compute/manager.py", line 1914, in _do_build_and_run_instance\n filter_properties)\n', u' File "/opt/stack/nova/nova/compute/manager.py", line 2078, in _build_and_run_instance\n instance_uuid=instance.uuid, reason=six.text_type(e))\n', u'RescheduledException: Build of instance d0999a8c-3c01-49e5-aab5-639d2787d1ab was re-scheduled: Only file-based SRs (ext/NFS) are supported by this feature. SR 6891a31e-48c3-ab73-6d90-85981a03577d is of type lvm\n']

</code></pre><!-- /codeblock -->

Ja, mhmm. Gute Nachricht zuerst: Die Verbindung OpenStack zu XenCenter klappt. Die schlechte ist, es koennen nur ext/NFS StorageRepositories angesprochen werden. Ueblicherweise hat man sowas jedoch nicht, da standardmaessig nur ein StorageRepository mit lvm angelegt ist. Wir brauchen also noch einen NFS-Server, entweder auf dem XenServer selber oder auch als VM. Da OpenStack nova-compute auf diesen Speicher auch schreiben und Rechte aendern moechte, empfehlen sich folgende Optionen auf dem NFS-Server:
 
<pre>
rw,no_root_squash
</pre>

Ansonsten quitiert OpenStack nova-compute mit "Could not fetch image" oder "0 host avalable" oder "No valid host found" . Das ist bei OpenStack besonders nichtssagend, weil man danach unzaehlige Logfiles durchsuchen muss oder gar einen Dienst neu starten. Apropos: In DevStack gibt es keine init-Skripte, um Services neu zu starten. Stattdessen laufen alle OpenStack-Dienste im screen.

mit 
<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
# screen -r
</code></pre><!-- /codeblock -->

kann man sich an die Screens dranhaengen und mit 

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
# CTRL A n
</code></pre><!-- /codeblock -->

durch die Screens durchblaettern. mit CTRL-C kann man Dienste abbrechen und den Startbefehl mit der Pfeil-nach-oben-Taste neu aufrufen.

Wenn man im XenCenter bzw. XenServer, wie es jetzt ja richtiger heisst, das StorageRepository (SR) mit NFS neu angelegt hat, kann man im OpenStack Dashboard die Verbindung ueberpruefen:

<img src="/blog/media/quick-uploads/p561/openstack2.jpg" width="585" height="386"/>

Als Hypervisor-Host fungiert unser XenServer-Host, waehrend als Compute-Node die DevStack-VM herhaelt. 

Jetzt kann man versuchen eine Instanz mit einen der vorinstallierten Images zu starten:

<img src="/blog/media/quick-uploads/p561/openstack1.jpg" width="585" height="386"/>

Das hat geklappt! 
Fassen wir noch einmal zusammen. XenServer verwaltet die physikalischen Resourcen wie CPU, RAM und Festplatte. Im XenServer selber kann man virtuelle Maschinen (VMs) starten. Auf einer VM laeuft ein NFS-Server als Storage Repository und in einer anderen DevStackOSDomU alle OpenStack-Dienste

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
stack@DevStackOSDomU:~$ nova service-list
+----+--------------------+----------------+----------+---------+-------+----------------------------+-----------------+
| Id | Binary | Host | Zone | Status | State | Updated_at | Disabled Reason |
+----+--------------------+----------------+----------+---------+-------+----------------------------+-----------------+
| 1 | nova-osapi_compute | 0.0.0.0 | internal | enabled | down | - | - |
| 2 | nova-metadata | 0.0.0.0 | internal | enabled | down | - | - |
| 3 | nova-conductor | DevStackOSDomU | internal | enabled | up | 2015-12-21T21:53:21.000000 | - |
| 4 | nova-cert | DevStackOSDomU | internal | enabled | up | 2015-12-21T21:53:24.000000 | - |
| 5 | nova-network | DevStackOSDomU | internal | enabled | up | 2015-12-21T21:53:18.000000 | - |
| 6 | nova-scheduler | DevStackOSDomU | internal | enabled | up | 2015-12-21T21:53:20.000000 | - |
| 7 | nova-consoleauth | DevStackOSDomU | internal | enabled | up | 2015-12-21T21:53:18.000000 | - |
| 8 | nova-compute | DevStackOSDomU | nova | enabled | up | 2015-12-21T21:53:22.000000 | - |
+----+--------------------+----------------+----------+---------+-------+----------------------------+-----------------+

</code></pre><!-- /codeblock -->

Hier nochmal der Status unserer VMS: 

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
stack@DevStackOSDomU:~$ nova list --all-tenants
+--------------------------------------+--------+----------------------------------+--------+------------+-------------+------------------------------+
| ID | Name | Tenant ID | Status | Task State | Power State | Networks |
+--------------------------------------+--------+----------------------------------+--------+------------+-------------+------------------------------+
| b4e0a940-30fa-4616-97fe-4e07b754a0f4 | eumel2 | f81f9cb2f7dd4880b396263c54203e6f | ACTIVE | - | Running | private=10.0.0.7, 172.24.4.1 |
+--------------------------------------+--------+----------------------------------+--------+------------+-------------+------------------------------+

</code></pre><!-- /codeblock -->

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
stack@DevStackOSDomU:~$ nova show b4e0a940-30fa-4616-97fe-4e07b754a0f4
+--------------------------------------+-----------------------------------------------------------------+
| Property | Value |
+--------------------------------------+-----------------------------------------------------------------+
| OS-DCF:diskConfig | AUTO |
| OS-EXT-AZ:availability_zone | nova |
| OS-EXT-SRV-ATTR:host | DevStackOSDomU |
| OS-EXT-SRV-ATTR:hostname | eumel2 |
| OS-EXT-SRV-ATTR:hypervisor_hostname | xenti.dsl.eumel.local |
| OS-EXT-SRV-ATTR:instance_name | instance-00000005 |
| OS-EXT-SRV-ATTR:kernel_id | |
| OS-EXT-SRV-ATTR:launch_index | 0 |
| OS-EXT-SRV-ATTR:ramdisk_id | |
| OS-EXT-SRV-ATTR:reservation_id | r-8mfzz3o5 |
| OS-EXT-SRV-ATTR:root_device_name | /dev/xvda |
| OS-EXT-SRV-ATTR:user_data | - |
| OS-EXT-STS:power_state | 1 |
| OS-EXT-STS:task_state | - |
| OS-EXT-STS:vm_state | active |
| OS-SRV-USG:launched_at | 2015-12-21T20:50:12.000000 |
| OS-SRV-USG:terminated_at | - |
| accessIPv4 | |
| accessIPv6 | |
| config_drive | True |
| created | 2015-12-21T20:49:56Z |
| flavor | m1.nano (42) |
| hostId | e93c7d692b8afa2f921ee201c9646411452243d6ae2bf697f7697328 |
| id | b4e0a940-30fa-4616-97fe-4e07b754a0f4 |
| image | cirros-0.3.4-x86_64-disk (d216391e-4e33-4dd9-8a15-3ed9e999bf4c) |
| key_name | devstack |
| metadata | {} |
| name | eumel2 |
| os-extended-volumes:volumes_attached | [] |
| private network | 10.0.0.7, 172.24.4.1 |
| progress | 100 |
| security_groups | default |
| status | ACTIVE |
| tenant_id | f81f9cb2f7dd4880b396263c54203e6f |
| updated | 2015-12-21T20:50:12Z |
| user_id | a31e781a8e3148e1bcf9aca5e774a36b |
+--------------------------------------+-----------------------------------------------------------------+

</code></pre><!-- /codeblock -->
