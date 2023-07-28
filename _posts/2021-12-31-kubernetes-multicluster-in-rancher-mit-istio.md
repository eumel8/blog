---
layout: post
tag: kubernetes
title: Kubernetes Multicluster in Rancher mit Istio
subtitle: "Meine letzten Worte 2020 waren: Der Kubernetes Cluster ist nicht das Ende der Fahnenstange. Wenn man an Hohverfügbarkeit oder Standortredundanz, brauch man am wenigsten 2 Kubernetes Cluster"
date: 2021-12-31
author: eumel8
---

Meine letzten Worte 2020 waren: Der Kubernetes Cluster ist nicht das Ende der Fahnenstange. Wenn man an Hohverfügbarkeit oder Standortredundanz, brauch man am wenigsten 2 Kubernetes Cluster
<br/>

Es war einmal, da hatten wir ein Problem mit einem Kubernetes Cluster. Es dauerte
einige Tage, das Problem zu lösen und die Benutzer erfuhren eine Diensteeinschränkung
für eine ungewöhnlich lange Zeit. Das war der Startpunkt, um über Cluster-Redundanz und
Service Mesh nachzudenken.

Ein Service Mesh beschreibt eine Funktionalität, um Dienste in verschiedenen Versionen oder
Lokationen zu mischen. Istio ist ein solcher Service Mesh, welchen wir untersuchen möchten,
um folgende Probleme zu lösen:

<ul>
<li>Cluster-Redundanz (jeder Kubernetes Cluster arbeitet unabhängig voneinander und liefert
cloud-native, businesskritische Applikationen)</li>

<li>Standort-Redundanz (verteile nicht ein Cluster auf mehrere Standorte, jeder Standort hat
seinen eigenen Cluster)</li>

 <li>Trafik-Verteilung (liefere eine Version der Applikation zu einem bestimmten Teil der Kunden,
basierend auf eine Region oder dem Test-Team)</li>

</ul>


Hinweis: Es gibt bislang schon technische Lösungen, um diese Probleme mit Kubernetes Werkzeugen
und ohne Service Mesh zu lösen, da man sich eine Menge technische Abhängigkeiten einlädt.

Los gehts!

<strong>Vorbedingungen</strong>

<ul>
<li> 2 Kubernetes Downstream Cluster (1.20.12-rancher1-1) verwaltet von Rancher</li>

<li>Cluster Admin Zugriff auf Rancher</li>

<li>Die Möglichkeit zur Erstellung von Externen Loadbalancern, z.B. OTC ELB mit [OpenStack Cloud Controller Manager](github.com/kubernetes/cloud-provider-openstack)</li>
</ul>



