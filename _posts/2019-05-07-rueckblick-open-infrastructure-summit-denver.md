---
layout: post
tag: openstack
title: Rueckblick Open Infrastructure Summit Denver 2019
subtitle: "Der erste Open Infra Structure Summit Denver Frühjahr 2019 ist gerade zu Ende gegangen nach dem letzten OpenStack Summit Berlin 2018, das Original quasi."
date: 2019-05-07
author: eumel8
---

Der erste Open Infra Structure Summit Denver Frühjahr 2019 ist gerade zu Ende gegangen nach dem letzten OpenStack Summit Berlin 2018, das Original quasi.

<br/>
Die Fakten gleich vorweg: Es war der Summit mit den wenigsten Besuchern. 2000 waren angemeldet, zur Keynote schafften es gerade mal 1200. Normalerweise zaehlen die US Summits zu den besseren besuchten, nicht so in Denver. Die Teilnehmer verloren sich in dem riesigen Colorado Convention Center in der 14. Strasse in Denver, ein Feueralarm kurz vor Beginn der Keynote erscheint noch als schlechtes Omen. Die Keynotes selber: Jonathan Bryce limitierte seine Redezeit selber auf 19 Minuten, in der er groesstenteils von seiber Kindheit erzaehlte und wie er zur Firma RackSpace gekommen ist. Nun ist er schon seit 8 Jahren Executive Director der OpenStack Foundation und seine Ziellosung ist klar: "Fight for the users" 


<img src="/blog/media/quick-uploads/p674/20190429_091736.jpg" width="585" height="386"/>

und die Deklaration der 4 Open's. 

Open Source
Open Community
Open Developement
Open Design.


<img src="/blog/media/quick-uploads/p674/20190429_091702.jpg" width="585" height="386"/>

Das Ganze wird aber wenig spaeter schon wieder revidiert durch die Sponsor-Keynote von Intel, gehalten von Melissa Evers-Hood, die einfach mal ein 5. Open dazuaddiert: 

<img src="/blog/media/quick-uploads/p674/20190429_102940.jpg" width="585" height="386"/>

In der Idee sicher richtig, wirkt aber in der Summe etwas zerstreut. Auch die neu propagierte Zahl der Community Mitglieder von 105.000 laesst sich im selben Atemzug revidieren: Gerade einmal 1468 haben mit Code Commits tatsaechlich etwas zur OpenStack Software beitragen, also 1,3 %.

Was ist also los im Hause OpenStack? Ist das der Anfang vom Ende, nach der Umbenennung der Veranstaltung (man war sich selbst dann nicht mal klar ob es jetzt der Open Infrastructure Summit oder der der Open Infra Summit ist)? Code Speicher und Code Review Systeme heissen jedenfalls von nun an https://opendev.org.

OpenStack ist erwachsen geworden. Spaetestens dieser Summit hat gezeigt, dss es entwicklungstechnisch keine grossen Neuerungen gibt. Waehrend die Kernprojekte wie Nova, Cinder und Neutron in einer recht guten Verfassung sind und einen festen, bunten Entwicklerstamm um sich binden, liegen andere Projekte brach oder klagen ueber mangelnden Zuspruch oder zuviel Einseitigkeit, weil ein Vendor das Projekt komplett an sich gerissen hat.

Auf der anderen Seite stroemen die neuen Projekte Airship und StarlingX unter den Schirm der OpenStack Foundation, um dessen Marketing und Infrastrukture mitzunutzen, wobei das neu hinzugestossene Gate-Check-System Zuul schon laenger Bestandteil des OpenStack CI/CD Systems ist und von denselben Leuten auch entwickelt und betrieben wird. Nicht sehr ueberraschend, dass es offiziellen Projektstatus ausserhalb der OpenStack Domain erhaelt. Zuul setzt konsequent auf die Nutzung von Ansible. 

<img src="/blog/media/quick-uploads/p674/20190429_104215_0_.jpg" width="585" height="386"/>

Virtuelle Maschinen lassen sich auch in anderen CI/CD Systemen wie Gitlab Runner oder Travis starten, aber nur in Zuul gibt es schon vorgefertigte Job-Templates, die selbst genutzt oder erweitern werden koennen.

