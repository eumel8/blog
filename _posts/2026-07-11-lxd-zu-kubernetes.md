---
layout: post
tag: inet
title: LXD zu Kubernetes
subtitle: "Der Finale Umzug"
date: 2026-07-11
author: eumel8
background: '/images/17837467709678.png?4362984378'
---

# Intro

Ein Jahr ist es gerade her, dass wir uns mit dem LXD-Update auf Ubuntu 24.04 abgemüht haben. Und es war die Hölle. Warum jetzt also ein neuer Umzug? Und wird es wirklich der finale sein? Das würde bedeuten, wir hätten die finale Lösung gefunden. Schauen wir mal.

# Der LXD-Rechner

Der ist das Hauptproblem. Ich weiss, alles wird teurer, Chip-Krise, Strom ... 47 Euro will Servdiscount mittlerweile jeden Monat von mir haben. Das geht deshalb, weil ich aus unerfindlichen Gründen einen Prepaid-Vertrag dort habe - seit 9 Jahren! Die Laufzeit beträgt 1 Monat, also muss man jeden Monat Münzen einwerfen. Und auch das Einwerfen kostet noch Gebühren, sodass man bei fast 50 Euro landet. Was bekommt man dafür? Einen 13 Jahre alten Supermicro Rechner. Ja, er tut, aber warum muss er immer teurer werden, je älter der wird? Es gibt wesentlich bessere Angebote, auch wenn generell alles teurer wird. Und will man dann wieder LXD haben, wenn man die Hälfte der Dienste eh schon auf Kubernetes betreibt, also schlimmstenfalls noch ein Mischbetrieb in Frage kommt?

# Der Neue

