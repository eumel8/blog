---
layout: post
tag: inet
title: S3 Tools Massenmarkt
subtitle: "S3 Objektspeicher erfreut sich immer groesserer Beliebtheit. Die Daten sind redundant abgelegt und sicher. Durch die AWS-gleiche HTTP-Schnittstelle alle Objekte quasi direkt im Internet. Oder auch nicht - je nach konfigurierten Zugriffsrechten. Mit&hellip;"
date: 2020-08-19
author: eumel8
---

S3 Objektspeicher erfreut sich immer groesserer Beliebtheit. Die Daten sind redundant abgelegt und sicher. Durch die AWS-gleiche HTTP-Schnittstelle alle Objekte quasi direkt im Internet. Oder auch nicht - je nach konfigurierten Zugriffsrechten. Mit welchen Kommandozeilen-Werkzeugen kann man auf S3 zugreifen. Eine Liste
 
<br/>

<strong>Name: s3-sync</strong>
Link: https://github.com/chilts/s3tools
Funktion: basiert auf aws-s3-sdk, S3 Hostname kann nicht geaendert werden, relativ wertlos fuer Nicht-AWS-S3-Speicher

<strong>Name: s3fs</strong>
Link/Installation: 

`` bash
$ sudo apt install s3fs
$ cat ~/.passwd-s3fs
ACCESS_KEY:SECRET_KEY
$ s3fs mb bucket-test -o url="https://obs.otc.t-systems.com"
$ mkdir /bucket-test
$ s3fs bucket-test /bucket-test -o url="https://obs.otc.t-systems.com"
$ cp /etc/motd /bucket-test
```
Funktion: S3 Buckets als Dateisystem lokal mounten ueber FUSE

<strong>Name: s3cmd</strong>
Link/Installation: 
```bash
$ sudo apt install python3-pip &amp;&amp; pip3 install s3cmd
$ s3cmd --configure
# use: access_key, secret_key host_base = obs.otc.t-systems.com
# host_bucket = %(bucket)s.obs.otc.t-systems.com
# review .s3cfg
```
Funktion

<strong>Name: ceph-bucket-sync</strong>
Link: [https://github.com/IvanJobs/ceph-bucket-sync](https://github.com/IvanJobs/ceph-bucket-sync)
Funktion: wenig Dokumentation und nicht sehr stabil.
