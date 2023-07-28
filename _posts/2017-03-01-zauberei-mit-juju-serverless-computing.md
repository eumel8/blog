---
layout: post
tag: container
title: Zauberei mit Juju - Serverless Computing und Juju Charm
subtitle: "Serverless Computing ist die naechste Stufe auf dem Weg in den Cloud-Himmel. Waehrend in allen anderen Stufen zuvor sich der Anwender noch mit Computern, Netzwerken und Betriebssystem damit rumschlagen musste, ist er nun von allem rein gewaschen: Er&hellip;"
date: 2017-03-01
author: eumel8
---

Serverless Computing ist die naechste Stufe auf dem Weg in den Cloud-Himmel. Waehrend in allen anderen Stufen zuvor sich der Anwender noch mit Computern, Netzwerken und Betriebssystem damit rumschlagen musste, ist er nun von allem rein gewaschen: Er kuemmert sich nur noch um seine Daten.


<br/>
Juju ist ein Werkzeug von Ubuntu aus dem Hause Canonical, was sich anschickt, etwas Ordnung in das Durcheinander mit den vielen Cloud zu bringen:


<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
# juju clouds
Cloud Regions Default Type Description
aws 12 us-east-1 ec2 Amazon Web Services
aws-china 1 cn-north-1 ec2 Amazon China
aws-gov 1 us-gov-west-1 ec2 Amazon (USA Government)
azure 18 centralus azure Microsoft Azure
azure-china 2 chinaeast azure Microsoft Azure China
cloudsigma 5 hnl cloudsigma CloudSigma Cloud
google 4 us-east1 gce Google Cloud Platform
joyent 6 eu-ams-1 joyent Joyent Cloud
rackspace 6 dfw rackspace Rackspace Cloud
localhost 1 localhost lxd LXD Container Hypervisor. 
</code></pre><!-- /codeblock -->
Es sind verschiedene Clouds und deren Service-Endpunkte vorkonfiguriert. Die kann ich entweder nutzen, indem ich die entsprechenden Credentials als Umgebungsvariablen hinzufuege, oder neue Cloud erstellen (wie etwa meine eigene OpenStack-Umgebung). In unserer Testreihe wollen wir LXD verwenden. Wie das einzurichten ist, hatte ich schon erklaert. Wer nicht nachlesen will: lxd init - und alles wird gut.

Als naechstes brauchen wir einen Controller. Dieser wird spaeter unsere Befehle empfangen und an die verschiedenen Units weiterverteilen.

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
juju bootstrap localhost localhost
</code></pre><!-- /codeblock -->

Der naechste Layer ist das Model. Wir liegen einfach ein neues an, um unsere Anwendung darin zu deployen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
# juju add-model ebooks
</code></pre><!-- /codeblock -->

Und so sieht es dann aus:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
# juju models
Controller: localhost-localhost

Model Owner Status Machines Cores Access Last connection
controller admin available 1 - admin just now
ebooks* admin available 1 - admin 57 minutes ago
</code></pre><!-- /codeblock -->

Kommen wir jetzt zu den Charms. Charms sind die Beschreibung einer Applikation und wie diese installiert und konfiguriert wird. In der <code>metadata.yaml</code> findet man zum Beispiel Name, Kurzbeschreibung, Autor und Tags. Mit Tags kann man zum Beispiel im <a href="https://jujucharms.com/store">Charm Store</a> nach Themen sortiert Applikationen finden.
<code>config.yaml</code> ist eine weitere JSON-Datei, in der Konfigurationsparameter fuer die Applikation definiert sind.
Herzstuecke des Charms sind die sogenannten Hooks. Im gleichnamigen Unterverzeichnis kann es eine ganze Menge von ihnen geben. Es gibt vorreservierte Dateinamen. Der Hook <code>install</code> wird zum Beispiel immer bei der Installation aufgerufen. Die Hooks <code>start</code> und <code>stop</code> jeweils zum Starten und Stoppen der Applikation. Weitere wichtige Hooks sind <code>config-changed</code> und <code>upgrade-charm</code>, wenn es etwa neuere Revisionen des Charms gibt. Eine Beschreibung der moeglichen Hooks findet man <a href=" https://jujucharms.com/docs/stable/reference-charm-hooks">hier</a> .
<a href="https://github.com/eumel8/ebook-wunschliste">
ebook wunschliste</a> ist ein Webservice, der wiederum den Amazon Webservice benutzt, um similare Suchen auszufuehren. Die Anwendung ist in PHP/Javascript geschrieben, Daten werden auf dem Rechner der Benutzer gespeichert. Um die Anwendung in einen Charm zu ueberfuehren, ist das Schreiben einer Installationsroutine notwendig, sowie das Herausfuehren von 3 Variablen fuer die Amazon-Credentials.

