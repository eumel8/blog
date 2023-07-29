---
layout: post
tag: general
title: Arbeiten im Kollektiv - mcollective mit rabbitmq
subtitle: "In der Sache der parallelen Datenverarbeitung fehlt es zuweilen an Tools, die leicht zu installieren sind und dennoch einen gewissen Mehrwert als pssh bieten. Einen Anspruch darauf erhebt MCollectiv"
date: 2013-07-08
author: eumel8
---

<p>In der Sache der parallelen Datenverarbeitung fehlt es zuweilen an Tools, die leicht zu installieren sind und dennoch einen gewissen Mehrwert als <a href="http://software.opensuse.org/package/pssh">pssh</a> bieten. Einen Anspruch darauf erhebt <a href="http://docs.puppetlabs.com/mcollective/">MCollective</a> [teaserbreak] Marionette COllective (MCOllective) wird als Framework zur Server Orchestrierung und parallele Jobausfuehrung betrieben. Die gute Nachricht ist zugleich eine schlechte, denn wer schluesselfertige Loesungen erwartet, wird erstmal enttaeuscht. Dennoch lohnt sich vielleicht ein Blick unter die Motorhaube.</p>
<p> </p>
<p>Installiert wird MCollective als Server auf allen beteiligten Instanzen, sowie als Command Line Tool (CLI) auf dem Admin Node. Damit ist die Richtung des Datenflusses schon klar: Der Admin Node moechte zu den Servern connecten und dort gewisse Dinge tun. Was er dort tun kann, muss dem Server durch die Verknuepfung bestimmter Plugins beigebracht werden. Da sind dann so Sachen wir Paketverwaltung oder Kontrolle von Diensten. Und da ganz viele Nachrichten von allen Systemen eingezogen und ausgegeben werden koennen, bedarf es einer Message Queue. An der Stelle kommt <a href="http://www.rabbitmq.com/">RabbitMQ</a> ins Spiel.</p>
<p> </p>
<p>Einen Installationsversuch kann man zwar wagen mit Sourceinstallation oder Puppet-Module von https://github.com/puppetlabs/puppetlabs-mcollective, aber da werden sich bald Versionskonflikte auftun und man wird feststellen, dass das alles nicht besonders passt. Weit ergiebiger sind fertige RPM-Paket in den Sourcen vom OBS, die man in sein System einbinden kann, um dann die erforderlichen Pakete zu installieren:</p>

```bash
zypper addrepo http://download.opensuse.org/repositories/systemsmanagement:puppet/openSUSE_12.1/systemsmanagement:puppet.repo 
zypper refresh 
zypper install mcollective 
zypper addrepo http://download.opensuse.org/repositories/systemsmanagement:chef:10/openSUSE_12.1/systemsmanagement:chef:10.repo 
zypper refresh 
zypper install erlang 
zypper install rabbitmq-server 
zypper install rabbitmq-server-plugins 
```


Wenden wir uns erst der Installation des RabbitMQ-Servers zu. Er sollte sinnigerweise auf dem Admin Node laufen, dazu brauchen wir erlang, rabbitmq-server und die rabbitmq-server-plugins. Der Server sollte auch out of the box laufen, aber wir brauchen natuerlich noch Anpassungen fuer MCollective: 

```bash
rabbitmqctl add_vhost /mcollective 
rabbitmqctl add_user mcollective secret 
rabbitmqctl set_permissions -p "/mcollective" mcollective ".*" ".*" ".*" 
```

Wir haben so einen neuen VHost fuer unsere Queue, einen User "mcollective" und ein Passwort "secret" und Zugriffsrechte fuer den User auf den VHost. 

```bash
rabbitmq-plugins enable amqp_client 
rabbitmq-plugins enable rabbitmq_stomp 
rabbitmq-plugins enable rabbitmq_management 
```

RabbitMQ wollen wir mit Stomp benutzen und ueber Web administrieren. Die einzige Konfigurationsdatei, die wir anlegen muessen ist: /etc/rabbitmq/rabbitmq.config 

