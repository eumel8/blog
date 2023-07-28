---
layout: post
tag: general
title: Angetestet. OpenStack &amp; SUSE Studio
subtitle: "http://blog.eumelnet.de/blogs/blog8.php/cloudcomputingnhttp://www.zdnet.de/news/41560611/cebit-telekom-cloud-unterstuetzt-kuenftig-openstack.htmnhttp://www.linux-magazin.de/Heft-Abo/Ausgaben/2012/01/Suse-Cloud"
date: 2012-05-10
author: eumel8
---

<p><a href="/blogs/blog8.php/cloudcomputing" target="_blank">Vor 2 Jahren</a> berichtete ich von den Machenschaften des <a href="http://aws.amazon.com/de/" target="_self">AWS</a>.  Wahrscheinlich ohne es zu wissen, waren die Amazon Web Services der Anbeginn des Infrastructure as a Service - dem sogenannten Cloudcomputing: Klar definierte IT-Services, die einfach und im Selfservice zu bedienen sind. Sei es ein Linux- oder Windows-Rechner, dazugehoerender Storage, IP-Adresse und Firewall-Ruleset - alles per Mausklick in Sekunden zusammengestellt und betriebsbereit.</p>
<br/>
<p>Klar, ab der Fertigststellung tickte im Hintergrund die Uhr, auf der Amazon akribisch die CPU-Minuten zusammenrechnet und das Geld von der Kreditkarte abbucht. Die Datenbank fuer diesen Blog kostet z.B. schnell 30-40 Euro pro Monat. Soviel kostet noch nicht mal der gesamte Webserver.</p>
<p>Einige Zeit ist ins Land gegangen und so hat es nicht allzulange gedauert, bis jemand angefangen hat, diese ganzen Services soweit ausnanderzunehmen und mit OpenSource nachzubauen, dass sie zum Schluss voellig transparent, portabel sind. Jeder Teil der Software hat eine frei definierbare API und bietet so sehr leicht die Moeglichkeit, noch andere Software "anzuflanschen". Die Kernkomponente von <a href="http://openstack.org" target="_blank">Openstack</a> ist Essex, die aktuelle Version von Openstack-Computing - also die Erstellung von virtuellen Maschinen, Konfiguration von CPU, RAM-Speicher usw. Dazu gibt es das Dashboard, eine Webanwendung in Python, um ueber den Webbrowser die Cloud konfigurieren zu koennen. Python verwundert an der Stelle. Man haette vielleicht Ruby erwartet oder sowas aehnliches. Zum Computing passend ist der Image-Service, mit dem ich beliebige Betriebssystem-Image in Openstack einbinden kann: AMI-Images aus der AWS, VMWARE-Images, Hyper-V-Images (VHD). Eingebunden werden die Images in Openstack mit "glance":</p>
<p> </p>
<pre>glance add name="My Citrix Gold" is_public=true   \<br />   container_format=bare disk_format=qcow2 \ <br /> -A 999888777666 &lt; f2390b5d-1473-4659-a647-b499cade476f.vhd 99888777666.vcd .
</pre>
<p> </p>
<p>Natuerlich wuerde es auch per HTTP-POST gehen, denn es gibt eine REST-Schnittstelle (glance macht genau dies von der Kommandozeile). Das Image kann man dann auf eine VM ausrollen:</p>
<p> </p>
<div class="image_block"><a href="/images/openstack.jpg?mtime=1336767346"><img src="/images/openstack.jpg?mtime=1336767346" alt="" width="687" height="332" /></a></div>
<p> </p>
<p>Weitere Features sind  Zuweisung von IP-Adressen und Einrichtung von Security-Groups (also Firewalls), wie man es vom AWS kennt.</p>
<p>Ein weiterer Teil vom Openstack ist der Object Storage (Codename Swift). Damit soll skalierbarer Speicher im Petabytebereich erstellt werden koennen. Kernanwendungen soll das Speichern der Betriebssystemimages fuer Openstack sein, aber auch Anwendungsdaten wie Bilder, Thumbnails und Dokumenten Storage.</p>
<p>Wie im<a href="http://www.linux-magazin.de/Heft-Abo/Ausgaben/2012/01/Suse-Cloud" target="_blank"> Linux-Magazin</a> beschrieben, kann die Konfiguration von Openstack sehr langwierig sein (weil ebend alles so frei konfigurierbar ist). Die Loesung bietet das Linuxmagazin gleich selbst an: <a href="http://susestudio.com/" target="_blank">SUSE Studio</a>. Mit SUSE Studio kann ich mir meine persoenliche Suse-Distribution zusammenklicken. Diese wird dann online zusammengestellt und komplett als ISO zur Verfuegung gestellt. Diese kann man auf CD brennen (es gibt z.B. eine minimale SuSE-Distribution von 200 MB Groesse) oder direkt ins Openstack einbinden. Im SUSE Studio gibt es aber auch eine Distribution mit Openstack, welches eine fertig konfigurierte Cloudumgebung beherbergt - zum Testen allemal ausreichend.</p>
<p>Dass Cloudcomputing nicht mehr nur eine Vision oder Bastelei darstellt, zeigte die<a href="http://www.zdnet.de/news/41560611/cebit-telekom-cloud-unterstuetzt-kuenftig-openstack.htm" target="_blank"> Deutsche Telekom auf der Cebit 2012</a>: In einem Business Marketplace sollen Cloudanwendungen fuer Geschaeftskunden zugaenglich gemacht werden. Cloudcomputing Made in Germany.</p>

<ul>
<li>http://wiki.openstack.org/</li>
<li>http://download.opensuse.org/repositories/Virtualization:/Cloud:/</li>
<li>http://susestudio.com/a/vszMWq/suse-cloud-powered-by-openstack-tm</li>
</ul>
