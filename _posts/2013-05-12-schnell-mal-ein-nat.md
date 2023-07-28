---
layout: post
tag: general
title: Schnell mal ein NAT
subtitle: "Hilfe Hilfe, unser INSTALL-LAN brauch Internet! Wenn unser Installserver mit eth0 Zugang zum Internet hat und an eth1 das Install-Lan mit 192.168.3.0/24 als Netzwerk haengt, hilft folgender Schnippsel, damit die Rechner im Install-Lan ueber den Install-&hellip;"
date: 2013-05-12
author: eumel8
---

Hilfe Hilfe, unser INSTALL-LAN brauch Internet! Wenn unser Installserver mit eth0 Zugang zum Internet hat und an eth1 das Install-Lan mit 192.168.3.0/24 als Netzwerk haengt, hilft folgender Schnippsel, damit die Rechner im Install-Lan ueber den Install-Server als Default-GW 192.168.3.1 Zugang zum Internet bekommen:
<br/>

```
 iptables -A FORWARD -o eth0 -i eth1 -s 192.168.3.0/24 -m conntrack --ctstate NEW -j ACCEPT
 iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
 iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
 sysctl -w net.ipv4.ip_forward=1
```
