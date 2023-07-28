---
layout: post
tag: kubernetes
title: Go Testing in Kubernetes API und Gophercloud
subtitle: "Ein Go Programm zu schreiben, ist auf dem Hello-World-Level genauso einfach wie in anderen Programmiersprachen. Wie sieht es mit Code Testing aus? Go hält auch hier ein Bordmittel bereit, um Code zu formatieren und zu testen. Lesen wir an zwei&hellip;"
date: 2022-03-29
author: eumel8
---

Ein Go Programm zu schreiben, ist auf dem Hello-World-Level genauso einfach wie in anderen Programmiersprachen. Wie sieht es mit Code Testing aus? Go hält auch hier ein Bordmittel bereit, um Code zu formatieren und zu testen. Lesen wir an zwei Beispielen wie dies zu bewerkstelligen ist.
<br/>
Go Format</strong>
Mit <code>go fmt</code> bekommt man seinen Quellcode schonmal automatisch formatiert. Also die Zeilenabstaende sind richtig eingerueckt,ueberfluessige Leerzeichen werden entfernt usw. Also schon mal nicht schlecht
<strong>Go Lint</strong>
Go Linter sind extra Programme, die kein Bestandteil von Go sind. Sie werden etwa installiert mit

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v1.45.2
</code></pre><!-- /codeblock -->

