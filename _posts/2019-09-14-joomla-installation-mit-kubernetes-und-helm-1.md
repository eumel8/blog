---
layout: post
tag: cloud-computing
title: Joomla Installation mit Kubernetes und Helm
subtitle: "Kubernetes ist in aller Munde. Genau wie OpenStack ist es ein Oekosystem zur Verwaltung von Resourcen fuer die Cloud. Es hat den Anspruch, der Standard zur Verwaltung von Infrastruktur schlechthin zu werden."
date: 2019-09-14
author: eumel8
---

Kubernetes ist in aller Munde. Genau wie OpenStack ist es ein Oekosystem zur Verwaltung von Resourcen fuer die Cloud. Es hat den Anspruch, der Standard zur Verwaltung von Infrastruktur schlechthin zu werden. Vor einiger Zeit hatte ich mich <a href="https://blog.eumelnet.de/blogs/blog8.php/zauberei-mit-juju-serverless-computing">mit Juju beschaeftigt</a> - gewisse Parallelen ergeben sich in Kubernetes. Wir werden sehen.


<br/>
<strong>Vorbedingungen:</strong>
Fuer dieses Beispiel nutzen wir eine Virtuelle Maschine, bereitgestellt etwas mit <a href="https://blog.eumelnet.de/blogs/blog8.php/terraform-open-telekom-cloud-quick-start">Terraform auf der OTC</a>. Dies erstellt uns eine VM mit Ubuntu 18.04 und 30 GB Festplatte, mit Netzwerk und Floating-IP

<strong>Minikube</strong>
Minikube ist eine Minimalversion von Kubernetes, die alle wichtigen APIs zur Verfuegung stellt, aber keine grossen Resourcen benoetigt. Die Installation ist denkar einfach.

System aktualisieren, Docker installieren, um dies als Infrastruktur fuer Kubernetes zu verwenden:

```bash
apt update && apt upgrade && apt install docker.io socat
```

Minikube herunterladen

```bash
curl -Lo minikube https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 && chmod +x minikube
```

Minikube starten. Mit dem Node-Port-Parameter erlauben wir spaeter das Herausfuehren von Diensten:

```bash
./minikube start --vm-driver=none --extra-config=apiserver.service-node-port-range=80-35000
```

<strong>Kubectl</strong>
Kubectl ist das Kommandozeilenwerkzeug fuer Kubernetes. wir installieren es mit curl:

```bash
curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl && chmod +x kubectl && cp kubectl /usr/local/bin/
```

Minikube hat schon eine passende Konfigurationsdatei in `.kube/config` bereitgestellt. War die Installation bis hierhin erfolgreich, sollte die Programmausgabe so aussehen:

```bash
# kubectl get nodes -o wide
NAME STATUS ROLES AGE VERSION INTERNAL-IP EXTERNAL-IP OS-IMAGE KERNEL-VERSION CONTAINER-RUNTIME
minikube Ready master 3m15s v1.15.2 192.168.1.170 <none> Ubuntu 18.04.3 LTS 4.15.0-58-generic docker://18.9.7
```


<strong>
Helm
</strong>

Helm ist ein Werkzeug zur Programmverwaltung. Notwendige Resourcen fuer Kubernetes sind in Vorlagen (`templates`) definiert und koennen mit Werten (`Values.yaml`) gefuellt werden. Die Installation von Programmen erfolgt versioniert (`Chart.yaml`). 
Zuerst installieren wir wieder das Kommandozeilenwerkzeug:

```bash
curl -L https://git.io/get_helm.sh | bash
```

<strong>
Tiller
</strong>

Tiller ermoeglicht die Bereitstellung von Kubenetes-Resourcen mit Helm, verbindet also beides:

```bash
kubectl --namespace kube-system create serviceaccount tiller
kubectl create clusterrolebinding tiller --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
helm init --service-account tiller
```

<strong>
Helm Charts
</strong>

Charts sind jetzt Applikationsbeschreibungen innerhalb etwa eines Katalogs. Wir laden so einen Katalog local herunter:

```bash
git clone https://github.com/helm/charts.git
cd charts/stable/
```

Hier befinden sich eine Vielzahl von Applikationen, wie etwa auch Joomla. 

<strong>
Joomla Installation
</strong>

Als LAMP Anwendung benoetigt Joomla eine MySQL Datenbank. Diese ist als Requirement im Joomla Chart deklariert und muss als Vorbedingung der Joomla-Installation bereitgestellt werden:

```bash
cd joomla
helm dep update
cd ..
```

Nun wollen wir endlich Joomla mit Helm installieren - im eigenen Namespace und dem Applikationsnamen joomla:

```bash
helm install --namespace joomla -n joomla joomla
```

Die Ausgabe sieht etwa so aus:

