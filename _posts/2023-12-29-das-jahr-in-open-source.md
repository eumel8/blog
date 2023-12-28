---
layout: post
tag: inet
title: 2023 - Das Jahr in Open Source
subtitle: Der Jahresrückblick zum Mitmachen
date: 2023-12-29
author: eumel8
---

# Einstieg

Auch dieses Jahr gehörte Open Source zur täglichen Interaktion. Dabei bin ich nicht mehr ausschliesslich in selektierten Open Source Projekten unterwegs. Stattdessen kommt es wie es kommt oder wie der Bedarf besteht. Die Erfahrungen in den letzten 12 Monaten sind gemischt. Es gab Höhen und Tiefen, lohnt sich Open Source noch? Schauen wir mal genauer hinein.

# Rancher Projekt Monitoring

Fangen wir gleich mit dem absoluten Tiefpunkt an: [Prometheus-Federator](https://github.com/rancher/prometheus-federator), ein neues Werkzeug, um das Rancher Projekt Monitoring V1 abzulösen, was wiederum notwendig ist, um Rancher auf Version 2.7 zu betreiben. Herzstück ist ein Helm-Chart-Operator, wie er etwa bei Ranchers K3s schon zum Einsatz kommt. Der Nutzer kann eine Resource HelmChartConfig verwalten, mit der dann der Helm-Chart-Operator den Prometheus-Operator ansteuert.

Wir als Anbieter von Managed Kubernetes Services wollten dieses Projekt Monitoring V2 den Nutzern anbieten und installierten es auf Clustern mit 50-80 Projekten. Vorher mussten schon zahlreiche Sicherheitslöcher gestopft werden, mit der die Projekt-Isolierung aufgeweicht worden wäre. Das ist verwunderlich, da Rancher selbst diese Isolierung anbietet. Zahlreiche Support-Tickets und Github-Issues blieben unbearbeitet. Schlussendlich war nur unser eigener Fork lauffähig.

Anfangs sah es ganz gut aus, wenn man mit der Einschränkung leben muss, dass der Nutzer keinen Zugriff auf die Operator-Logs hat und der Status eher mangelhaft zurückgemeldet wurde. Durch den cluster-weit agierenden Operator gab es auch cluster-weite Ausfälle, wenn etwa eine fehlerhafte HelmChartConfig engespielt wurde. Der User erkennt noch nicht mal den Fehler, weil er nach dem apply keine Rückmeldung erhält.

Der absolute Super-Gau begann bei zunehmender Nutzung. In jedem Operator gibt es eine Refresh-Funktion, das sogenannte Reconciling. Der Prometheus-Federator brauchte dazu immer mehr Resourcen, stürzte auch mal ab. Da er zustandslos arbeitet, fängt er wieder von vorne an, hat aber offenbar ein paar Labels vergessen, mit der er seine Eigentümerschaft an der Kubernetes-Resource deklariert.

In einem Szenario löschte er einfach alle Resourcen, die er nicht mehr sein eigen nennt. Als Auswirkung verliert der Nutzer sein komplettes Monitoring. In einem anderen Szenario blieben Resourcen wie RoleBindings übrig, die sich dann nicht mehr vom Operator überschreiben liessen und manuell gelöscht werden mussten. Da dies mehrmals täglich auf verschiedenen Clustern passierte, wurden Cronjobs entwickelt, die das automatisch geradezogen. Das Monitoring des Users wurde trotzdem kurzzeitig gelöscht, um dann automatisch wieder neu installiert zu werden, wenn der Nutzer das nicht zwischenzeitlich macht. Es war zum Verrücktwerden.

Nach 6 Monaten wurde die Reissleine gezogen. Wir entwickelten ein schmales [Helm Chart Bundle](https://github.com/caas-team/caas-project-monitoring), was den Open Source kube-prometheus-stack beinhaltet. Das kann jeder Nutzer mit Projekt-Rechten im Rancher installieren.

Hilfreich war ein anderes Werkzeug [Prometheus-Auth](https://github.com/caas-team/prometheus-auth). Dieser Proxy-Dienst wird vor dem Cluster-Prometheus geschalten, der mittels Bearer-Token und Federation zu erreichen und entsprechende Metriken für dedizierte Namespaces liefert, der über den ServiceAccount-Token authentifiziert wird. In Kubernetes 1.21 änderte sich das Token-Format, weswegen für RKE1-Cluster Prometheus-Auth nicht mehr funktioniert. Mit minimalen Go-Kenntnissen liess sich das beheben. Das Projekt ist bei Rancher mittlerweile deprecated, weswegen wir unseren eigenen Fork weiter verwalten.

# Prometheus Webex Alertmanager

Mit dem neuen Monitoring kamen auch neue Funktionen in den Betrieb wie etwa die AlertmanagerConfig, also eine Konfiguration, wie ich Alarme aus dem Prometheus notifizieren kann. Der Prometheus Operator kannte schon eine Menge Notifizierungsmöglichkeiten: E-Mail, Skype, mit Webhook konnte man sich eine [Webex-Authentifizierung basteln](https://github.com/mcsps/alertmanager-webhook-webex-teams/). Im Prometheus Operator hatte schon jemand die Programmlogik implementiert, es fehlte die API-Umsetzung, um es direkt als AlertmanagerConfig zu nutzen. Da es schon andere Notifizierungsmöglichkeiten gibt, beschränkte es sich auf Kopieren von Codezeilen und Funktionen. Dennoch dauerte es [8 Monate](https://github.com/prometheus-operator/prometheus-operator/pull/5305), bis das neue Release das Feature beinhaltete und genutzt werden konnte. Ein weiter beschwerlicher Weg, dennoch ein grosser Erfolg.

# Cosignwebhook

Auch ein Open Source Projekt, was [Anfang des Jahres startete](https://github.com/eumel8/cosignwebhook/releases/tag/0.0.1).
Laut Sicherheitsvorgaben sollen Container Images signiert und vor der Benutzung die Signatur verifiziert werden. Nach dem Notary V1 Verfahren gab es eine Evolution von Sigstore, die es möglich machte, die Signaturen zusammen mit dem Container-Image in derselben Registry zu speichern. Etliche Werkzeuge bieten die Funktion der Verifizierung an, aber wie üblich scheitert es an der Mandatenfähigkeit. Bei der Evaluierung wurden verschiedene Pull-Requests zur Verbesserung eingebracht, in Issues wurde das Problem der Mandatenfähigkeit auch erkannt, aber es wird wohl noch etliche Zeit dauern, da man sich architektonisch teilweise in die Sackgasse manövriert hat.

Dabei brauchen wir doch bloss einen kleinen Webhook, der auf Erstellen von Pods reagiert und mit mitgeliefertem public Key die verwendeten Container-Images verifiziert. Ein paar Zeilen Code, so begann es Anfang des Jahres. Mittlerweile haben wir mit Version 4 eine Reife entwickelt, die Code-Tests und Ende-zu-Ende-Tests mit abdeckt. Anforderungen von Nutzern werden direkt umgesetzt und Fehler können tagesaktuell gefixt werden.

# Kube-Logging

Apropos tagesaktuell. Ein bemerkenswertes Open-Source-Projekt, was auch wieder mit Rancher zutun hat, ist  [Kube Logging](https://github.com/kube-logging/). Es ist eher bekannt als Banzai-Cloud, hatte verschiedene Besitzer und ist jetzt wieder, oder immer noch, beim ursprünglichen Entwicklerteam unter neuen Namen Axoflow in Ungarn.

Banzaicloud wurde in Rancher auch als Mittel zum Zweck verwendet, um über den Logging-Operator dem Nutzer die Möglichkeit zu eröffnen, Logs seiner Container einsammeln und an seinen Logging-Dienst schicken zu lassen. Wie schon beim Monitoring birgt der Operator-Ansatz die Gefahr, wenn dieser cluster-weit agiert, dass cluster-weit Logging-Dienste in Mitleidenschaft gezogen werden, wenn ein Projekt-Logging fehlerhaft konfiguriert ist oder etwa der Endpunkt ausfällt. "The Noisy Neighbor" haben wir das Phänomen genannt. Mit Axoflow haben wir einen kompetenten Softwarelieferanten gefunden, der ausschliesslich Open Source agiert. Neue Features kommen also allen zu Gute, auf Github Issues wurde innerhalb von Stunden reagiert und Lösungen durch Bugfixes oder neue Releases bereitgestellt. Dabei wurden auch mal neue Resourcen erfunden, die die Mandatenfähigkeit unterstützt, also alles, um die Welt ein bischen besser zu machen. Für mich das Softwareprojekt des Jahres 2023.

# Ast Sort Docs

Btw, beim Lesen der Kube-Logging-Dokumentation hat es mich immer gestört, dass Parameter zu einer Funktion immer durcheinander gelistet werden, so wie sie bei der Programmentwicklung mit der Zeit dazugekommen sind und in die entsprechenden Type-Defintionen im Code einfach angehangen wurden. Ich hatte erst angefangen, diese [Typen im Code zu sortieren](https://github.com/kube-logging/logging-operator/pull/1409), wodurch ich absoluter Top-Contributor geworden wäre, aber das gefiel den Verwaltern nicht. Stattdessen sollte das Problem programmatisch gelöst werden.

Zugegeben, diese [25 Zeilen Code]( https://github.com/cisco-open/operator-tools/pull/188) stammen eigentlich von ChatGPT, etwas Eigententwicklung und Tests sind natürlich mit dabei. Das Ergebnis kann man dann [hier](https://kube-logging.dev/docs/configuration/crds/v1beta1/flow_types/) bestaunen. Alles alphabetisch sortiert.

# Canary-Bot/Sparrow

Ein weiteres Highlight in diesem Jahr war der Wandel im Team zu Open Source. Klar haben wir intern jede Menge Git-Repos, die zur Verwaltung der Cluster-Landschaften dienen. Aber das Software direkt öffentlich auf Github entwickelt wird, war neu.
Da ist zum Einen der [Canary Bot](https://github.com/telekom/canary-bot/), ein Monitoring-Werkzeug, um Latenzen zwischen verschiedenen Clustern oder Umgebungen zu messen. 

Später im Jahr kam dann der [Sparrow](https://github.com/caas-team/sparrow/) dazu, eine etwas abgespecktere Variante mit einem etwas anderen Anwendungsfall. Mein persönlichen Beiträge waren die Helm-Charts zur Installation der Vögel. Interessant zu beobachten war der technische Fortschritt, den man in den Monaten gemacht hat. Es war nicht einfach ein Kopieren von Code, sondern Erfahrungen und neue Funktionen von Helm flossen ein. Perfektioniert wurde das ganze im Team-Review. Dadurch bringen sich auch alle Team-Mitglieder auf denselben Wissensstand, wenn sie etwa eine Funktion nicht verstehen oder eine bessere Lösung dazu beitragen können. Grandios. Und unbezahlbar.

In unserer [Github Organisation](https://github.com/caas-team) gibt es mittlerweile eine Fülle von Repos wie etwa die Use Cases, die die Benutzung unserer Dienste darstellen oder vereinfachen soll.

# No space left on device

Lustige Begebenheiten aus der Welt des Container-Betriebes. Im Juni wurden Nutzer mit der Meldung "no space left on device" beim Starten ihrer Workload im Kubernetes Cluster konfrontiert. Die Meldung war etwas irreführund, da genug Speicherplatz auf den Nodes vorhanden war. Es hat eine Weile gedauert, die Ursache herauszufinden und führte uns in die Welt des Overlay Dateisystems. Die Anzahl der Mounts war auf den Nodes ausgeschöpft (immerhin standardmässig 100.000), was durch eine Management-Software des Cloud-Providers verursacht wurde, die sich fröhlich in den Overlay-Mounts der Container einnistete und dort alle gefundenen Mounts des Rechners nochmal mountete.

Die [Problembeschreibung](https://github.com/moby/moby/issues/45760) brachte die Docker-Verwalter nur ein müdes Lächeln - war in der nächsten Version von Docker längst gefixt. Selbst dran schuld, wenn man so eine alte Version noch laufen hat. Dem eigentlichen Verursacher mit der Managements-Software geht's auch wieder gut. Ehrlich!

# Vcluster

Vcluster stand dieses Jahr auch auf dem Programm und die Technologie ins Portfolio einzubinden. Klappte natürlich auch nicht auf [Anhieb](https://github.com/crossplane-contrib/provider-helm/issues/199). Damit muss man in der Open Source Welt leben: Dass sich niemand für Deine Probleme interessiert. Da gibt es [sowas](https://github.com/rancher/rancher/issues/39778), oder [sowas](https://github.com/minio/minio/pull/18296), oder [sowas](https://github.com/JiangKlijna/web-shell/pull/13). Wie man sieht, sind auch nahmhafte Projekte mit 13.000 Github Stars darunter. Was nützt es aber, wenn man PR kommentarlos schliesst oder monatelang nicht beachtet. Das sind so Zweifel an der Open Source Idee. Entweder ist man in die Kategorie Überflieger aufgestiegen (Github Status: I'm very busy) oder das Projekt ist verwaist, weil die Verwalter nicht mehr da sind. Leute mit Ordnungssinn setzen den Status solcher Projekte wenigstens auf "archiviert" und geben eine Notiz in der Readme ab. Es lohnt sich also immer das Projekt des Interesses etwas abzuchecken: 

- Wann war das letzte Release?
- Gibt es überhaupt ein Release oder Artefakte wie kompilierte Softwareversionen oder fertige Container-Images?
- Wann war der letzte Commit?
- Wieviel offene PRs und Issues gibt es?
- Wie alt sind diese?
- Wieviel Verwalter gibt es und wie aktiv sind diese?

Vielleicht liest man auch, dass Hilfe benötigt wird und man kann dauerhaft etwas zu diesem Projekt beitragen. Ich bin auch dazu übergegangen, das Projekt dauerhaft zu forken und mit meinem Fork weiterzuleben. Ist natürlich nicht die Intention, die Software selbst weiterzupflegen, aber manchmal geht es nicht anders. Wichtig ist, nicht aufzugeben und sich nicht entmutigen zu lassen. Ein Grossteil der Leute ist froh, wenn ihnen geholfen wird oder sie auf Github einen [Kommentar](https://github.com/traefik/traefik/issues/7112#issuecomment-1870903221) zur Lösung finden. Manchmal ist [das Pferd einfach tot](https://github.com/b2evolution/b2evolution/issues/105), da nützt es auch nicht, sich immer wieder in den Sattel zu schwingen. Meine Blogs habe ich von B2evolution auf Github Pages [umgestellt](https://unsupported.eumel.de/2023/07/17/b2evo-unsupported-2.html). 

Dort findet man auch den Artikel über [Vcluster](https://k8sblog.eumel.de/2022/12/14/vcluster-in-rancher-mit-crossplane.html). Die Implementierung in Rancher ist ziemlich cool. Es begann Ende 2022 mit einer Studie, ehe es in diesem Jahr produktiv eingesetzt werden konnte.

# CaaS Carbon Footprint

Noch ein cooles Projekt vorm Jahresende: [CaaS Carbon Footprint](https://github.com/caas-team/caas-carbon-footprint), auch bekannt als GreenOps. 

Das Messen von Stromverbrauch ist bei einer Waschmaschine einfacher als bei einem Kubernetes Cluster. Nach jahrelangen wissenschaftlichen Recherchen ist jetzt der Durchbruch gelungen und mit Kepler gibt es eine Möglichkeit, den Stromverbrauch bis auf den Pod im Kubernetes Cluster in Echtzeit zu bestimmen.

Auf der anderen Seite wird Strom aus verschiedenen Quellen generiert. Gewünscht ist natürlich regenerative Energie, aber das gelingt nicht immer. In Deutschland sind wir zu sehr von Wind und Sonne abhängig. Aber wenn es mal weht, dann sind bis zu 86% an erneuerbarer Energie drin. Und diese sollte man auch nutzen. Ansonsten muss die Energie weggeschmissen werden, denn wir können sie nicht speichern. Caas Carbon Footprint bringt diese beiden Kennzahlen zusammen und motiviert, stromintensive Workload in Zeiten zu verlegen, wenn erneuerbare Energie im Überfluss (>80%) vorhanden ist. Es ist natürlich nicht bei jeder Workload möglich, aber es gibt durchaus Anwendungsfälle. Mit diesem Projekt leisten wir einen aktiven Beitrag zum Klimaschutz. 
Und damit geht es nächstes Jahr weiter.