<a href="https://github.com/golangci/golangci-lint">Dieses Programm</a> enthaelt mehrere Linter mit unterschiedlichen Aufgaben. Die Ausgabe bei unserem overlaytest sieht etwa so aus:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ golangci-lint run
overlay.go:125:5: S1002: should omit comparison to bool constant, can be simplified to `!*reuse` (gosimple)
 if *reuse != true {
 ^
overlay.go:78:2: printf: `fmt.Println` arg list ends with redundant newline (govet)
 fmt.Println("Welcome to the overlaytest.\n\n")
 ^
overlay.go:147:5: printf: fmt.Println call has possible formatting directive %v (govet)
 fmt.Println("Error getting daemonset: %v", err)
 ^
overlay.go:182:2: printf: `fmt.Println` arg list ends with redundant newline (govet)
 fmt.Println("all pods have network\n")
 ^
overlay.go:185:2: printf: `fmt.Println` arg list ends with redundant newline (govet)
 fmt.Println("=> Start network overlay test\n")
 ^
overlay.go:207:5: printf: fmt.Println call has possible formatting directive %v (govet)
 fmt.Println("error while creating Executor: %v", err)
 ^
overlay.go:187:2: SA4006: this value of `err` is never used (staticcheck)
 pods, err = clientset.CoreV1().Pods(namespace).List(context.TODO(), meta.ListOptions{LabelSelector: "app=overlaytest"})
 ^
</code></pre><!-- /codeblock -->

Da wird also schon etwas genauer hingesehen, ob Variablen Sinn machen oder ueberhaupt nach der Defintion verwendet werden. Sehr hilfreich.

<strong>Go Testing</strong>
Was wir aber jetzt genau wissen wollen: Funktioniert denn jetzt mein Programm? Oder meine Funktion? Oder der Funktionsaufruf? Dazu gibt es Unittests und das <a href="https://pkg.go.dev/testing">Go Paket Testing</a>. Im Paket gibt es auch Beispiele

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
func TestAbs(t *testing.T) {
 got := Abs(-1)
 if got != 1 {
 t.Errorf("Abs(-1) = %d; want 1", got)
 }
}
</code></pre><!-- /codeblock -->

Es wird also die Ausgabe einer Funktion mit einem zu erwartenden Wert verglichen und wenn der okay ist, wurde der Test bestanden. Die Anzahl der mit diesem Test abgedeckten Code-Zeilen heisst Coverage und praesentiert somit eine Art Qualitaetssiegel fuer das Programm

<strong>Kubernetes API Test</strong>
Das Kernstueck unserers overlaytest Programms ist ein DaemonSet, was im zu testenden Kubernetes-Cluster deployt wird. Im Kubernetes Projekt gibt es den Fake Client. Dieser kann saemtliche API-Endpunkte und Resourcen nachbilden und antwortet mit entsprechenden Rueckgabewerten, ohne dass man einen Kubernetescluster oder andere Resourcen brauch. Wir koennen zum Beispel einen Pod erstellen und anschliessend abfragen, ob er existieren wuerde:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
package pod

import (
 "context"
 "testing"

 core "k8s.io/api/core/v1"
 meta "k8s.io/apimachinery/pkg/apis/meta/v1"
 "k8s.io/client-go/kubernetes/fake"
)

func TestPod(t *testing.T) {
 client := fake.NewSimpleClientset()
 p := &amp;core.Pod{ObjectMeta: meta.ObjectMeta{Name: "my-pod"}}
 result, err := client.CoreV1().Pods("test-ns").Create(context.TODO(), p, meta.CreateOptions{})
 if err != nil {
 t.Fatalf("error injecting pod add: %v", err)
 }

 t.Logf("Got pod from manifest: %v", p.ObjectMeta.Name)
 t.Logf("Got pod from result: %v", result.ObjectMeta.Name)
}
</code></pre><!-- /codeblock -->

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ go test pod_test.go -v
=== RUN TestPod
 pod_test.go:20: Got pod from manifest: my-pod
 pod_test.go:21: Got pod from result: my-pod
--- PASS: TestPod (0.00s)
PASS
ok command-line-arguments 0.034s
</code></pre><!-- /codeblock -->

Ziemlich einfach, oder? Unser DaemonSet koennen wir auch testen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
package daemonset

import (
 "context"
 "testing"

 apps "k8s.io/api/apps/v1"
 core "k8s.io/api/core/v1"
 meta "k8s.io/apimachinery/pkg/apis/meta/v1"
 "k8s.io/client-go/kubernetes/fake"
)

func TestDaemonset(t *testing.T) {

 var (
 app = string("overlaytest")
 image = string("mtr.external.otc.telekomcloud.com/mcsps/swiss-army-knife:latest")
 graceperiod = int64(1)
 user = int64(1000)
 privledged = bool(true)
 readonly = bool(true)
 )

 client := fake.NewSimpleClientset()

 daemonset := &amp;apps.DaemonSet{
 ObjectMeta: meta.ObjectMeta{
 Name: app,
 },
 Spec: apps.DaemonSetSpec{
 Selector: &amp;meta.LabelSelector{
 MatchLabels: map[string]string{
 "app": app,
 },
 },
 Template: core.PodTemplateSpec{
 ObjectMeta: meta.ObjectMeta{
 Labels: map[string]string{
 "app": app,
 },
 },
 Spec: core.PodSpec{
 Containers: []core.Container{
 {
 Args: []string{"tail -f /dev/null"},
 Command: []string{"sh", "-c"},
 Name: app,
 Image: image,
 ImagePullPolicy: "IfNotPresent",
 SecurityContext: &amp;core.SecurityContext{
 AllowPrivilegeEscalation: &amp;privledged,
 Privileged: &amp;privledged,
 ReadOnlyRootFilesystem: &amp;readonly,
 RunAsGroup: &amp;user,
 RunAsUser: &amp;user,
 },
 },
 },
 TerminationGracePeriodSeconds: &amp;graceperiod,
 Tolerations: []core.Toleration{{
 Operator: "Exists",
 }},
 SecurityContext: &amp;core.PodSecurityContext{
 FSGroup: &amp;user,
 },
 },
 },
 },
 }

 result, err := client.AppsV1().DaemonSets("kube-system").Create(context.TODO(), daemonset, meta.CreateOptions{})
 if err != nil {
 t.Fatalf("error injecting pod add: %v", err)
 }

 if daemonset.ObjectMeta.Name != result.ObjectMeta.Name {
 t.Logf("Got from manifest: %v", daemonset.ObjectMeta.Name)
 t.Logf("Got from result: %v", result.ObjectMeta.Name)
 t.Fatalf("result and manifest are not the same")
 }
}
</code></pre><!-- /codeblock -->

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ go test daemon_test.go -v
=== RUN TestDaemonset
--- PASS: TestDaemonset (0.00s)
PASS
ok command-line-arguments 0.020s
</code></pre><!-- /codeblock -->

<strong>Gophercloud Testing</strong>
<a href="https://github.com/gophercloud/gophercloud"> Gophercloud</a> ist ein Go Framework zur Verbindungsaufnahme zu einer OpenStack API. Die Testsuite in diesem Framework bildet nun diese API durch initiieren eigener HTTP-Server nach und hinterlegt die zu erwartenden Antworten.

Schauen wir uns dazu diesen <a href="https://github.com/opentelekomcloud/gophertelekomcloud/commit/45e5435f15218efa296e1a041d1a8536e0b09170#diff-fcfb7ce237e0c8ddf07ef5998d86096e40dfd8159df60fc86988a28bb8cd0b27">Commit</a> an. Es geht um den Restore eines Backups einer MySQL Datenbank in der OpenTelekomCloud. Die OpenTelekomCloud basiert auf OpenStack und unterhaelt dazu den eigenen Fork des Gophercloud SDK. 
Zurueck zum Beispiel

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
func TestRestoreRequestPITR(t *testing.T) {
tth.SetupHTTP()
tt.Cleanup(func() {
ttth.TeardownHTTP()
t})
tth.Mux.HandleFunc("/instances/recovery", func(w http.ResponseWriter, r *http.Request) {
ttth.TestMethod(t, r, "POST")
ttth.TestHeader(t, r, "X-Auth-Token", client.TokenID)

ttw.WriteHeader(http.StatusAccepted)
tt_, _ = fmt.Fprint(w, expectedPITRResponse)
t})

topts := exampleRestorePITROpts()
tbackup, err := backups.RestorePITR(client.ServiceClient(), opts).Extract()
tth.AssertNoErr(t, err)
ttools.PrintResource(t, backup)
}
</code></pre><!-- /codeblock -->

Diese Funktion testet die PointInTimeRecovery Funktion (PITR).Vom Testhelper (th) wird der Webserver gestartet. Auf die URI /instances/recovery wird exampleRestorePITROpts geposted. Diese enthaelt die Instanz-ID und Restore-Zeitpunkt, was durch diese Funktion zurueckgegeben wird:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
func exampleRestorePITROpts() backups.RestorePITROpts {
treturn backups.RestorePITROpts{
ttSource: backups.Source{
tttInstanceID: "d8e6ca5a624745bcb546a227aa3ae1cfin01",
tttRestoreTime: 1532001446987,
tttType: "timestamp",
tt},
ttTarget: backups.Target{
tttInstanceID: "d8e6ca5a624745bcb546a227aa3ae1cfin01",
tt},
t}

}
</code></pre><!-- /codeblock -->

Die Antwort steht in dieser const und beinhaltet einfach eine JobID:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
const expectedPITRResponse = `
{
 "job_id": "4c56c0dc-d867-400f-bf3e-d025e4fee686"
}
`
</code></pre><!-- /codeblock -->

Sind Anfragen und dazugehoerige Antworten gleich, ist der Test bestanden und die darin enthaltene Funktion <code>backups.RestorePITR</code> ausreichend getestet.

<strong>Mocking</strong>
Das Nachahmen solcher API-Funktionalitaeten nennt man auch Mocking, das Verteilen verschiedener Anfragen Muxing. Eine Funktion die beides kann, waere also ein MockMuxer von <a href="https://github.com/eumel8/otc-rds-client/blob/master/rds_test.go">rds_test.go</a>:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
func MockMuxer() {
tmux := http.NewServeMux()

tmux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
ttswitch r.Method {
ttcase "GET":
tttw.Header().Add("Content-Type", "application/json")
tttw.WriteHeader(http.StatusOK)
ttt_, _ = fmt.Fprint(w, ProviderGetResponse)
ttcase "POST":
tttw.Header().Add("X-Subject-Token", "dG9rZW46IDEyMzQK")
tttw.Header().Add("Content-Type", "application/json")
tttw.WriteHeader(http.StatusCreated)
ttt_, _ = fmt.Fprint(w, ProviderPostResponse)
tt}
t})

