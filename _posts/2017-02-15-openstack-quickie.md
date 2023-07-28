---
layout: post
tag: openstack
title: OpenStack Quickie - 3 Wege, um OpenStack erfolgreich zu installieren
subtitle: "OpenStack zu installieren, war bislang nur den Experten vorbehalten. Tiefe Kenntnisse in die Materie waren notwendig, um kryptische Fehlermeldungen zu deuten und entsprechende Bugreports auszufuellen. DIe Installation dauerte Wochen, gar Monate - je&hellip;"
date: 2017-02-15
author: eumel8
---

OpenStack zu installieren, war bislang nur den Experten vorbehalten. Tiefe Kenntnisse in die Materie waren notwendig, um kryptische Fehlermeldungen zu deuten und entsprechende Bugreports auszufuellen. DIe Installation dauerte Wochen, gar Monate - je nachdem, wie gross die Plattform sein sollte oder welchen Trends man gerade nachlaeuft. Wer jetzt nicht so tief drin steckt, fragt sich vielleicht: Geht das auch einfach?
<br/>
OpenStack ist ein Cloud-Betriebsystem, welches im Wesentlichen aus 3 Komponenten besteht: Compute, Networking, Storage. Mit diesen 3 Komponenten kann man virtuelle Maschinen starten und uebers Netzwerk mit ihnen arbeiten. Dazu gibt es noch einige Zusatzkomponenten wie etwa eine Datenbank oder einen Authorisierungsdienst oder einen Message-Queue-Dienst, Letztere sind notwendig, um die API-Aufrufe der verschiedenen OpenStack-Komponenten zu koordinieren. DIe Summe dieser Dienste werden auch als Core-Services bezeichnet. Core-Services sind Nova, Glance, Neutron, Cinder, Swift, Keystone. Drum herum haben sich eine Vielzahl anderer Dienste gebildte, die die Funktion von OpenStack erweitern wie etwa Horizon, Heat, Magnum oder Murano. Es sind 15-20 Dienste, die unter dem Begriff "Big Tent", also "Grosses Zelt" verbunden sind.

Die folgenden Anleitungen sind zur Installation von OpenStack, wenn man
<ul>
 <li>schnell mal sehen will, wie das neueste Release von OpenStack aussieht</li>
 <li>die grundsaetzliche Funktionsweise von OpenStack kennenlernen moechte</li>
 <li>bestimmte Funktionen von OpenStack genauer untersuchen moechte</li>
 <li>an Teilen von OpenStack mitentwickeln moechte</li>
</ul>

Man benoetigt einen herkoemmlichen Linux-Rechner (Ubuntu) oder VM mit mindestens 4 GB RAM und bis zu 50 GB Festplattenspeicher

<strong>DevStack</strong>
Wie der Name schon sagt, sind die Zielgruppe dieses Tools Entwickler, die am OpenStack-Projekt arbeiten wollen. Mit relativ geringem Aufwand kann man hier eine lauffaehige OpenStack-Umgebung innerhalb einer Stunde hinbekommen. Der Source-Code liegt auf https://github.com/openstack-dev/devstack, es gibt verschiedene Branches wie etwa stable/newton, die dem jeweilig unterstuetzten OpenStack-Release entspricht. Mit dem Kommando <code>./stack.sh</code> startet man die Installation. Vorher kann man die local.conf noch um zahlreiche Plugins erweitern, um zusaetzliche Funktionen im Dashboard nutzen zu koennen. Aber Vorsicht: Je nach ausgecheckter Version kann DevStack instabil werden, eventuell bricht die Installationsprozedur sogar ab. DevStack ist auch nicht "reboot-fest". Die installierte Version laeuft in einer screen-Session des Benutzers, der Devstack installiert. Darin kann man zwar einzelne Dienste neu starten, aber nach einem Neustart des Rechners geht es nur mit <code>./unstack.sh; ./stack.sh</code> weiter. Eine detailierte Anleitung findet man unter https://docs.openstack.org/developer/devstack/guides/single-machine.html

<img src="/images/quick-uploads/p582/devstack1.png" width="585" height="386"/>

<img src="/images/quick-uploads/p582/devstack3.png" width="585" height="386"/>

<img src="/images/quick-uploads/p582/devstack2.png" width="585" height="386"/>

<strong>OpenStack Ansible AIO</strong>

