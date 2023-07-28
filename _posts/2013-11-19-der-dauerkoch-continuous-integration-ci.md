---
layout: post
tag: general
title: Der Dauerkoch - Continuous Integration (CI) mit Gitlab und Gitlab_CI
subtitle: "Die einen lieben es, die anderen hassen es - die taegliche Arbeit mit Git."
date: 2013-11-19
author: eumel8
---

<p>Die einen lieben es, die anderen hassen es - die taegliche Arbeit mit Git. <a href="http://de.wikipedia.org/wiki/Git">Wikipedia</a> uebersetzt Git demnach auch passend mit: Bloedmann. Ansonsten erklaert es noch, dass Git eine freie Software zur Versionsverwaltung von Dateien ist und weitestgehend seine Vorgaenger cvs und rcs abgeloest hat.</p>
<p>[teaserbreak]</p>
<p>Von der urspruenglichen Arbeitsweise hat sich bei Git nichts geaendert. Ich habe ein Projekt in einem Repository mit einer beliebigen Anzahl von Dateien, checke diese auf meinem Rechner aus, veraendere sie und checke sie wieder ein. Branch und Merge erweitern Funktionalitaeten von verschiedenen Versionsstraengen, aendert aber nichts dadran, dass die Dateien alle im Repository sind. Git von der Kommandozeile ist in der <a href="http://git-scm.com/doc">Online-Doku</a> beschrieben.</p>
<p> </p>
<p>Einen Gitlab-Server aufzusetzen, um unsere Git-Repositories zu verwalten, ist gar nicht so kompliziert. Aber auch nicht zu einfach, da es keine fertigen RPMs gibt. Es gibt eine Variante mit Shell-Skript fuer OpenSUSE ( https://gist.github.com/jniltinho/5565606 ), die aber ein paar Fehler enthaelt und auf eine Version von Gitlab festgenagelt ist. Die Original-Installationsanleitung liegt dem jeweiligen Programmcode als Markdown mit bei ( https://github.com/gitlabhq/gitlabhq/blob/master/doc/install/installation.md ). Es ist eine Fitzelarbeit, aber dadurch, dass explizit auf bestimmte Version von Ruby oder Ruby-Gems geachtet wird, fuehrt die Installation dann zum Erfolg. Eine weitaus bequemere Variante ist die Installation als Appliance bzw. fertiges virtuelles Image von http://bitnami.com/stack/gitlab. Dort ist dann auch der Gitlab-CI-Server dabei. Dessen Installation wird genauso ins Detail beschrieben wie der Gitlab-Server: https://github.com/gitlabhq/gitlab-ci/blob/master/doc/installation.md Gitlab CI verarbeitet den Code aus den Repositories nach jedem Commit in beliebiger Art weiter. </p>
<p> </p>
Auf der Startseite unseres Git-Projekts im Gitlab finden wir rechts den Reiter "Settings":
<br />
<div class="image_block"><a href="/images/gitlab1.jpg?mtime=1385415903"><img src="/images/gitlab1.jpg?mtime=1385415903" alt="" width="683" height="290" /></a></div>
<br />
In den Settings gibt es einen weiteren Unterpunkt "Services". Dort kommt dann ein Token und die Service-URL vom Gitlab CI. Entweder hat man es auf einem anderen Hostnamen desselben Rechners konfiguriert oder einem anderen Port:
<br />
<div class="image_block"><a href="/images/gitlab2.jpg?mtime=1385415916"><img src="/images/gitlab2.jpg?mtime=1385415916" alt="" width="677" height="298" /></a></div>
<br />
Im Webfrontend des Gitlab CI muessen wir erstmal einen Runner konfiguriert. Das ist auch nicht sonderlich schwer. Im Prinzip geht es auch wieder bloss drum, Security-Token auszutauschen (genau wie bei der Verbindung von Gitlab und Gitlab CI)
<br />
<div class="image_block"><a href="/images/gitlab3.jpg?mtime=1385415930"><img src="/images/gitlab3.jpg?mtime=1385415930" alt="" width="675" height="273" /></a></div>
<br />
Wenn man die Projekt-URL vom Gitlab ins Gitlab CI eingetragen hat, hat man auch ein entsprechendes Projekt-Menu im Gitlab CI:
<br /> 
<div class="image_block"><a href="/images/gitlab4.jpg?mtime=1385415943"><img src="/images/gitlab4.jpg?mtime=1385415943" alt="" width="669" height="273" /></a></div>
<br />
Unter "Settings" kommen wir zum Kernpunkt der Anwendung. Was soll mit dem Code gemacht werden, wenn er im Gitlab erfolgreich eingecheckt wurde? Unter "Scripts" lauert das Detail:
<br />
<div class="image_block"><a href="/images/gitlab5.jpg?mtime=1385415956"><img src="/images/gitlab5.jpg?mtime=1385415956" alt="" width="668" height="276" /></a></div>
<br />

Variante 1: Manifeste und Templates werden auf korrekte Syntax gecheckt (mit einige weiche Ausnahmen). Wenn alles okay ist, wird ein tar-Archiv aus dem Code erstellt und auf einem Webserver als Download zur Verfuegung gestellt:
<br />
<!-- codeblock lang="" line="1" --><pre><code>
git submodule update --remote
for file in $(find . -iname '*.pp'); do puppet parser validate --render-as s --modulepath=modules "$file" || exit 1; done
for file in $(find . -iname '*.erb'); do erb -P -x -T '-' $file | ruby -c || exit 1; done
 puppet-lint --no-80chars-check --no-nested_classes_or_defines-check --no-autoloader_layout-check --no-double_quoted_strings-check --no-variables_not_enclosed-check --no-documentation|| exit 1
date '+%F-%I-%M-%S' &gt; puppet/BUILDSTATUS
tar cfz "/usr/share/nginx/www/gnuu_"$CI_BUILD_REF_NAME"_"`date '+%F-%I-%M-%S'`.tgz puppet/ --exclude=.git
</code></pre><!-- /codeblock -->
<br />

Variante 2: Dieses Projekt enthaelt den Code fuer eine komplette Webanwendung in PHP. Wenn am Code etwas geaendert wurde und das im Git eingecheckt ist, werden die Aenderungen wiederum im Open Build Service (OBS) eingecheckt, der wiederum die neue Version eines RPM und DEB Paketes draus baut. Die Darstellung ist eher funktionell. Normalerweise wuerde man die Versionsnummern des Paketes noch verknuepfen, aber das macht OBS mit Built Numbers teilweise selber:


<!-- codeblock lang="" line="1" --><pre><code>#! /bin/bash

# . /home/gitlab_ci_runner/.bashrc

cd /home/gitlab_ci_runner/gitlab-ci-runner/tmp/builds/project-3

if [ ! -f osc ]
then
 mkdir osc
fi
cd osc
osc -A https://obs2.eurazor.local:444 co home:eumel/bmpcloud
cd home:eumel/bmpcloud
if [ ! -f bmpcloud-1.0.0 ]
then
 mkdir bmpcloud-1.0.0
fi
rm -rf bmpcloud-1.0.0/cloud 
mv ../../../cloud bmpcloud-1.0.0
tar cfz bmpcloud-1.0.0.tar.gz bmpcloud-1.0.0
rm -rf bmpcloud-1.0.0
osc -A https://obs2.eurazor.local:444 ci -m "gitlab_ci build" --skip-validation

echo "finished"
</code></pre><!-- /codeblock -->
<br />
OBS baut mit KIWI auch eigene Images, die entweder sofort boot- und/oder installfaehig sind. In seiner Cloudumgebung kann man sofort ein neues Image starten, sobald eine neuere Version zur Verfuegung steht.
<br />
OBS stellt die kompilierten Pakete in einem eigenen Verzeichnis zum Download bereit. Wenn man 
sein System mit Autoupdate faehrt oder die Verwendung des neuesten Programmpaketes mit Puppet konfiguriert hat, schliesst sich der Kreis von der Erstellung des Programmcodes, dessen protokollierte transaktionssichere Verwaltung bis zur endgueltigen Verwendung auf dem Zielsystem.

<br />
