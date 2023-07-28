---
layout: post
tag: kubernetes
title: MySQL auf Kubernetes - gut/schlecht/hässlich
subtitle: "Die meisten Applikationen kommen auch im 21. Jahrhundert nicht ohne Datenbank aus. Die beliebteste (in meinen technischen Kulturkreisen) ist MySQL. Der Dienst soll moeglichst leicht installierbar sein, am bestem im Self-Service. Wartungsarmut ist nicht&hellip;"
date: 2022-04-25
author: eumel8
---

Die meisten Applikationen kommen auch im 21. Jahrhundert nicht ohne Datenbank aus. Die beliebteste (in meinen technischen Kulturkreisen) ist MySQL. Der Dienst soll moeglichst leicht installierbar sein, am bestem im Self-Service. Wartungsarmut ist nicht von Nachteil. Dennoch sind die Daten sicher, vor Fremdzugriffen oder bei Ausfällen.
<br/>
Die derzeit bequemste Moeglichkeit, eine MySQL Datenbank im Kubernetes Cluster zu erstellen, ist der <a href="https://kubernetes.io/docs/concepts/extend-kubernetes/operator/">Operator</a>. Der User deployt "ein Stück Datenbank" im Cluster, etwa mit <code>Kind: Database</code> und dann passiert schon irgendwas. Was das ist, haengt von der Implementierung ab. Das kann das einfache Erstellen einer Datenbank irgendwo sein - entweder im Cluster selber oder als Cloud Resource extern. Dann haengt es noch vom Funktionsumfang ab, welchen Komfort der User erwarten kann. Entweder wird bloss die Datenbank erstellt, oder der User kann sie noch konfigurieren, skalieren, Backups erstellen/zurueckspielen, oder das passiert alles gar automatisch. Der Leistungsumfang wird als Operator Pattern bezeichnet und reicht von Stufe 1-5.

 
<strong><a href="https://dev.mysql.com/doc/mysql-operator/en">Oracle Operator to deploy Galera Cluster</a></strong>
Dieser Operator ist ein offizielles Oracle Produkt und funktioniert Out of the Box. Man kann einen InnoDB Cluster erstellen, Backups anfertigen und Logs anschauen. Leider ist der Operator als "non-productive" markiert. Geschrieben ist der Operator in Python.

Quellcode: https://github.com/mysql/mysql-operator
Level: 3-4

<strong>Orange OpenSource Galera Operator</strong>
Dieser Operator besticht durch seine einfache Bedienung und grossem Funktionsumfang. Er ist in Go geschrieben, hat aber keine Service Resourcen, die muss man sich in Kubernetes selbst hinzufuegen. Die anderen Resourcen wie das Operator Deployment sind IM Code selbst verankert, nicht einfach zu warten. Usermanagement fuer die Datenbank gibt es keins. Das Projekt ist mittlerweile auf Github archiviert.

Quelle: https://github.com/Orange-OpenSource/galera-operat
 
<strong>MariaDB Operator</strong>
Der Entwickler dieses Operators hat eine ganz andere Anwendungssicht. Es werden nur Single-Instanzen von MariaDB installiert, keine Cluster.
Einige Namen von Resourcen sind auch hart codiert und lassen sich nur durch Patches ueberschreiben. Normalerweise funktioniert ein Operator cluster-weit, nicht dieser - MariaDB Operator funktioniert nur im eigenen Namespace. Geschrieben ist das Programm in Go. Es sah lange Zeit so aus, als waere es nicht mehr gewartet, aber in juengster Zeit gibgt es wieder Aktivitaeten. Vom Funktionsumfang hat man sich an den Operator Approach gehalten, also man kann die Datenbank skalieren und es werden Metriken zur Verfuegung gestellt

Quelle: https://github.com/abalki001/mariadb-operator

<strong>Oracle Cloud DB Operator</strong>
Dieser Operator funktioniert nur in der Oracle Cloud. Dennoch ist er hier aufgefuehrt, da es einen sehr guten <a href="https://mysqlsg.blogspot.com/2021/09/create-manage-and-connect-to-mysql.html">Blog Post</a> zum Thema gibt. Und wer weiss, vielleicht benutzt ja jemand auch diesen Service.

Quelle: https://github.com/oracle/oci-service-operator

Das wars auch schon. Wer unzufrieden mit dem Angebot ist, kann sich selbst auf den Weg machen, einen Operator zu erstellen. Die Kubernetes Community bietet da schon sehr gute <a href="https://github.com/kubernetes/sample-controller">Beispiele</a>. Ein <a href="https://github.com/eumel8/otc-rds-operator">Selbstversuch fuer OTC RDS</a>.

Viel Spass!
