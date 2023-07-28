---
layout: post
tag: container
title: Container steuern mit Ansible über LXD-API
subtitle: "Dass lxc als Client mit LXD ueber eine REST-API kommuniziert, hatte ich in einem frueheren Beitrag schon geschrieben. Beschrieben ist das ganze hier. Zur Authorisierung wird vom LXD-Daemon ein Client-Zertifikat ausgestellt, wenn man das trusted_password&hellip;"
date: 2016-07-02
author: eumel8
---

Dass <strong>lxc</strong> als Client mit LXD ueber eine REST-API kommuniziert, hatte ich in einem frueheren Beitrag schon geschrieben. Beschrieben ist das ganze <a href="https://github.com/lxc/lxd/blob/master/doc/rest-api.md">hier</a>.
Zur Authorisierung wird vom LXD-Daemon ein Client-Zertifikat ausgestellt, wenn man das trusted_password eingegeben hat.
<br/>
Und alles was eine API hat, laesst sich grundsaetzlich auch mit Ansible ansteuern. Fuer die Open Telekom Cloud hatte ich das schon mal <a href="https://github.com/eumel8/ansible-otc">hier</a> gezeigt. Ueber das eingebaute URI-Modul kann man aus Ansible schoen mit der REST-API des entsprechenden Cloud-Dienstes kommunizieren. Bei LXD funktioniert das noch nicht so komfortabel, da Client-Zertifikate erst ab Version 2.2. unterstuetzt werden sollen. Deswegen muss man sich mit einem curl-Aufruf in Shell begnuegen.

Als erstes brauchen wir eine trusted connection zur LXD-API. Die stellen wir bereit, indem wir mit openssl ein Zertifkkat generieren und dieses dann von der API zertifizieren lassen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
- name: create self-signed SSL cert
 shell: openssl req -new -nodes -x509 -subj "/C=DE/ST=Berlin/L=Berlin/O=LXD/CN=mylxd" -days 3650 -keyout mylxd.key -out mylxd.crt -extensions v3_ca creates=mylxd.crt

- name: check auth
 command: 'curl -s -k --cert mylxd.crt --key mylxd.key https://127.0.0.1:8443/1.0'
 register: authtoken

- name: request auth
 command: 'curl -s -k --cert mylxd.crt --key mylxd.key https://127.0.0.1:8443/1.0/certificates -X POST -d ''{"type": "client", "password": "12345"}'''
 when: authtoken.stdout.find('untrusted') != -1
</code></pre><!-- /codeblock -->

Wenn die API auf die erste Anfrage mit "trusted" anwortet, haben wir ein gueltiges Zertifikat und koennen damit arbeiten. Um zum Beispiel uns alle laufenden Container anzeigen zu lassen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
 tasks: 
 - name: show containers
 command: 'curl -s -k --cert mylxd.crt --key mylxd.key https://127.0.0.1:8443/1.0/containers'
 register: show_container
</code></pre><!-- /codeblock -->

Weitere Moeglichkeiten sind das Auflisten von Profilen, Netzwerken, sowie das Anzeigen von Events.
Einen Container starten koennen wir mit folgendem POST-Befehl:

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
 tasks: 
 - name: create container
 command: 'curl -s -k --cert mylxd.crt --key mylxd.key https://127.0.0.1:8443/1.0/containers -X POST -d ''{"name": "u1","architecture": "x86_64","profiles": ["default"],"persistent": true,"source": {"alias": "x","protocol": "simplestreams","server": "https://cloud-images.ubuntu.com/releases","type": "image"}}'''
 register: show_container
</code></pre><!-- /codeblock -->

Hier verwenden wir den Standard-Image-Store mit Ubuntu-Images. Der Alias "x" steht fuer das 16.04er Release und unser Container heisst u1. 
Genauere Informationen ueber u1 bekommen wir mit diesem Aufruf:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
 tasks: 
 - name: show container
 command: 'curl -s -k --cert mylxd.crt --key mylxd.key https://127.0.0.1:8443/1.0/containers/u1'
 register: show_container
</code></pre><!-- /codeblock -->

Recht einfach, oder? Das komplette Beispiel mit den wichtigsten API-Interaktionen liegt auf Github unter <a href="https://github.com/eumel8/ansible-lxd">https://github.com/eumel8/ansible-lxd</a>