Auschecken des Charms von Github und Deployen der Applikation:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
# juju switch ebooks
# git clone https://github.com/eumel8/ebook-wunschliste-charm.git ~/charms/xenial/ebook-wunschliste
# juju deploy ./charms/xenial/ebook-wunschliste/ --series xenial
</code></pre><!-- /codeblock -->

Der Auftrag wird an den Controller weitergeleitet. Dieser startet einen LXD-Container, installiert dort die Applikation entsprechen der Hooks im Charm und richtet so die erste Unit ein:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
# juju status

Model Controller Cloud/Region Version
ebooks2 localhost-localhost localhost/localhost 2.0.0

App Version Status Scale Charm Store Rev OS Notes
ebook-wunschliste waiting 0/1 ebook-wunschliste local 0 ubuntu

Unit Workload Agent Machine Public address Ports Message
ebook-wunschliste/0 waiting allocating 0 10.84.44.56 waiting for machine

Machine State DNS Inst id Series AZ
0 pending 10.84.44.56 juju-703543-0 xenial

</code></pre><!-- /codeblock -->

Durch den Aufbau unseres lokalen Repos und dem Parameter --series xenial haben wir angegeben, dass wir Ubuntu 16.04 (Xenial) verwenden moechten.

Nach einer kurzen Weile sollte die Infrastruktur fuer unsere Applikation hochgezogen sein.

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
# juju status
Model Controller Cloud/Region Version
ebooks2 localhost-localhost localhost/localhost 2.0.0

App Version Status Scale Charm Store Rev OS Notes
ebook-wunschliste active 1 ebook-wunschliste local 0 ubuntu

Unit Workload Agent Machine Public address Ports Message
ebook-wunschliste/0* active idle 0 10.84.44.56 application up-to-date

Machine State DNS Inst id Series AZ
0 started 10.84.44.56 juju-703543-0 xenial

</code></pre><!-- /codeblock -->

Die Konfigurationsparameter mit den Credentials fehlen aber noch. WIr koennen die Juju GUI starten und das ueber die Admin-Console des Controllers tun:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>

# juju gui
Opening the Juju GUI in your browser.
If it does not open, open this URL:
https://10.84.44.91:17070/gui/b0681f81-91a5-4aae-8eb5-23c8f5703543/
Couldn't find a suitable web browser!
Set the BROWSER environment variable to your desired browser.

</code></pre><!-- /codeblock -->

Die Credentials zum Login erhalten wir mit 

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
# juju show-controller --show-password
</code></pre><!-- /codeblock -->

<img src="/images/quick-uploads/p584/2017-03-01_1_.png" width="585" height="386"/>

Nach Eingabe der AWS-Credentials und dem Klicken auf Deploy, werden diese auf den Units ausgerollt. Danach sollte unsere Applikation laufen:

<img src="/images/quick-uploads/p584/2017-03-01.png" width="585" height="386"/>

Man koennte jetzt noch mehrere Units der Applikation starten oder eine ganz andere Cloud benutzen (juju switch). Weiteres Highlight der Juju Charms sind Relations. Entweder ueber die GUI oder mit <code>juju add-relation</code> lassen sich Verbindungen herstellen - etwa eine Webanwendung mit einer Datenbank oder einem Proxy. Will man Dienste nach draussen freigeben, geht dies mit <code>juju expose</code>.

Anschauungsbeispiele kann man sich herunterladen mit <code>charm pull lamp</code> oder <code>charm pull mediawiki</code>. Man wird dann schnell feststellen, dass die meisten Hooks in Python geschrieben sind - das ist aber keine Bedingung. Im <a href="https://jujucharms.com/store">Juju Charm Store</a> kann man in einer Sandbox die Applikationen des Stores testen oder den Source-Code der Charms dort anschauen.

Abschliessend sei noch bemerkt. Juju Charm wird aktiv weiterentwickelt. Selbst wenn man Ubuntu 16.04 frisch installiert, stimmt die Dokumentation nicht immer ueberein. Auch der Befehlssatz wird immer weiterentwickelt. Fehlgeschlagene Installationen kriegt man zum Beispiel nur mit <code>juju destroy-model ebooks</code> wieder los. Man darf gespannt sein, wie sich das Zauberkaestchen noch weiter entwickelt. 

Alle Informationen zu Juju auf https://www.ubuntu.com/cloud/juju


[video:youtube:tsou9S6NoDg]