// ...
tmux.HandleFunc("/jobs", func(w http.ResponseWriter, r *http.Request) {
ttswitch r.Method {
ttcase "GET":
tttw.Header().Add("Content-Type", "application/json")
tttw.WriteHeader(http.StatusOK)

ttt_, _ = fmt.Fprint(w, RdsJobResponse)
tt}
t})

tfmt.Println("Listening...")

tvar retries int = 3

tfor retries > 0 {
tterr := http.ListenAndServe("127.0.0.1:50000", mux)
ttif err != nil {
tttfmt.Println("Restart http server ... ", err)
tttretries -= 1
tt} else {
tttbreak
tt}
t}

}
</code></pre><!-- /codeblock -->

DIe Antworten zu den verschiedenen GET und POST Anfragen befinden sich wieder in const, hier etwa die Antwort auf eine ProviderGet Anfrage:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
const ProviderGetResponse = `
{
t"version": {
tt"media-types": [{
ttt"type": "application/vnd.openstack.identity-v3+json",
ttt"base": "application/json"
tt}],
tt"links": [{
ttt"rel": "self",
ttt"href": "http://127.0.0.1:50000/v3/"
tt}],
tt"id": "v3.6",
tt"updated": "2016-04-04T00:00:00Z",
tt"status": "stable"
t}
}
`
</code></pre><!-- /codeblock -->

