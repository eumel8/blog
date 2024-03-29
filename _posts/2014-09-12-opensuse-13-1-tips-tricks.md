---
layout: post
tag: inet
title: OpenSUSE 13.1 - Tips & Tricks
subtitle: "..."
date: 2014-09-12
author: eumel8
---

Seit Version 13 hat sich bei OpenSuSE einiges geaendert. Die wichtigsten Werkzeuge sind <strong>systemctl</strong> und <strong>journalctl</strong>. journalctl -f ist dasselbe wie tail -f /Var/log/messages, syslog-Meldungen werden jetzt in ein Journal geschrieben, welches mit dem Werkzeug Informationen zu entlocken ist.
<br/>
Bei systemctl handelt es sich um die guten Startscripts von /etc/init.d/. Um zum Beispiel sshd zu starten, brauch man jetzt das Kommando 

```bash
systemctl start sshd.service
```

Das starten von openvpn ist <a href="https://en.opensuse.org/SDB:OpenVPN_Installation_and_Setup">hier</a> beschrieben.
Um den Dienst beim Booten zu starten, brauchen wir:

```bash
systemctl enable openvpn@server.service
```

Wenn wir mehrere VPN starten wollen:

```bash
cd /etc/openvpn
for i in `ls *.conf | awk -F. '{print $1}'`; do systemctl start openvpn@$i.service;done
```

Videotreiber fuer VMWare-Image laden:

```bash
zypper install xf86-video-vmware
```

Die Netzwerkinterface sind nicht immer mit <strong>eth0</strong> benannt. Deswegen ist nach dem Neustart eventuell kein Netzwerk vorhanden. Das alte Interface findet man so:

```bash
dmesg | grep NIC
[ 0.972405] VMware vmxnet3 virtual NIC driver - version 1.1.30.0-k-NAPI
[ 3.662878] e1000: enp0s18 NIC Link is Up 1000 Mbps Full Duplex, Flow Control: None
```

mehr?
