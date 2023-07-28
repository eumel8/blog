---
layout: post
tag: kubernetes
title: Kubernetes Install Quickies
subtitle: "Kubernetes erweckt den Eindruck, hochkompliziert zu sein. Und meistens ist es das auch. Aber es gibt einige sehr leichgewichtige Tools bzw. Methoden, um Kubernetes schnell zu installieren. Es sind nur ein Kommandozeilen und hier sind einige Methoden:"
date: 2019-12-05
author: eumel8
---

Kubernetes erweckt den Eindruck, hochkompliziert zu sein. Und meistens ist es das auch. Aber es gibt einige sehr leichgewichtige Tools bzw. Methoden, um Kubernetes schnell zu installieren. Es sind nur ein Kommandozeilen und hier sind einige Methoden:

<div class="image_block"><a href="https://blog.eumelnet.de/blogs/media/blogs/eumel/quick-uploads/joomla-installation-mit-kubernetes-und-helm-1/kubernetes.png?mtime=1568479260">
<br/>

<strong>Vorbedingungen</strong>

Virtuelle Maschine Ubuntu 18.04

<strong>Minikube</strong>
<a href="https://kubernetes.io/de/docs/setup/minikube/">Minikube</a> haben wir in <a href="https://blog.eumelnet.de/blogs/blog8.php/joomla-installation-mit-kubernetes-und-helm-1">diesem Posting</a> schon behandelt.

<strong>K3S</strong>
<a href="https://k3s.io/">K3S</a> von Rancher ist ein Leichtgewicht-Kubernetes, nutzbar auch auf Edge oder Raspberry PI. Die Installationsroutine ist auf der Webseite beschrieben:
<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
curl -sfL https://get.k3s.io | sh -
</code></pre><!-- /codeblock -->

Hinzufügen von Nodes:
<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ curl -sfL https://get.k3s.io | K3S_URL=https://myserver:6443 K3S_TOKEN=XXX sh -
</code></pre><!-- /codeblock -->

Der Token fuer den Node steht auf dem Master in der Datei /var/lib/rancher/k3s/server/node-token
Zugriff mit kubectl

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ snap install kubectl --classic
$ export KUBECONFIG=/var/lib/rancher/k3s/server/cred/admin.kubeconfig
</code></pre><!-- /codeblock -->

<strong>Kubeadm</strong>
<a href="https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/">Kubeadm</a> ist ein Deployment-Tool fuer Kubernetes-Cluster. Auf der Webseite ist die Installation auf Ubuntu beschrieben:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
sudo apt-get update
sudo apt-get install -y apt-transport-https curl
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" > /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
</code></pre><!-- /codeblock -->

Neues Cluster initialisieren:
<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$kubeadm init
</code></pre><!-- /codeblock -->

Anschliessend passendes Netzwerk-Plugin installieren, zum Beispiel flannel:
<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
</code></pre><!-- /codeblock -->

Node Status vom master pruefen:
<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ kubectl get nodes
NAME STATUS ROLES AGE VERSION
quickstart Ready master 8m26s v1.16.3
</code></pre><!-- /codeblock -->

Hinzufügen von Nodes:
<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ kubeadm join 192.168.1.240:6443 --token gtlhtc.csy63766tya0plk8 \
 --discovery-token-ca-cert-hash sha256:2b2c547e4ed85b2cea1ac23c55ecc3eb203a1d915924657dcc2fd5a3d5af8fb9
</code></pre><!-- /codeblock -->

Das Kommando wird am Ende der Installation von kubeadm init ausgegeben</a></div>

<strong>MicroK8S</strong>
<a href="https://ubuntu.com/kubernetes/install#single-node">MicroK8S </a> ist ein Produkt von Canonical. Die Installation laut Webseite erfolgt mit Snap:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ sudo snap install microk8s --classic
</code></pre><!-- /codeblock -->

Auch der kubernetes-client ist in diesem Snap mit enthalten:
<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ microk8s.kubectl get nodes
NAME STATUS ROLES AGE VERSION
quickstart Ready none 2m39s v1.16.3
</code></pre><!-- /codeblock -->

Eine vollstaendige Liste der Loesungen findet man auf https://kubernetes.io/de/docs/setup/