OpenStack Ansible verfolgt einen anderen Ansatz als DevStack. Die "Reboot-Festigkeit" ist hier mit gewissen EInschraenkungen gewaehrleistet. Alle Komponenten von OpenStack werden hier separat in LXC-Container ausgelagert, die auf einem Single-Host installiert sind, aber auch auf mehrere Rechner skalieren koennen. Den Source-Code findet man auf https://github.com/openstack/openstack-ansible
Kernkomponente der Software ist hier Ansible, ein neuartiges Tool zum Konfigurationsmanagement, was sich auch im OpenStack-Umfeld wachsender Beliebtheit erfreut. Einzelne Aufgaben sind bei Ansible in sogenannte Playbooks abgelegt. Ein Playbook ist zum Beispiel https://github.com/openstack/openstack-ansible-os_horizon, bei dem das OpenStack-Dashboard installiert wird. Ziel der Installation waere der Horizon-Container der LXC-Umgebung. Nachteil hier ist, dass es ein noch relativ junges Projekt ist und es nicht so viele Plugins gibt wie etwa bei DevStack. Aber es wird kontinuierlich dran gearbeitet. Eine Installationsanleitung fuer OpenStack Ansible All in One findet man auf https://docs.openstack.org/developer/openstack-ansible/developer-docs/quickstart-aio.html

<img src="/images/quick-uploads/p582/aio.png" width="585" height="386"/>

<strong>Conjure-up</strong>
Conjure-up ist ein neuer Zauberkasten aus dem Hause Canonical. Conjure-up ist ein schmaler Layer, um die darunterliegenden Technologien Juju, MAAS und LXD besser bedienen zu koennen. Beim Starten durch <code>conjure-up</code> erscheint eine Uebersicht, womit sich sogenannte spells installieren lassen. Neben Apache Hadoop Cluster oder Kubernetes ist auch eine OpenStack-Umgebung mit NovaKVM oder NovaLXD Backend als Option vorhanden. NovaKVM benoetigt einen MAAS-Account, NovaLXD installiert OpenStack mit allen Kernkomponenten auf demselben Rechner in verschiedene LXD-Container.
Mehr Informationen unter http://conjure-up.io/

<img src="/images/quick-uploads/p582/conjure.png" width="585" height="386"/>

<strong>Jujucharm</strong>

<img src="/images/quick-uploads/p582/jujucharm.png" width="585" height="386"/>

Diese schoene Uebersicht liefert die Jujucharm-GUI, die im Juju-Framework mit dabei ist. Juju ist der Ansatz zu serverless compute made by Canonical (Ubuntu). Wie bei conjure-up schon zu sehen ist, splittet sich die Architektur in<ins> Apps</ins>, die auf <ins>Units</ins> installiert sind, die wiederum auf <ins>Machines</ins> laufen. Fuer die Maschinen benoetigt Juju einen <ins>Controller</ins> zum Steuern des Maschinenparks. Das Backend kann eine beliebige Cloud-Plattform sein: Azure, EC2, OpenStack, Rackspace, LXD. Das LXD-Backend haben wir bei conjure-up schon gesehen. Die Definition, was jetzt wo installiert wird, realisiert Juju in sogenannten Charms (Zauberei). Klassisches Beispiel ist hier LAMP: https://jujucharms.com/lamp/ Es gibt immer eine YAML-Datei mit Metainformationen und in sogenannten Hooks findet man dann teilweise herkoemmliche Shellscripte, die definieren, was zu installieren ist oder wie Dienste zu starten und zu stoppen sind. Mit <code>juju expose</code> kann man Dienste nach aussen exportieren, etwa die Webserverschnittstelle eines LAMP. Mit <code>juju add-relation</code> bringe ich Dienste in Relation - also etwa einen MySQL-Dienst fuer meine PHP-Anwendung im LAMP. 
Wie das alles mit OpenStack funktioniert, findet man hier: https://jujucharms.com/openstack Ja, richtig, mit Juju kann man auch OpenStack auf Azure oder AWS installieren. Die Uebersicht ueber den Installationsprozess sieht man mit <code>juju status</code>.

<strong>Zusammenfassung</strong>
Viele Wege fuehren nach Rom. Um OpenStack schnell zu installieren, bieten sich mehrere Moeglichkeiten an. Die bequemste ist sicherlich das DevStack. Wer sich in Ansible einarbeiten will, schaut vielleicht bei OpenStack-Ansible vorbei. Juju geniest derzeit noch ein Nischendasein. Voellig zu unrecht. Die Community ist nicht sehr gross, aber es ein interessanter Ansatz zum <a href="https://en.wikipedia.org/wiki/Serverless_computing">serverless computin</a>g. Schaut mal rein!
