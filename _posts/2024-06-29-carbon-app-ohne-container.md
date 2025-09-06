---
layout: post
tag: inet
title: Carbon App ohne Container
subtitle: Grüner Strom in Echtzeit messen
date: 2024-06-29
author: eumel8
background: '/images/carbon-measure.png?4362984378'
twitter: 'images/blog-eumel-de.png?4362984378'
---

# Einstieg

Im [K8S Blog](https://k8sblog.eumel.de/2023/11/14/sustainable-computing.html) haben wir uns schon mal mit Nachhaltigem Computern und Green-IT auseinandergesetzt. In [diesem Blog](https://blog.eumel.de/2024/06/19/raspberry-pi-carbon-app.html) haben wir ein Frontend zur Energie-Ampel installier. Hier wollen wir die Entsoe-Python-App ohne Kubernetes installieren und die Daten in einen lokalen Prometheus (ebenfalls ohne Kubernetes) vorhalten. Warum? Der Aufwand für einen eigenen Cluster ist für die eine App immer noch recht hoch. Und wir brauchen das graphische Frontend für die Ampel auf dem Raspberry. Es gibt nichts vergleichbares auf Kubernetes-Basis.

# Energieampel Raspberry

Wie in den oben erwähnten Blog-Beiträgen beschrieben ist ein Raspberry mit 3,5 Zoll Display mit einem debian-ähnliche Betriebssystem die Ausgangssituation.

# Installation ohne Container

```bash
sudo su -
apt install prometheus
cd /usr/local
git clone https://github.com/caas-team/caas-carbon-footprint.git carbonapp
cd carbonapp
python3 -m venv venv
./venv/bin/pip3 install -r requirements.txt
```

/usr/local/carbonapp/env

```
entsoe_api_key=xxxxx
entsoe_start=2
entsoe_end=1
```

/etc/systemd/system/carbonapp.service

```
[Unit]
Description=Carbon app service
Wants=network-online.target
After=network-online.target
[Install]
WantedBy=multi-user.target
[Service]
Type=simple
Restart=always
ExecStart=/usr/local/carbonapp/venv/bin/python3 /usr/local/carbonapp/flask/app.py
EnvironmentFile=-/usr/local/carbonapp/env
```

/etc/prometheus/prometheus.yml

```
scrape_configs:
  - job_name: 'entsoe-carbon-footprint'
    metrics_path: /metrics
    scrape_interval: 2m
    scrape_timeout: 30s
    static_configs:
      - targets:
          - localhost:9091
```

```bash
systemctl enable carbonapp.service
systemctl enable prometheus
systemctl start carbonapp.service
systemctl start prometheus
```

Fortan sollte die Entsoe-Carbon-App auf Port 9091 und Prometheuis auf Port 9090 erreichbar sein. 

Aber Vorsicht: Die Dienste stehen ggf. ungesichert im Internet. Wer das nicht will, kann in der app.py `127.0.0.1` statt `0.0.0.0` einstellen und Prometheus mit `--web.listen-address="127.0.0.1:9090"` starten. Andererseits werden keine geheime Daten exposed, die Entsoe-Daten sind sowieso public.

Happy Planet!