Was es sonst noch Neues gab, fassen die <a href=" https://docs.google.com/presentation/d/1Lq2X__xxRhrAaWDeDmQ6jfhhXhWvxjYNY0XnJlXwBV8/edit#slide=id.g58e7c76f24_0_858">Slides vom Technischen Kommitee </a>gut zusammen:

Man fokusiert sich mehr auf Kernthemen wie Ironic (Bare Metal Provisioning) und Keystone (Authentication Service). Stabilisierung und bessere Nutzerfreundlichkeit wie etwa der neu erfundene Upgrade Checker stehen im Vordergrund.
Und das ist auch der einzige Weg fuer ein ausgereiftes Industrieprodukt: Erfahrungen von den Nutzern aufnehmen, "das Kundenerlebnis verbessern", wie es immer so schoen heisst. 

Dr. Bucher hat das in der Deutsche Telekom Keynote gut zusammengefasst: Day-2-Operations - ohne jetzt genauer darauf einzugehen, das gab der 10 Minuten Zeitslot nicht her. 

<img src="/blog/media/quick-uploads/p674/20190429_100058.jpg" width="585" height="386"/>

Aber das ist das Feld der lokalen Usergroups, bei deren Organisation es etwas Neues gibt:
Das Portal groups.openstack.org wird abgeschafft und alle Downstream Aktivitaeten unter der Meetup-Seite https://meetup.com/pro/osf gebuendelt.
Bei Meetup gab es bislang schon immer OpenStack User Groups, aber man musste schon explizit danach suchen. Bei der neuen Seite hat Gruppenaktivitaeten auf einem Blick. Die Idee ist, Informationsmaterial fuer Meetups und Workshops besser auszutauschen und vielleicht auch einen interessanten Speaker fuer seine Region zu finden. Wir werden sehen wie sich das dieses Jahr entwickelt.

Das Wort zum Schluss von der besten Keynote dieses Jahr von canonical Mark Shuttleworth (Canonical Sponsor-Keynote).

<img src="/blog/media/quick-uploads/p674/20190429_104709.jpg" width="585" height="386"/>

"Die Revolution hat Beine bekommen", sprach er. 10 Jahre OpenStack sind zu feiern, 15 Jahre lang gibt es Ubuntu. Es ist ein Grund fuer
die Community sich noch mehr auf das Projekt zu konzentrieren. Kein Grund fuer die Midlife-Krise und neue fancy Projekte zu suchen.
Auch ein Vendor ist verpflichtet, offen zu sein. Und da schliesst sich der Kreis wieder zu den 4 Opens.

[video:youtube:s2kxHFLc_XA?t=508]

Bildergalerie:

Marketplace Impressionen

<img src="/blog/media/quick-uploads/p674/20190501_103154.jpg" width="585" height="386"/>

<img src="/blog/media/quick-uploads/p674/20190501_103441.jpg" width="585" height="386"/>

<img src="/blog/media/quick-uploads/p674/20190501_103302.jpg" width="585" height="386"/>

Mein persoenliches Thema 2019 Business Model von Open Source

<img src="/blog/media/quick-uploads/p674/20190430_160823.jpg" width="585" height="386"/>

<img src="/blog/media/quick-uploads/p674/20190430_165116.jpg" width="585" height="386"/>

<img src="/blog/media/quick-uploads/p674/20190501_091413.jpg" width="585" height="386"/>

PTG - und was die Nutzerumfrage davon haelt

<img src="/blog/media/quick-uploads/p674/20190502_175000.jpg" width="585" height="386"/>

<img src="/blog/media/quick-uploads/p674/20190502_125141.jpg" width="585" height="386"/>

<img src="/blog/media/quick-uploads/p674/20190501_144227.jpg" width="585" height="386"/>

Liste interessanter Etherpads:

https://etherpad.openstack.org/p/docs-i18n-project-onboarding-denver
https://etherpad.openstack.org/p/DEN-openlab-whats-next
https://etherpad.openstack.org/p/CommunityLeadership-Denver2019
https://etherpad.openstack.org/p/DEN-ops-war-stories-LT33243267
https://etherpad.openstack.org/p/DEN-ptl-tips-and-tricks
https://etherpad.openstack.org/p/DEN-Operator-end-user-Public-cloud-feedback
https://etherpad.openstack.org/p/DEN-drive-common-goals
https://etherpad.openstack.org/p/OIS-PTG-denver-feedback
https://wiki.openstack.org/wiki/PTG/Train/Etherpads
