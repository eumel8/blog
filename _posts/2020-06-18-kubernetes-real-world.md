---
layout: post
tag: kubernetes
title: Kubernetes Real World
subtitle: "install K3S Shell curl&nbsp;-sfL&nbsp;https://get.k3s.io&nbsp;|&nbsp;sh&nbsp;- extend node port range in create a volume snapshot apiVersion: volumesnapshot.external-storage.k8s.io/v1 kind: VolumeSnapshot metadata: name: snapshot-mysql namespace:&hellip;"
date: 2020-06-18
author: eumel8
---

install K3S

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
curl -sfL https://get.k3s.io | sh -
</code></pre><!-- /codeblock -->

extend node port range in <code>/etc/systemd/system/k3s.service</code>
change

<pre>
ExecStart=/usr/local/bin/k3s server --kube-apiserver-arg service-node-port-range=1-65535
</pre>

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
systemctl daemon-reload
systemctl restart k3s.service
</code></pre><!-- /codeblock -->

: k3s server --kube-apiserver-arg --service-node-port-range=20618-20828

install kubectl + helm

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
snap install kubectl --classic
snap install helm --classic
</code></pre><!-- /codeblock -->

bash completion

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
kubectl completion bash >> .bashrc
helm completion bash >> .bashrc
</code></pre><!-- /codeblock -->

connect to cluster

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
bash
export KUBECONFIG=/var/lib/rancher/k3s/server/cred/admin.kubeconfig
kubectl get nodes
</code></pre><!-- /codeblock -->

install openebs:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
kubectl apply -f https://raw.githubusercontent.com/openebs/openebs/master/k8s/openebs-operator.yaml
</code></pre><!-- /codeblock -->

full set of storageclass https://raw.githubusercontent.com/openebs/openebs/master/k8s/openebs-storageclasses.yaml

apply only standalone class because of one node. otherwise 3 nodes required for replica of 3

<pre>
---
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
 name: openebs-standalone
 annotations:
 cas.openebs.io/config: |
 - name: ReplicaCount
 value: "1"
provisioner: openebs.io/provisioner-iscsi
</pre>

install Minio

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
kubectl apply -f https://raw.githubusercontent.com/minio/minio-operator/master/examples/minioinstance.yaml
</code></pre><!-- /codeblock -->

kubectl patch NodePort

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
kubectl patch service minio-service -p '{"spec":{"type":"NodePort"}}'
</code></pre><!-- /codeblock -->

install Mysql

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
helm repo add stable https://kubernetes-charts.storage.googleapis.com/
helm upgrade -i mysql --set persistence.storageClass=openebs-standalone stable/mysql
</code></pre><!-- /codeblock -->

create a volume snapshot
<pre>
apiVersion: volumesnapshot.external-storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
 name: snapshot-mysql
 namespace: default
spec:
 persistentVolumeClaimName: mysql

</pre>