```bash
NAME: joomla
LAST DEPLOYED: Sat Sep 14 19:17:19 2019
NAMESPACE: joomla
STATUS: DEPLOYED

RESOURCES:
==> v1/ConfigMap
NAME DATA AGE
joomla-mariadb 1 0s
joomla-mariadb-tests 1 0s

==> v1/PersistentVolumeClaim
NAME STATUS VOLUME CAPACITY ACCESS MODES STORAGECLASS AGE
joomla-joomla Bound pvc-f9b7aa20-913d-4a2f-8f5b-318eeff362ba 8Gi RWO standard 0s

==> v1/Pod(related)
NAME READY STATUS RESTARTS AGE
joomla-56f6f9d644-6b8jf 0/1 ContainerCreating 0 0s
joomla-mariadb-0 0/1 Pending 0 0s

==> v1/Secret
NAME TYPE DATA AGE
joomla Opaque 1 0s
joomla-mariadb Opaque 2 0s

==> v1/Service
NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
joomla LoadBalancer 10.98.249.206 <pending> 80:14305/TCP,443:8733/TCP 0s
joomla-mariadb ClusterIP 10.103.205.27 <none> 3306/TCP 0s

==> v1beta1/Deployment
NAME READY UP-TO-DATE AVAILABLE AGE
joomla 0/1 1 0 0s

==> v1beta1/StatefulSet
NAME READY AGE
joomla-mariadb 0/1 0s



NOTES:


** Please be patient while the chart is being deployed **

1. Get the Joomla! URL by running:

 NOTE: It may take a few minutes for the LoadBalancer IP to be available.
 Watch the status with: 'kubectl get svc --namespace joomla -w joomla'

 echo "Joomla! URL: http://$SERVICE_IP/"

2. Get your Joomla! login credentials by running:

 echo Username: user
 echo Password: $(kubectl get secret --namespace joomla joomla -o jsonpath="{.data.joomla-password}" | base64 --decode)

```

Man kann den Status von Joomla auch jederzeit neu abrufen:

```bash
helm status joomla
```

Das generierte Adminpasswort laesst sich wie beschrieben abrufen.

Schauen wir uns die Resourcen fuer Joomla in Kubernetes an:

```bash
kubectl get all -n joomla
```

Die Ausgabe sieht etwa so aus:

```
NAME READY STATUS RESTARTS AGE
pod/joomla-56f6f9d644-6b8jf 1/1 Running 0 72s
pod/joomla-mariadb-0 1/1 Running 0 72s


NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
service/joomla LoadBalancer 10.98.249.206 <pending> 80:14305/TCP,443:8733/TCP 72s
service/joomla-mariadb ClusterIP 10.103.205.27 <none> 3306/TCP 72s


NAME READY UP-TO-DATE AVAILABLE AGE
deployment.apps/joomla 1/1 1 1 72s

NAME DESIRED CURRENT READY AGE
replicaset.apps/joomla-56f6f9d644 1 1 1 72s

NAME READY AGE
statefulset.apps/joomla-mariadb 1/1 72s
```

Wie man sieht, haben wir 2 PODs und 2 Services. Die EXTERNAL_IP steht fuer den Joomla-Service auf Pending, weil Minikube keinen Ingress-Service zur Bereitstellung externer Dienste anbietet. Hier koennen wir die Floating-IP unserer VM eintragen:

```bash
kubectl edit service joomla -n joomla
```

Wir ergaenzen nach dem Loadbalancer Eintrag die IP-Adresse:

```
 type: LoadBalancer
 externalIPs:
 - 80.158.23.58
```

Ergebnis:

```bash
kubectl get services joomla -n joomla
```

```
NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S) AGE
joomla LoadBalancer 10.98.249.206 80.158.36.239 80:14305/TCP,443:8733/TCP 9m41s
```

Unser Joomla ist jetzt im Internet verfuegbar, jedoch auf dem ungewoehnlichen Port 14305. Um diesen auf Port 80 verfuegbar zu machen, editieren wir erneut den Service:

```bash
kubectl edit services joomla -n joomla
```

Den `nodePort` aendern wir auf `80`. 
Joomla sollte unter http://80.158.36.239/ verfuegbar sein. Login-Credentials haben wir weiter oben bekommen. HIer nochmal zur Wiederholung:

```bash
kubectl get secret --namespace joomla joomla -o jsonpath="{.data.joomla-password}" | base64 --decode
```

In der `values.yaml`des Helm Charts ist zu sehen, dass Joomla von Bitnami bereitgestellt wird:

```
image:
 registry: docker.io
 repository: bitnami/joomla
 tag: 3.9.11-debian-9-r25
```

Die Beschreibung des Docker-Images findet man <a href="https://github.com/bitnami/bitnami-docker-joomla/blob/master/3/debian-9/Dockerfile">hier</a>. Bitnami hat seine eigene Installations-Infrastruktur entwickelt, welche gut funktioniert. Jedoch moechte man vielleicht sein eigenes Image entwickeln?

Bis dahin aber viel Spass mit Kubernetes und Joomla!
