---
layout: post
tag: inet
title: Was ist mit Kasm?
subtitle: Grafische Benutzeroberflächen parallel betrieben
date: 2024-06-30
author: eumel8
---

# Kurzvorstellung

[Kasm Workspaces](https://kasmweb.com/) nennt sich selbst Container Streaming Plattform. Gefunden und gebraucht habe ich Kasm unlängst beim Testen einer selbst entwickelt graphischen Benutzeroberfläche. Dabei habe ich festgestellt, dass ich gar kein Linux mit X gerade zur Hand habe. Dabei hilft Kasm. Es startet in einer Dockerumgebung verschiedene vorkonfigurierte Images und verbindet sich im Browser mit einer schicken graphischen Benutzeroberfläche mittels VNC auf die entsprechende Container-Instanz. Die Installation ist denkbar einfach:

```bash
sudo apt update
sudo apt install docker.io
curl -O https://kasm-static-content.s3.amazonaws.com/kasm_release_1.15.0.06fdc8.tar.gz
tar -xf kasm_release_1.15.0.06fdc8.tar.gz
sudo bash kasm_release/install.sh
```

In der Ausgabe werden verschiedene Credentials generiert, mit der man sich über die Weboberfläche einloggen kann. Über einen Katalog kann man dann Instanzen installieren:

<img src="/images/kasm_1.png" width="1750" height="725"/>

<img src="/images/kasm_2.png" width="1750" height="725"/>

Ganz praktisch, aber Obacht: Bei Inaktivität werden die Instanzen auch mal schnell gestoppt und gelöscht. Kann man sicher auch irgendwo einstellen.
