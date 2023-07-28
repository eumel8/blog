---
layout: post
tag: inet
title: Go: Container bauen ohne Docker
subtitle: "Das Erstellen eines Container-Images für Kubernetes kann schon mal recht aufwendig sein. Man brauch ein Base-Image, ein Dockerfile und eine Docker-Runtime, die man entweder nicht installieren will oder darf. Google bietet da jetzt eine Loesung. Und die&hellip;"
date: 2022-08-09
author: eumel8
---

Das Erstellen eines Container-Images für Kubernetes kann schon mal recht aufwendig sein. Man brauch ein Base-Image, ein Dockerfile und eine Docker-Runtime, die man entweder nicht installieren will oder darf. Google bietet da jetzt eine Loesung. Und die heisst: Ko.
<br/>
<a href="https://github.com/google/ko">Google Ko</a> ist ein Go-Programm, um andere Go-Programme in Container zu kopieren und diese in eine Container-Registry hochzuladen - ganz ohne Docker und Dockerfile. Defaultmaessig wird ein distroless Image als Base-Image genommen, die Applikation reinkopiert und das Konstrukt in eine Registry hochgeladen - Layer fuer Layer. Dort existiert es dann als ganz normales Docker-Image und kann entsprechend deployt werden.

Installation:

In der Readme werden ein paar Moeglichkeiten vorgeschlagen. Es gibt allerdings auch gleich ein <a href="https://github.com/google/ko/issues/553">Issue</a> bei MacOS mit sed, was gegen GnuSed ausgetauscht werden muss. Statt mit brew kann man letztlich ko auch mit go build vom Source-Code kompilieren.

Anwendung:

Unter ~/.docker/config.json sollte sich ein Credentials-File fuer eine Registry befinden. Mit 

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
export KO_DOCKER_REPO=mtr.devops.telekom.de/eumel8/test
</code></pre><!-- /codeblock -->

gebe ich das Ziel-Repo an. 

Wenn ich dann im Sourc-Repo meiner Go-App bin, starte ich einfach das Kommando:

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
ko build --sbom none -t kotest --bare
</code></pre><!-- /codeblock -->

Das Image wird erstellt und hochgeladen:

<code>
2022/08/09 18:01:57 Using base ghcr.io/distroless/static:latest@sha256:890fd51afa7d75d16b101efa0d57038ee9ade73cd257f39c0ac555eaba4514db for ecs.go
2022/08/09 18:01:58 Building ecs.go for linux/amd64
2022/08/09 18:01:59 Publishing mtr.devops.telekom.de/eumel8/test:kotest
2022/08/09 18:02:00 existing blob: sha256:250c06f7c38e52dc77e5c7586c3e40280dc7ff9bb9007c396e06d96736cf8542
2022/08/09 18:02:00 existing blob: sha256:beb12c8d7c978bd0c40e848064157ee914247fef28fe1fd7f63d60ea1236920c
2022/08/09 18:02:00 existing blob: sha256:b8b01479b63d4c85f74cbe5abf67ab07949ca4bdd338394a1105cddabf0da201
2022/08/09 18:02:00 existing blob: sha256:040aa900d75a7450e43085114141686a937cee16ddd34ab26bead9326e81a5d8
2022/08/09 18:02:00 mtr.devops.telekom.de/eumel8/test:kotest: digest: sha256:6b27463d84fc6a641961077d9df64ba4efee91eee388795e945f90d7c5fce39d size: 1031
2022/08/09 18:02:00 Published mtr.devops.telekom.de/eumel8/test:kotest@sha256:6b27463d84fc6a641961077d9df64ba4efee91eee388795e945f90d7c5fce39d
mtr.devops.telekom.de/eumel8/test:kotest@sha256:6b27463d84fc6a641961077d9df64ba4efee91eee388795e945f90d7c5fce39d
</code>

That's it!

<img src="/blog/media/quick-uploads/go-container-bauen-ohne-docker/screenshot_2022-08-09_at_18.09.14.png" width="585" height="386"/>