```bash
%% Single broken configuration 
[ {rabbitmq_stomp, [{tcp_listeners, [{"0.0.0.0", 6163}, {"::1", 6163}]}]} ]. 
```

Jetzt koennen wir mit 

`/etc/init.d/rabbitmq-server start`

den Service starten. Ueber http://127.0.0.1:15672/#/exchanges sollten wir auf die Web-Administrationsoberflaeche des RabbitMQ zugreifen koennen (default login: guest/guest). Unter "exchanges" muessen wir noch 2 Eintraege fuer unsere mcollective Queue machen:
<p> </p>
<div class="image_block"><a href="/images/rabbitmq.jpg?mtime=1373315916"><img src="/images/rabbitmq.jpg?mtime=1373315916" alt="" width="653" height="735" /></a></div>
<p>Die letzten 2 Eintraege sind neu und muessen durch uns hinzugefuegt werden.</p>
<p> </p>
<p>Unter /etc/mcollective gibt es sowohl eine server.cfg als eine client.cfg. Beide Konfigurationsfiles benoetigen die Infos ueber den Connector und den RabbitMQ Service: 
</p>

```bash
connector = rabbitmq 
plugin.rabbitmq.vhost = /mcollective 
plugin.rabbitmq.pool.size = 1 
plugin.rabbitmq.pool.1.host = localhost 
plugin.rabbitmq.pool.1.port = 6163 
plugin.rabbitmq.pool.1.user = mcollective 
plugin.rabbitmq.pool.1.password = secret 
```
<p></p>

<p>Passende Kommandos zum Auffinden und Testen der Clients:</p>

```bash
# mco find -v 

Discovering hosts using the mc method for 2 second(s) .... 2 

mcollective 
nagios3 

Discovered 2 nodes in 2.00 seconds using the mc discovery plugin 
```

<p>und</p>

```bash
# mco ping 
mcollective time=53.44 ms 
nagios3 time=55.38 ms 
```

<p>und</p>

```bash
# mco inventory nagios3 

Inventory for nagios3: 
Server Statistics: 
Version: 2.3.1 
Start Time: Tue Jul 02 22:56:31 +0200 2013 
Config File: /etc/mcollective/server.cfg 
Collectives: mcollective 
Main Collective: mcollective 
Process ID: 19395 
Total Messages: 15 
Messages Passed Filters: 15 
Messages Filtered: 0 
Expired Messages: 0 
Replies Sent: 14 
Total Processor Time: 0.05 seconds 
System Time: 0.01 seconds 

Agents: discovery rpcutil 
Data Plugins: agent fstat 

Configuration Management Classes: No classes applied 

Facts: mcollective =&gt; 1 

```

<p></p>
<p>
Fuer etwas mehr Funktionalitaet koennen wir noch ein paar Plugins installieren. Ausgangspunkt ist https://github.com/puppetlabs/mcollective-puppet-agent https://github.com/puppetlabs/mcollective-plugins/ beschrieben in http://projects.puppetlabs.com/projects/mcollective-plugins/wiki Wenn wir zum Beispiel https://github.com/puppetlabs/mcollective-puppet-agent/archive/master.zip herunterladen und auspacken, koennen wir alle Files einfach in das "libdir" in /etc/mcollective/server.cfg benannte Verzeichnis kopieren, mcollective neu starten und haben das neue Kommando 
</p>

```bash
# mco puppet status 

* [ ============================================================&gt; ] 1 / 1 

mcollective: Currently stopped; last completed run 15895 days 9 hours 38 minutes 02 seconds ago 

Summary of Applying: false = 1 
Summary of Daemon Running: stopped = 1 
Summary of Enabled: enabled = 1 
Summary of Idling: false = 1 
Summary of Status: stopped = 1 

Finished processing 1 / 1 hosts in 47.30 ms 

```

```bash
# mco puppet runonce

 * [ ==========================================================> ] 1 / 1




Finished processing 1 / 1 hosts in 591.58 ms
```