Der Neue stammt aus den [Ionos Powerdeals](https://www.ionos.de/server/value-dedicated-server) und ist 9 Jahre alt, hat SSD, doppelt so viel RAM und kostet 10 Euro weniger. Auch monatlich kündbar, aber der Vertrag läuft einfach weiter und man muss sich nicht immer einen Knoten im Kalender machen, damit man das Bezahlen nicht vergisst.

# Mikrodienste

Unter LXD hatten wir schon alle Dienste in extra LXD-Container unterteilt: DNS, Mail, Web. Alle hatten ihr eigenes Betriebssystem, dem Rechner im Rechner, und man konnte dadrin alles installieren und werkeln. Will man umziehen, kopiert man einfach den Container von A nach B und schon gehts weiter. Gegen den völligen Wildwuchs hat man ein Config-Management, etwa für DNS-Zonen oder die Apache-VHost-Config. Die lag im Gitlab im Homelab. Die Pipeline hat daraus ein Debian-Package gebaut, das wurde mit Rsync und eigenem Repo-LXD auf die Container verteilt, dort in ein Verzeichnis installiert und dann mit puppet apply ausgerollt. Man brauch also noch Puppet-Manifeste und einen Puppet-Client.

Wenn man eine Webapp entwickelt, muss man DNS-Einträge machen, Apache konfigurieren, diese Configs ausrollen und dann die Webapp mit lxd file push in den Container bugsieren. Oder man hat ein Repo mit einem Dockerfile, einer Github Action Pipeline, die draus einen Dockercontainer baut, pusht, sodass man den nur noch im Kubernetes-Cluster mit einem statischen Helm-Chart bestehend aus Deployments Manifest, Service und Ingress installieren kann. Das war das neue Zielbild, denn so lief es schon die ganze Zeit im Homelab für andere Projekte.

# Spezielle Spezialdienste

So eine Webapp-Container ist heute weit verbreitet - ob Nginx, Hugo, NodeJs, ja selbst Apache gibt es schon als fertige Docker-Images. Auch Helm-Charts gibt es dazu wie Sand am Meer. Aber meist krankt das dann ein einer bestimmten Einstellung, die man nicht machen kann. Deswegen macht es Sinn, sein eigenes Webapp-Helm-Chart zu erstellen. Es ist sehr wartungsarm und man kann es jederzeit erweitern.

Wie sieht es jetzt mit anderen Diensten aus? Für MySQL sieht die Welt schon dünner, ich hatte das in der Vergangenheit auch schon mal intensiv untersucht. Neuerdings bin ich bei [Kubelauncher](https://github.com/kubelauncher/) hängengeblieben. Die bieten ein paar Helm-Charts an, wovon das MySQL-Chart am besten passte. Mir reicht auch eine Single-Instanz, wenn auch das Chart sogar Replikation könnte. Für die Backups habe ich mich für einen Cronjob mit mysqldump entschieden. Funktioniert im [GNUU Projekt](https://github.com/gnuu-de) ganz wunderprächtig. Der Dienst läuft jetzt schon das fünfte Jahr auf Kubernetes.

Für DNS bietet Ubuntu einen fertigen Bind9-Container. Das Helm-Chart dazu ist wieder eine Eigenentwicklung. Das Statefulset für die App ist nicht weiter kompliziert, die Zonenverwaltung ist da schon trickreicher, wenn man wie gewohnt jedes Zonen-File extra editieren will und die Syntax wie gewohnt weiter so aussehen soll. Ausserdem soll natürlich named die Zone neu laden, wenn es Änderungen gibt. Da gibt es derzeit noch Verbesserungsbedarf.

Auch Postfix und Dovecot wanderten in den Container. Chart und Container sind selbst gebaut, da Postfix und Dovecot MySQL als Backend benutzen und das gibts nicht von der Stange. Allein die Queries zur DBpostfix sind noch ursprünglich, als alles noch auf der VM lief.

# Eigene Registry

Nicht immer wil man seine Container public hosten, weil deren Inhalt sowieso public ist, wie etwa eine statische Webseite. Github bietet zwar auch private Repos an, aber wie man in letzter Zeit las, werden deren Inhalte auch gerne durch die KI indiziert und lassen Daten nach aussen leaken. Ausserdem läuft so eine Build-Pipeline relativ lang und sehr oft landet man auf Fehlern, vor allem im Entwicklungsprozess.

Die Lösung: registry:2. Docker stellt hier seine eigene Registry zur Verfügung. Wieder ein Helm-Chart dazu gebastelt, Storage drunter geschoben, die lokale Registry in der Container-Runtime des eigenen Clusters untergeschoben und schon kann man Images quasi im Oneliner erstellen:

```bash
buildah bud -t registry-registry:5000/media-eumel-de:latest .
buildah push --tls-verify=false registry-registry:5000/media-eumel-de:latest
```

Okay, ein Zweizeiler. Und man brauch noch eine Build-Umgebung, passenderweise ein zweites Statefulset, welches die Quellen, etwa unserer Media-Webapp, bereithält. Und eine Verbindung zur Registry hat, über den Service. 
Der Vorteil: Man muss sich nicht Gedanken über geheime Inhalte im Container wie Passwörter oder Nacktbilder machen. Es bleibt ja alles lokal und wird nur später über den Ingress der Weltöffentlichkeit präsentiert. Das Dateisystem ist read-only, was auch bei PHP ganz gut funktioniert, wenn man die beschreibbaren Verzeichnisse als emptyDir im Deployment mountet. Die Anzahl der PVCs wird so drastisch dezimiert, was vor allem bei einem möglichen Umzug wieder zugute kommt. Ausserdem kann man den Container im Homelab testen: Einfach anderen Ingress dran, oder mit port-forward auf den Pod verbinden.

# Kubernetes

Lange Zeit habe ich Rancher die Treue gehalten. Später kam der Wechsel auf k3s. Klappt alles sehr gut. Jetzt bin ich bei kubeadm gelandet, also der "normalen" Kubernetes-Installation.
Dazu habe ich ein `k8s.sh`, welches den Rechner vorbereitet, Repos einrichtet, Kernel-Module lädt, Sysctl-Einstellungen macht, Container-Runtime installiert. Dann wid kubelet, kubeadm, kubectl installiert und fertig ist auch schon der 1-Node-Cluster. Mehr Knoten können mit join-Kommando beitreten, wenn es denn mal so kommen sollte. Eigentlich eine ganz nette Idee bei einer monatlichen Mietdauer. Bei geplanten Events, wo man mehr Rechenleistung benötigt, bestellt man einen zweiten Rechner, bereitet den mit dem Shell-Script vor und joint dann den Kubernetes-Cluster als weiterer Worker-Node. Ist das Event vorbei, skalliert man wieder runter, kündigt den Rechner wieder und lebt mit dem einen Node weiter. Ist aber nur ein theoretischer Ansatz, wurde noch nicht getestet.

Getestet wurde aber schon die Update-Funktion. Mit `apt update && apt -y upgrade` den Rechner auf den neuesten Stand bringen, und dann Kubernetes updaten:


```bash
apt install kubeadm=1.34.8-1.1
kubeadm upgrade plan
kubeadm upgrade apply v1.34.8
```

# Traefik

Wer es noch nicht wusste: Ingress Nginx ist tot. Das Kubernetes Projekt wurde eingestellt. Jetzt gibt es zwar 9000 Forks und man könnte das irgendwie weiterfummeln, aber eigentlich haben wir seit langer Zeit auch schon eine Alternative im Einsatz: Traefik, Über den Umstieg haben wir uns [hier](https://k8sblog.eumel.de/2025/11/18/traffic-mit-traefik.html) schon Gedanken gemacht, aber wir starten hier auf der gründen Wiese und können sofort auf Traefik setzen. Wir benutzen das normale Traefik-Helm-Chart und brauchen als Konfigurations-Optionen jede Menge `ports:`, weil wir ja Dienste wie DNS (53 udp/tcp) oder Mail (25,587, 110, 143 tcp) anbieten. Witzigerweise muss man dazu bei Ionos anrufen, um Port 25 freigeschaltet zu bekommen. Aber keine Sorge, man muss nicht als Referenz angeben, dass man jahrelang postmaster@arcor.de gewesen ist.

# Flux

Ein sehr gut funktionierender GitOps-Ansatz ist [Flux](https://fluxcd.io). Es ersetzt quasi rsync, deb und Puppet. Die Konfiguration, etwa eines Helm-Charts liegt im Git. Flux verbindet sich zu diesem Git und fängt an einer Stelle an, Resourcen einzulesen. Diesen Vorgang nennt man Bootstrap. Dazu brauch man Zugriff auf ein Repo. Wenn man nur ein privates Gitlab hat, ohne Zertifikat und Extra-Bums, geht die Authentifizierung nur mit Basic-Auth. Dazu brauchen wir noch einen PAT, Gitlab Personal Access Token:

```bash
#flux install
#docs: https://fluxcd.io/flux/installation/

if ! which flux &>/dev/null; then
  curl -s https://fluxcd.io/install.sh | sudo bash
fi

flux bootstrap git \
  --url=http://10.8.0.50/eumel/eumelnet.git \
  --branch=k8s \
  --path=clusters/k8s \
  --username=oauth2 \
  --password=glpat-xxxx \
  --allow-insecure-http
```

Im Verzeichnis clusters/k8s im Branch k8s im Repo eumelnet liegt dann eine `kustomization.yaml`, die dann etwa auf ein `HelmRelease` verweist, um damit dann das Helm-Chart zu installieren. 
Das lässt sich dann beliebig verschachteln, so wie es am besten passt, was man als erstes brauch und welche Abhängigkeiten es gibt.  Die Repo Struktur sieht vielleicht so aus:


```
eumelnet/
├── clusters/k8s/flux-system/   # Flux entry point: gotk-components, gotk-sync, Kustomizations
├── namespaces/k8s/             # Namespace definitions (backup, dns, mail, monitoring, registry, traefik, webapps)
├── traefik/k8s/                # Traefik HelmRelease, middlewares, redirect ingresses
├── dns/k8s/                    # BIND9 HelmRelease + zone files ConfigMap
├── mysql/k8s/                  # MySQL HelmRelease
├── mail/k8s/                   # Postfix/Dovecot StatefulSet, ConfigMap, TCP IngressRoutes
├── registry/k8s/               # Local container registry + Buildah sidecar
├── webapps/k8s/                # HelmRelease per webapp (13 sites)
├── monitoring/k8s/             # Prometheus + Grafana + Loki stack
├── backup/k8s/                 # CronJobs backing up to Garage S3
├── local-path-provisioner/k8s/ # Rancher local-path as default StorageClass
├── flux.sh                     # Flux bootstrap script
└── k8s.sh                      # Node bootstrap script (kubeadm + CRI-O)
```

Wenn man nun im Git etwas ändert, schnappt sich nach einem Zyklus von 5 Minuten Flux den nächsten Commit und macht die Änderungen im Cluster. Wird hingegen im Cluster manuell etwas geändert, stellt Flux den ursprünglichen Zustand aus dem Repo wieder her. Dazu bedarf es nur der Resourcen Gitrepositories, Kustomization und HelmReleases.

# OpenCode

Ohne KI geht heute gar nichts. Und wenn es sowas wie ein `PermanentRedirect` aus der Apache-Config ist, was man in Traefik darstellen will. Die KI kennt sofort die Antwort. OpenCode ZEN stellt mit dem Model Big Pickle eine kostenlose KI-Lösung zur Verfügung, die nach dem heutigen Stand der Technik alle Tricks drauf hat, um so einen Stack zu betreiben. Wenn man unser Git-Repo über VPN noch lokal auscheckt, kann die KI im Git Änderungen machen, die über Flux ausrollen und den Fortschritt im Cluster beobachten, da OpenCode natürlich auch lokalen Zugriff auf den Cluster hat. Selbst wenn unser Pickle-Limit erreicht ist, lohnt es sich ein paar Euro Budget für ein kostenpflichtiges Modell einzusetzen und so seinem Ziel wesentlich schneller näher zu kommen als man es durch eigene Bastelei hinbekommen würde. 
Ja, ich bastel gern, aber es gibt auch noch andere Dinge im Leben, für die man plötzlich viel mehr Zeit hat.