Die Cluster erfüllen voll den [CIS Benchmark Check](https://rancher.com/docs/rancher/v2.6/en/cis-scans/)

<ul>
 <li>`restricted` PodSecurityPolicy ist erzwungen</li>

 <li> ProjectNetworkIsolation ist aktiviert</li>

</ul>



<strong>Mehr Vorbedingungen</strong>
<ul>

 <li>Istio Images sind zur MTR gespiegelt. Verfügbare Versionen auf [https://mtr.external.otc.telekomcloud.com/repository/istio/](https://mtr.external.otc.telekomcloud.com/repository/istio)</li>


 <li>Download kubectl (wenn erforderlich) und kube-config von Rancher</li>


<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
curl -LO https://storage.googleapis.com/kubernetes-release/release/$(curl -s https://storage.googleapis.com/kubernetes-release/release/stable.txt)/bin/linux/amd64/kubectl
</code></pre><!-- /codeblock -->

<li>Download und installieren von istioctl:</li>


<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ curl -L https://istio.io/downloadIstio | sh -
</code></pre><!-- /codeblock -->

</ul>

<strong>Istio Installationsmethoden &amp; Projektziele</strong>

<ul>
 <li>Installation durch Rancher App Katalog (Rancher Helm Chart)</li>

 <li>Installation durch Istio Helm Chart</li>

 <li>Installation durch Istio Operator</li>
</ul>



Wir werden den Istio Operator benutzen, um jeden Schritt der Installation von Istio Version
1.12.0 (ältere Versionen haben Probleme bei der Verbindung von Multi-Clustern)

Projektziel ist die Installation des [Istio Helloworld Beispiels](https://github.com/istio/istio/tree/master/samples/helloworld)
in beiden Clustern und verteilen der Traffic. Das Zielbild sieht so aus:

<img src="/blog/images/2021-12-09-1.svg" width="900" height="450" />

<ul>
<li>Der HelloWorld Service in beiden Clustern</li>

 <li>Exposed Ingress Service</li>

 <li>Eastwest Gateway fuer interconnect Traffic</li>

</ul>


<strong>Cluster Vorbereitungen</strong>

Annahmen:

<pre>
| No | Name | ID | Network | Mesh |
|----|---------------------|------------|-----------------|------------|
| 1 | mcsps-test-k8s-01 | c-f7r9g | mcsps-test-01 | mcsps-test |
| 2 | mcsps-test-k8s-02 | c-pzk8b | mcsps-test-02 | mcsps-test |

</pre>

Erstelle ein Projekt `istio` fuer beide Cluster im Rancher Kontext:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ cat &lt;<eof | kubectl -n c-f7r9g apply -f -
apiVersion: management.cattle.io/v3
kind: Project
metadata:
 name: istio
spec:
 clusterName: c-f7r9g
 containerDefaultResourceLimit:
 limitsCpu: 200m
 limitsMemory: 128Mi
 requestsCpu: 100m
 requestsMemory: 64Mi
 description: Istio Manage Project
 displayName: istio
 enableProjectMonitoring: false
 namespaceDefaultResourceQuota:
 limit:
 limitsCpu: "12000m"
 limitsMemory: "12000Mi"
 resourceQuota:
 limit:
 limitsCpu: "12000m"
 limitsMemory: "12000Mi"
EOF
</code></eof></code></pre><!-- /codeblock -->


Erstelle einen Namespace `istio-system` fuer beide Cluster im Cluster Kontext:

<!-- codeblock lang=shell line=1 --><pre class="codeblock">EOF | kubectl apply -f -
apiVersion: v1
kind: Namespace
metadata:
 annotations:
 field.cattle.io/projectId: c-pzk8b:istio
 field.cattle.io/resourceQuota: '{"limit":{"limitsCpu":"12000m","limitsMemory":"12000Mi"}}'
 lifecycle.cattle.io/create.namespace-auth: "true"
 scheduler.alpha.kubernetes.io/node-selector: role=ingress
 labels:
 field.cattle.io/projectId: istio
 topology.istio.io/network: mcsps-test-01
 name: istio-system
EOF
</pre><!-- /codeblock -->

<ul>
 <li>Es gibt weiter die Annahme, dass wir Worker Nodes fuer Ingress mit Rolle `ingress` haben.
Ansonsten kann man die Annotation loeschen.</li>

 <li>Die richtige cluster-id und network-id muss jederzeit sichergestellt werden.</li>

</ul>


Erstelle LimitRange in `istio-system` Namespace fuer Container Default Quota:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
```bash
$ cat &lt;<eof | kubectl apply -f -
apiVersion: v1
kind: LimitRange
metadata:
 labels:
 resourcequota.management.cattle.io/default-resource-quota: "true"
 name: istio-limitrange
 namespace: istio-system
spec:
 limits:
 - default:
 cpu: 100m
 memory: 100Mi
 defaultRequest:
 cpu: 10m
 memory: 10Mi
 type: Container
EOF
</code></eof></code></pre><!-- /codeblock -->


Erstelle einen Namespace `sample` in beiden Clustern in Cluster Kontext:

<!-- codeblock lang=shell line=1 --><pre class="codeblock">reate namespace sample
$ kubectl label namespace sample istio-injection=enabled --overwrite
</pre><!-- /codeblock -->

<strong>Istio Operator Installation</strong>

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ istioctl operator init --tag 1.12.0 --hub mtr.external.otc.telekomcloud.com/istio
</code></pre><!-- /codeblock -->

Dadurch wird der Istio Operator im Namespace `istio-operator` erstellt

<strong>Multi-Cluster Vorbereitungen</strong>

In der [Istio Documentation](https://istio.io/latest/docs/setup/install/multicluster/before-you-begin/) sind einige Aufgaben erwaehnt wie `Configure Trust`. Dafuer gibt es auch ein [Beispiel](https://github.com/istio/istio/tree/master/samples/certs)

Im sample/certs Verzeichnis:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ make -f ../tools/certs/Makefile.selfsigned.mk root-ca
$ make -f ../tools/certs/Makefile.selfsigned.mk mcsps-test-k8s-01-cacerts
$ make -f ../tools/certs/Makefile.selfsigned.mk mcsps-test-k8s-02-cacerts
</code></pre><!-- /codeblock -->

Auf dem Cluster anwenden (mit Kontext cluster 01):

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ ./mcsps-test-k8s-01.sh
</code></pre><!-- /codeblock -->

Auf dem Cluster anwenden (mit Kontext cluster 02):

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ ./mcsps-test-k8s-02.sh
</code></pre><!-- /codeblock -->

Erstellte Secrets überprüfen

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ kubectl -n istio-system get secrets cacerts
cacerts Opaque 4 57d
</code></pre><!-- /codeblock -->

Erstellen eines Rancher Token mit Skope auf cluster1 und cluster2, erstellen einer kube-config
Datei wie in diesem Beispiel und kodieren mit `base64`

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ cat &lt;<eof | base64 -w0
apiVersion: v1
clusters:
- cluster:
 server: https://raseed-test.external.otc.telekomcloud.com:443/k8s/clusters/c-f7r9g
 name: mcsps-test-k8s-01
contexts:
- context:
 cluster: mcsps-test-k8s-01
 user: mcsps-test-k8s-01
 name: mcsps-test-k8s-01
current-context: mcsps-test-k8s-01
kind: Config
preferences: {}
users:
- name: mcsps-test-k8s-01
 user:
 token: token-hfjvg:tsjn2k5vlvjjzqhwpbpzwfkb549q54pdxrksfn6hw82svbq5vcgrml
EOF
</code></eof></code></pre><!-- /codeblock -->

Erstellen eines Remote Secret mit bas64 mit diesen Credentials und dem Namen des
anderen Clusters,

<!-- codeblock lang=shell line=1 --><pre class="codeblock">EOF | kubectl -n istio-system apply -f -
apiVersion: v1
data:
 mcsps-test-k8s-01: YXBpVmVyc2lvbjogdjEKY2x1c3RlcnM6Ci0gY2x1c3RlcjoKICAgIHNlcnZlcjogaHR0cHM6Ly9yYXNlZWQtdGVzdC5leHRlcm5hbC5vdGMudGVsZWtvbWNsb3VkLmNvbS9rOHMvY2x1c3RlcnMvYy1mN3I5ZwogIG5hbWU6IG1jc3BzLXRlc3QtazhzLTAxCmNvbnRleHRzOgotIGNvbnRleHQ6CiAgICBjbHVzdGVyOiBtY3Nwcy10ZXN0LWs4cy0wMQogICAgdXNlcjogbWNzcHMtdGVzdC1rOHMtMDEKICBuYW1lOiBtY3Nwcy10ZXN0LWs4cy0wMQpjdXJyZW50LWNvbnRleHQ6IG1jc3BzLXRlc3QtazhzLTAxCmtpbmQ6IENvbmZpZwpwcmVmZXJlbmNlczoge30KdXNlcnM6Ci0gbmFtZTogbWNzcHMtdGVzdC1rOHMtMDEKICB1c2VyOgogICAgdG9rZW46IHRva2VuLWhmanZnOnRzam4yazV2bHZqanpxaHdwYnB6d2ZrYjU0OXE1NHBkeHJrc2ZuNmh3ODJzdmJxNXZjZ3JtbAo=
kind: Secret
metadata:
 annotations:
 networking.istio.io/cluster: mcsps-test-k8s-01
 labels:
 istio/multiCluster: "true"
 name: istio-remote-secret-mcsps-test-k8s-01
 namespace: istio-system
type: Opaque
EOF
</pre><!-- /codeblock -->

Überprüfen des Remote Secret in jedem Cluster:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ kubectl -n istio-system get secrets | grep remote-secret
istio-remote-secret-mcsps-test-k8s-01 Opaque 1 57d
</code></pre><!-- /codeblock -->

Hinweis: Es gibt noch einen anderen Weg, um die Remote Secret mit
Zertifikaten zu erstellen, aber es wird hier nur erwähnt:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ istioctl x create-remote-secret \
 --name=mcsps-test-k8s-01 --context=mcsps-test-k8s-01
</code></pre><!-- /codeblock -->

<strong>Installation Istio Controlplane und Istio Ingressgateway</strong>

Jetzt werden wir den Istio Controllplane in jedem Cluster installieren:
<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ cat &lt;<eof | kubectl -n istio-system apply -f -
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
 name: mcsps-test
 namespace: istio-system
spec:
 tag: 1.12.0
 profile: demo
 hub: mtr.external.otc.telekomcloud.com/istio
 values:
 global:
 meshID: mcsps-test
 multiCluster:
 clusterName: mcsps-test-k8s-01
 enabled: true
 network: mcsps-test-01
EOF
</code></eof></code></pre><!-- /codeblock -->

<strong>Eastwestgateway</strong>

Installation Easwestgateway in jedem Cluster:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ cat &lt;<eof | kubectl -n istio-system apply -f -
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
 name: eastwest
spec:
 tag: 1.12.0
 hub: mtr.external.otc.telekomcloud.com/istio
 revision: ""
 profile: empty
 components:
 ingressGateways:
 - name: istio-eastwestgateway
 label:
 istio: eastwestgateway
 app: istio-eastwestgateway
 topology.istio.io/network: mcsps-test-01
 enabled: true
 k8s:
 env:
 - name: ISTIO_META_REQUESTED_NETWORK_VIEW
 value: mcsps-test-01
 service:
 ports:
 - name: status-port
 port: 15021
 targetPort: 15021
 - name: tls
 port: 15443
 targetPort: 15443
 - name: tls-istiod
 port: 15012
 targetPort: 15012
 - name: tls-webhook
 port: 15017
 targetPort: 15017
 values:
 gateways:
 istio-ingressgateway:
 injectionTemplate: gateway
 global:
 network: mcsps-test-01
EOF
</code></eof></code></pre><!-- /codeblock -->

<strong>enste</strong>

Exponieren mTLS Service in jedem Cluster:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ cat &lt;<eof | kubectl -n istio-system apply -f -
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
 name: cross-network-gateway
spec:
 selector:
 istio: eastwestgateway
 servers:
 - port:
 number: 15443
 name: tls
 protocol: TLS
 tls:
 mode: AUTO_PASSTHROUGH
 hosts:
 - "*.local"
EOF
</code></eof></code></pre><!-- /codeblock -->

<strong>Controllplane und Gateways</strong>

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ kubectl -n istio-system get all
NAME READY STATUS RESTARTS AGE
pod/istio-eastwestgateway-75584d6b7d-qpnn2 1/1 Running 0 22h
pod/istio-egressgateway-74844b98b7-k4bp9 1/1 Running 0 22h
pod/istio-ingressgateway-88854fd9d-c2kbm 1/1 Running 0 22h
pod/istiod-55f8ddf47f-hgvps 1/1 Running 0 22h

NAME TYPE CLUSTER-IP EXTERNAL-IP PORT(S)
 AGE
service/istio-eastwestgateway LoadBalancer 10.43.237.208 80.158.38.107 15021:31548/TCP,15443:31645/TCP,15012:31299/TCP,15017:32553/TCP 22h
service/istio-egressgateway ClusterIP 10.43.123.134 <none> 80/TCP,443/TCP
 22h
service/istio-ingressgateway LoadBalancer 10.43.234.25 80.158.47.22 15021:32029/TCP,80:30040/TCP,443:30229/TCP,31400:32720/TCP,15443:30421/TCP 22h
service/istiod ClusterIP 10.43.139.98 <none> 15010/TCP,15012/TCP,443/TCP,15014/TCP
 22h

NAME READY UP-TO-DATE AVAILABLE AGE
deployment.apps/istio-eastwestgateway 1/1 1 1 22h
deployment.apps/istio-egressgateway 1/1 1 1 22h
deployment.apps/istio-ingressgateway 1/1 1 1 22h
deployment.apps/istiod 1/1 1 1 22h

NAME DESIRED CURRENT READY AGE
replicaset.apps/istio-eastwestgateway-75584d6b7d 1 1 1 22h
replicaset.apps/istio-egressgateway-74844b98b7 1 1 1 22h
replicaset.apps/istio-egressgateway-f994cbcf8 0 0 0 22h
replicaset.apps/istio-ingressgateway-88854fd9d 1 1 1 22h
replicaset.apps/istiod-55f8ddf47f 1 1 1 22h

NAME REFERENCE TARGETS MINPODS MAXPODS REPLICAS AGE
horizontalpodautoscaler.autoscaling/istio-eastwestgateway Deployment/istio-eastwestgateway 18%/80% 1 5 1 22h
</none></none></code></pre>
Wenn istiod nicht startet wegen Cluster Zugriffsproblemen muss die CluserRole angepasst werden:

Behoben in Istio 1.12.0

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ kubectl edit clusterrole istiod-istio-system
# verify/add
- apiGroups:
 - extensions.istio.io
 resources:
 - wasmplugins
 verbs:
 - get
 - watch
 - list
</code></pre><!-- /codeblock -->

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ kubectl -n istio-system get istiooperators.install.istio.io
NAME REVISION STATUS AGE
eastwest HEALTHY 22h
mcsps-test HEALTHY 22h
</code></pre><!-- /codeblock -->

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ kubectl -n istio-system get gateways.networking.istio.io
NAME AGE
cross-network-gateway 22h
</code></pre><!-- /codeblock -->

<strong>Installation Helloworld</strong>

Hinweis: Die originalen Beispiele befinden sich im [Istio Github Repo](https://github.com/istio/istio/tree/master/samples/helloworld)

cluster1:

deploy v1

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ kubectl -n sample apply -f https://raw.githubusercontent.com/mcsps/use-cases/master/istio/helloworld.yaml -l version=v1
$ kubectl -n sample apply -f https://raw.githubusercontent.com/mcsps/use-cases/master/istio/helloworld.yaml -l service=helloworld
$ kubectl -n sample apply -f https://raw.githubusercontent.com/mcsps/use-cases/master/istio/helloworld-gateway.yaml
</code></pre><!-- /codeblock -->

cluster2:

deploy v2

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ kubectl -n sample apply -f https://raw.githubusercontent.com/mcsps/use-cases/master/istio/helloworld.yaml -l version=v2
$ kubectl -n sample apply -f https://raw.githubusercontent.com/mcsps/use-cases/master/istio/helloworld.yaml -l service=helloworld
$ kubectl -n sample apply -f https://raw.githubusercontent.com/mcsps/use-cases/master/istio/helloworld-gateway.yaml
</code></pre><!-- /codeblock -->

## Anpassen NetworkPolicy

Istio und Rancher haben schon ein paar NetworkPolicy Regeln installiert:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ kubectl -n sample get networkpolicies.networking.k8s.io
NAME POD-SELECTOR AGE
hn-nodes <none> 32h
np-default <none> 32h

$ kubectl -n istio-system get networkpolicies.networking.k8s.io
NAME POD-SELECTOR AGE
hn-nodes <none> 29h
np-default <none> 29h
np-istio-eastwestgateway app=istio-eastwestgateway,istio=eastwestgateway,topology.istio.io/network=mcsps-test-01 29h
np-istio-ingressgateway app=istio-ingressgateway,istio=ingressgateway 29h
</none></none></none></none></code></pre>dardregeln sind gut für "normale" Kommunikation über Overlay Network oder Ingress im selben Cluster.

Für die Helloworld App haben wir die erlaubte Kommunikation in beiden Clustern zu definieren:

Diese Regel sollte alle Traffic von und zu Namespaces erlauben, bei denen `istio-injection` gesetzt ist:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ cat &lt;<eof | kubectl -n istio-system apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
 name: np-istio
spec:
 egress:
 - to:
 - namespaceSelector:
 matchLabels:
 istio-injection: enabled
 ingress:
 - from:
 - namespaceSelector:
 matchLabels:
 istio-injection: enabled
 podSelector: {}
 policyTypes:
 - Egress
 - Ingress
EOF
</code></eof></code></pre><!-- /codeblock -->

Mit dieser Regel erlauben wir explizit Traffic von und zu Istio Service Ports, Kube-API und Kube-DNS:

<!-- codeblock lang=shell line=1 --><pre class="codeblock">EOF | kubectl -n istio-system apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
 annotations:
 name: np-istio-ports
 namespace: istio-system
spec:
 egress:
 - ports:
 - port: 15010
 protocol: TCP
 - ports:
 - port: 15012
 protocol: TCP
 - ports:
 - port: 15014
 protocol: TCP
 - ports:
 - port: 15017
 protocol: TCP
 - ports:
 - port: 15443
 protocol: TCP
 - ports:
 - port: 6443
 protocol: TCP
 - ports:
 - port: 80
 protocol: TCP
 - ports:
 - port: 53
 protocol: TCP
 - ports:
 - port: 53
 protocol: UDP
 ingress:
 - ports:
 - port: 80
 protocol: TCP
 - ports:
 - port: 15010
 protocol: TCP
 - ports:
 - port: 15012
 protocol: TCP
 - ports:
 - port: 15014
 protocol: TCP
 - ports:
 - port: 15017
 protocol: TCP
 - ports:
 - port: 15443
 protocol: TCP
 podSelector: {}
 policyTypes:
 - Egress
 - Ingress
EOF
</pre><!-- /codeblock -->

Am Ende erlauben wir in unserer App auch Traffic zu Istio Service, Kube-DNS und natürlich dem Service Port, auf dem Helloworld ausgeliefert wird:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ cat &lt;<eof | kubectl -n sample apply -f -
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
 annotations:
 name: np-helloworld
spec:
 egress:
 - ports:
 - port: 5000
 protocol: TCP
 - ports:
 - port: 15012
 protocol: TCP
 - ports:
 - port: 53
 protocol: UDP
 ingress:
 - ports:
 - port: 5000
 protocol: TCP
 - ports:
 - port: 15012
 protocol: TCP
 podSelector:
 matchLabels:
 app: helloworld
 policyTypes:
 - Egress
 - Ingress
EOF
</code></eof></code></pre><!-- /codeblock -->

<strong>stallation (Fehlersuche)</strong>

Überprüfen Eastwest Traffic

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ istioctl -n sample proxy-config endpoint helloworld-v2-5866f57dd6-8hgml| grep helloworld
10.42.6.65:5000 HEALTHY OK outbound|5000|v2|helloworld.sample.svc.cluster.local
10.42.6.65:5000 HEALTHY OK outbound|5000||helloworld.sample.svc.cluster.local
80.158.16.72:15443 HEALTHY OK outbound|5000|v1|helloworld.sample.svc.cluster.local
80.158.16.72:15443 HEALTHY OK outbound|5000||helloworld.sample.svc.cluster.local
</code></pre><!-- /codeblock -->

Bei funktionierendem Eastwest Gateway sollten wir als Endpunkt die Loadbalancer Ip-Adresse des Remote Cluster
auf dem mTLS port 15443 sehen. Ohne Eastwest erscheint die POD-IP jedes Helloworld POD (welche im Remote Cluster nicht erreichbar ist).

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ for i in {1..12}; do curl http://80.158.47.22/hello;sleep 1;done
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
</code></pre><!-- /codeblock -->

Das Istio Project sammelte Informationen in einem [Leitfaden zur Fehlersuche](https://istio.io/latest/docs/ops/common-problems/network-issues/).

## Trafficverteilung

Um etwas Ordnung im Trafficmanagement der Helloworld zu bekommen, entscheiden wir
welche Version auf welchem Endpunkt läuft:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ cat &lt;<eof | kubectl -n sample apply -f -
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
 name: helloworld
spec:
 host: helloworld
 subsets:
 - name: v1
 labels:
 version: v1
 - name: v2
 labels:
 version: v2
</code></eof></code></pre><!-- /codeblock -->

Jetzt können wir sagen, 90% der Traffic wird von einem Service ausgeliefert
und 10% vom anderen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock">EOF | kubectl -n sample apply -f -
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
 name: helloworld
spec:
 gateways:
 - helloworld-gateway
 hosts:
 - '*'
 http:
 - match:
 - uri:
 exact: /hello
 route:
 - destination:
 host: helloworld
 port:
 number: 5000
 subset: v1
 weight: 10
 - destination:
 host: helloworld
 port:
 number: 5000
 subset: v2
 weight: 90
EOF
</pre><!-- /codeblock -->

Nicht zu vergessen ist, dies auf beide Cluster anzuwenden, um beide
Ingress mit derselben Konfiguration zu versorgen. Jetzt sollten wir
mehr v2 Versionen in der Antwortschleife sehen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ for i in {1..12}; do curl http://80.158.47.22/hello;sleep 1;done
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
</code></pre><!-- /codeblock -->

## SSL Frontend mit Let's Encrypt Zertifikation

Um mehr produktionsreif zu sein, wir möchten SSL-Terminierung am Frontend
verwenden, eine selbstverwaltetes Let's Encrypt Zertifikat zusammen mit einem
üblichen Hostnamen.

Um mit dem Hostname Problem zu beginnen, verwenden wir schon External-DNS](https://github.com/kubernetes-sigs/external-dns)
und müssen die Quellenliste erweitern, wo external-dns auf Annotations hört:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
 - args:
 - --log-level=info
 - --log-format=text
 - --domain-filter=mcsps.telekomcloud.com
 - --policy=sync
 - --provider=designate
 - --registry=txt
 - --interval=1m
 - --txt-owner-id=$(K8S_NAME)
 - --txt-prefix=_$(K8S_NAME)_
 - --source=service
 - --source=ingress
 - --source=istio-gateway
</code></pre><!-- /codeblock -->

Weiterhin gibt es beim cert-manager ein Problem mit Istio,
weswegen er nicht im User Namespace arbeiten kann, in dem 
sich die Applikation befindet (`sample`). 

"The Certificate should be created in the same namespace as the istio-ingressgateway"

Ref: [https://istio.io/latest/docs/ops/integrations/certmanager/](https://istio.io/latest/docs/ops/integrations/certmanager/)

Das mag die Entscheidung sein, dass der Cluster Admin verantwortlich ist für
diese Aufgabe und nicht der User ohne Berechtigung im Istio Projekt in Rancher.

Erstellen eines Gateway für SSL Terminierung

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ cat &lt;<eof | kubectl -n istio-system apply -f -
apiVersion: networking.istio.io/v1alpha3
kind: Gateway
metadata:
 annotations:
 external-dns.alpha.kubernetes.io/target: 80.158.47.22
 name: helloworld-ssl-gateway
spec:
 selector:
 istio: ingressgateway
 servers:
 - port:
 number: 443
 name: https
 protocol: HTTPS
 tls:
 mode: SIMPLE
 credentialName: helloistio-mcsps-telekomcloud-com
 hosts:
 - helloistio.mcsps.telekomcloud.com
EOF
</code></eof></code></pre><!-- /codeblock -->


Das DNS Ziel ist die IP-Adresse des IngressGateway
Hinweis: Um mit dem external-dns Webhool zu kommunizieren, benötigen wir eine
NetworkPolicy Egress tcp/80 Regel.

Erstellen des VirtualService für Traffic Routing zur Helloworld App im
sample Namespace:


<!-- codeblock lang=shell line=1 --><pre class="codeblock">EOF | kubectl -n istio-system apply -f -
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
 annotations:
 name: helloworld-ssl
spec:
 gateways:
 - helloworld-ssl-gateway
 hosts:
 - '*'
 http:
 - match:
 - uri:
 exact: /hello
 route:
 - destination:
 host: helloworld.sample.svc.cluster.local
 port:
 number: 5000
 subset: v1
 weight: 90
 - destination:
 host: helloworld.sample.svc.cluster.local
 port:
 number: 5000
 subset: v2
 weight: 10
EOF
</pre><!-- /codeblock -->

Erstellen eines Zertifikats für Helloworld:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ cat &lt;<eof | kubectl -n istio-system apply -f -
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
 name: helloistio
spec:
 issuerRef:
 group: cert-manager.io
 kind: ClusterIssuer
 name: letsencrypt-wild
 secretName: helloistio-mcsps-telekomcloud-com
 commonName: helloistio.mcsps.telekomcloud.com
 dnsNames:
 - helloistio.mcsps.telekomcloud.com
EOF
</code></eof></code></pre><!-- /codeblock -->

Da ist die Annahme, wir haben einen ClusterIssuer `letsencrypt-wild` mit
dns01-challenge und eine Designate-verwaltete Domain, da wir external-dns benutzen.

<!-- codeblock lang=shell line=1 --><pre class="codeblock"> cert-manager.io/v1
kind: ClusterIssuer
metadata:
 name: letsencrypt-wild
spec:
 acme:
 email: cloud-operations@telekom.de
 preferredChain: ""
 privateKeySecretRef:
 name: letsencrypt-wild
 server: https://acme-v02.api.letsencrypt.org/directory
 solvers:
 - dns01:
 webhook:
 groupName: acme.syseleven.de
 solverName: designatedns
</pre><!-- /codeblock -->

Let`s Encrypt http-01 Challenge wird nicht aus dem Hut mit Istio funktionieren,
da die Challenge eine temporaere Ingress Defintion erwartet.

Man wird sowas wie dies hier auf dem IngressGateway sehen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>[2021-12-11T17:40:54.432Z] "GET /.well-known/acme-challenge/Q14PwTatb9y3RPS3o4jss2NQL5lioZTnevB4kI7lns44 HTTP/1.1" 404 NR route_not_found - "-" 0 0 0 - "10.42.7.0" "cert-manager/v1.5.3 (clean)" "4828cac7-ae2d-91e7-9699-a6c2e9a82321" "helloistio.mcsps.telekomcloud.com" "-" - - 10.42.6.79:8080 10.42.7.0:13840 - -</code></pre><!-- /codeblock -->


Überprüfen ob das Zertifikat ausgestellt wurde:


<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>$ kubectl -n istio-system get certificate
NAME READY SECRET AGE
helloistio True helloistio-mcsps-telekomcloud-com 56m
</code></pre><!-- /codeblock -->

Verbindung überprüfen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ for i in {1..12}; do curl https://helloistio.mcsps.telekomcloud.com/hello;sleep 1;done
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
Hello version: v2, instance: helloworld-v2-5866f57dd6-8hgml
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
Hello version: v1, instance: helloworld-v1-c6c4969d7-lfgw7
</code></pre><!-- /codeblock -->


Dieselbe Aufgabe ist auf dem zweiten Cluster erforderlich, 
um wirklich autonom zu sein. Unerfreulicherweise wir können keine
[mehrfache A Records von verschiedenen Instanzen in external-dns](https://github.com/kubernetes-sigs/external-dns/issues/1441) setzen.
So müssen wir diese Automatisierungsschritt überspringen und können
2 A-Records manuell setzen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ host helloistio.mcsps.telekomcloud.com
helloistio.mcsps.telekomcloud.com has address 80.158.54.11
helloistio.mcsps.telekomcloud.com has address 80.158.59.119
</code></pre><!-- /codeblock -->

Der Schleifentest oben sollte an beiden Endpunkten funktionieren und
sollte entsprechend der Namensauflösung folgen.

Mehr Beispiele gibt es im Istio Github Repo oder Istio Dokumentation.

Viel Spass mit Istio!