Diese liefert also die Adresse unserer Pseudo OpenStack API zurueck.

Testen kann man die Authentifizierung unseres OpenStack clients so:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
func Test_getProvider(t *testing.T) {
tgo MockMuxer()

terr := os.Setenv("OS_USERNAME", "test")
tth.AssertNoErr(t, err)
terr = os.Setenv("OS_USER_DOMAIN_NAME", "test")
tth.AssertNoErr(t, err)
terr = os.Setenv("OS_PASSWORD", "test")
tth.AssertNoErr(t, err)
terr = os.Setenv("OS_IDENTITY_API_VERSION", "3")
tth.AssertNoErr(t, err)
terr = os.Setenv("OS_AUTH_URL", "http://127.0.0.1:50000/v3")
tth.AssertNoErr(t, err)

tprovider := getProvider()
tdefer getProvider()

tp := &amp;golangsdk.ProviderClient{
ttUserID: "91dca41cc55e4614aaca83b78af8ddc5",
t}
tth.CheckDeepEquals(t, p.UserID, provider.UserID)
tfmt.Println("IdentityEndpoint: ", provider.IdentityEndpoint)
treturn
}
</code></pre><!-- /codeblock -->

Wie man sieht, koennen solche Tests sehr langwierig werden im Code. Deswegen ist es wichtig zu erkennen, welche Tests das Framework schon bereitstellt. Oder selber ein Testframework zu erstellen, um dieses auch wiederverwenden zu koennen. Und alles nur, um den Code pseudomatisch zu ueberpruefen. 
Der naechste Schritt waeren <a href="https://github.com/opentelekomcloud/gophertelekomcloud/blob/devel/acceptance/README.md">Acceptance Tests</a>. Ab hier werden Code oder Funktionen am "lebenenden" Objekt getestet, es bedarf also einer echten OpenStack, bzw. OpenTelekomCloud API, um etwa ECS zu erstellen oder wie oben, ein Backup einer RDS Instanz wiederherzustellen. 

Fazit: Go Testing stellt einen deutlichen Qualitaetssprung in der Softwareprogrammierung dar. Nicht nur, dass man Code besser versteht, man kann ihn auch im Trockendock oder auf hoher See ausprobieren und sehen was er verspricht. Ein tiefgreifendes Verstaendnis kommt hinzu, genau wie Transparenz.

Viel Spass beim Testen
