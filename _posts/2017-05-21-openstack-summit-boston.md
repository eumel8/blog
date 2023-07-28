---
layout: post
tag: openstack
title: OpenStack Summit Boston
subtitle: "OpenStack Summit Boston (english version page 2) Gerade ist er zu Ende gegangen - der neue OpenStack Summit. Diesmal ohne Design Summit, der fand schon einige Wochen vorher als Project Team Gatering (PTG) in Atlanta statt. Es gab&hellip;"
date: 2017-05-21
author: eumel8
---

OpenStack Summit Boston
(english version page 2)

<img src="/images/quick-uploads/p588/wp_20170510_18_35_52_rich.jpg" width="585" height="386"/>

Gerade ist er zu Ende gegangen - der "neue" OpenStack Summit. Diesmal ohne Design Summit, der fand schon einige Wochen vorher als Project Team Gatering (PTG) in Atlanta statt. Es gab Diskussionen, ob der OpenStack Summit so zur reinen Marketingveranstaltung verkommt. Aber Jonathan Bryce, Executive Director der OpenStack Foundation, hoerte nicht auf zu betonen, dass es eine Konferenz fuer die Entwickler war, ist und bleibt. Und so kamen sie dann alle: Mehr als 5000 angemeldete Teilnehmer aus 63 Laendern. Ueber 1000 verschiedene Organisation, ein Heer von Firmen als Sponsoren. 

<br/>
Die Deutsche Telekom zum zweiten Mal als Gold Sponsor dabei. 

<img src="/images/quick-uploads/p588/c_zb_wqw0aabtau.jpg" width="585" height="386"/>
<img src="/images/quick-uploads/p588/wp_20170511_16_37_39_rich.jpg" width="585" height="386"/>

Und wie wars? Teuer wars! Diese Schelte musste sich die Foundation im Community Feedback schon gefallen lassen, den Summit in einen der teuersten Staedte der USA stattfinden zu lassen. Bei Hotelpreisen um 300-500 Dollar die Nacht sah das Budget in Euro nicht gerade ueppiger aus. 
Was bekam man dafuer geboten? im Hynes Convention Center fand ein Grossteil der Veranstalung statt. Das Konferenzzentrum wird von 4 grossen Hotels umringt, unter anderem den Sheraton Twin-Tower, und alle Gebaeude sind miteinander verbunden. So konnte man trockenen Fusses bei dem 8 Grad kalten und regnerischem Wetter zwischen den Veranstaltungen wechseln.

<img src="/images/quick-uploads/p588/wp_20170510_22_59_01_rich.jpg" width="585" height="386"/>

Alle Vortraege sind natuerlich wieder bei Youtube oder der OpenStack Webseite online zu finden: 
https://www.openstack.org/videos/summits/boston-2017
Bei letzterer Seite sind manchmal auch die Praesentationen dabei, wenn die Sprecher sie hochgeladen haben.

Ein erstes Highlight eines jeden Summits sind natuerlich die Keynotes:

https://www.openstack.org/videos/boston-2017/tracks/keynotes

Jonathan Bryce sieht Wachstum in der Benutzung von OpenStack: 44% im letzten Jahr. 5 Mio CPU Cores sind laut Umfrage OpenStack verwaltet. Die Haelfte der US Fortune 100 Unternehmen benutzen OpenStack. Dabei ist man jetzt in der zweiten Generation von Private Cloud angekommen. Die erste Generation, die Hyper Scale Cloud, hat sich noch um Technologien und Talente gedreht. Es kamen Virtualisierungen mit Schluesseltechnologien von VMWare, Eucalypthus, CloudStack und OpenStack zum Einsatz. In der zweiten Generation der Private Cloud wird nun alles virtualisiert: Netzwerke, Speicher, Container, Bare Metal
Schluesseltechnolgien sind OpenStack, Cloud Foundy, Kubernetes und Mesos. Dabei dreht es sich mehr um Kultur und Prozesse. Die Technologie soll dabei so einfach werden, dass auch kleine Teams OpenStack installieren und verwalten koennen. Weniger Kosten, mehr Nutzen.
Nicht verwunderlich, dass Jonathan Bryce waehrend seiner Keynote gleich zwei Mitglieder des User Comitee auf die Buehne holte - also die Leute, die das Ohr an der Schiene haben. Die OpenStack Software ist ja kein Selbstzweck. Es gibt sehr viele Softwareprojekte unter dem Big Tent, die somit zum OpenStack-Projekt gehoeren. Aber was faengt man dann mit OpenStack an, wurde gefragt. Welche Applikationswerkzeuge laufen auf Eurem OpenStack:
<pre>
45 % Kubernetes
18 % OpenShift
18 % CloudFoundry
17 % Build our own
14 % Mesos
14 % Docker Swarm
17 % Andere
</pre>

Solchen Umfragen wurden Rechnung getragen und so wurden parallel zum OpenStack Summit die OpenSource Days veranstaltet. Zahlreiche Softwareprojekte wie Ansible, Ceph oder Kubernetes konnten ihre Fans um sich scharen. Gerade um Kubernetes gab es einen wahren Hype und so musste fast jeder Vortrag, der etwas auf sich haelt, etwas von Kubernetes beinhalten.

Mein Schwerpunkt war allerdings Ansible bzw. OpenStack-Ansible und deren Anwendung in der Translation Check Site https://review.openstack.org/#/c/440825/

Und so traf ich mich auf dem Forum mit Ian Y. Choi (PTL I18n), Rob Cresswell (PTL Horizon) und Andy McCrae (PTL OSA), um einen gemeinsamen Schlachtplan zu entwickeln 

<img src="/images/quick-uploads/p588/c_lybmfxkaiz-ls.jpg" width="585" height="386"/>

Andy ist wirklich ein smarter Typ, der das Problem schnell durchblickt hat - etwa in der Geschwindigkeit, wie das ganze Projekt nach vorne schnellt. 

Auf einigen Sessions hat er das Projekt vorgestellt und woran in Zukunft gearbeitet werden soll:

[video:youtube:QCmSHSaah3Y]
[video:youtube:UUe96OmCCug]

OpenStack Forum ist eine neue Veranstaltungsform auf dem OpenStack Summit. In etwa 10 verschiedene "Hackrooms" konnten sich die Programmierer zurueckziehen und aktuelle Probleme besprechen. Auch neu waren die OnBoarding Sessions. Projekte hatten hier die Moeglichkeit, neue Teammitglieder zu begruessen. Wer sich zum Beispiel dafuer interessierte, bei OpenStack-Ansible mitzuarbeiten, wurde von Andy unterrichtet, worauf es ankommt und vor allem auch WIE gearbeitet werden soll, damit die Zusammenarbeit klappt.


"The Next Generation of Contributor" - so soll die OpenStack Community weiter wachsen. Auch aus Deutschland waren zahlreiche Teilnehmer angereist. In der Liste der meisten Besucher des Summits standen wir auf Platz 6. Das deckt sich mit der Herkunft der Benutzer, die http://docs.openstack.org, dem Dokumentationssystem von OpenStack, benutzen: ebenfalls Deutschland auf Platz 6. Nicht verwunderlich, dass deutsche Dokumentation auf Platz 7 der meistgelesenen Dokumentationen steht (nach englisch, chinesisch, japanisch, franzoesisch und koreanisch). Diese Zahlen praesentierte <a href="https://twitter.com/dewsday">Alexandra Settle</a>, PTL Documentation Team beim Teammeeting von I18n.

<img src="/images/quick-uploads/p588/c_lzgdrxcaaibhj.jpg" width="585" height="386"/>

Und wer weiss, vielleicht findet ja doch einer der naechsten Summits in Deutschland statt, wenn man eine geeignete Lokation finden wuerde.

Am selben Tag fand auch unsere Praesentation "Participating in Translation Makes You an Internationalized OpenStacker and Developer" statt:
https://www.openstack.org/videos/boston-2017/participating-in-translation-makes-you-an-internationalized-openstacker-and-developer

<img src="/images/quick-uploads/p588/wp_20170511_20_11_44_rich.jpg" width="585" height="386"/>

Ian Y. Choi, Jean-François Taltavull, Frank Kloeker (v.r.n.l.)

Neben der Erklaerung, was das I18n Team macht, ist auch noch eine Anleitung dabei, wie man selbst als Contributer mit einsteigen und OpenStack in seiner Sprache herausbringen kann.

Das neue OpenStack Release Ocata ist bei den Hauptpraesentationen etwas kurz gekommen. Wenn man da an vergangene Summits denkt, wurden Neuerungen noch im groesseren Rahmen gefeiert. Damit sich Projekt-Teams mit etwas ausserhalb des Codes identifizieren koennen, gibt es jetzt die Projekt-Maskottchen: 

https://www.openstack.org/project-mascots/

In der Foundation Lounge gab es nun zahlreiche Aufkleber mit den Team-Maskottchen und so erkennt man jetzt jedes Team an seinem gewaehltem Logo, Tier oder Pflanze.

<img src="/images/quick-uploads/p588/c_8zb5buaaauqgk.jpg" width="585" height="386"/>

Aber auch sonst hat sich natuerlich in zahlreichen Projekten etwas getan, weswegen zahlreiche Sessions die Project Updates als Thema hatten:

https://www.youtube.com/user/OpenStackFoundation/search?query=Project+Update&amp;sp=CAI

Die Interop-Projektgruppe konnte sich mit der zweiten Interop Challenge wieder besonders gut in Szene setzen. Mark Collier hatte sich wieder besondere "Gemeinheiten" einfallen lassen, die die Ops auf ihren jeweiligen Cloud zum Laufen bringen mussten:

<img src="/images/quick-uploads/p588/wp_20170510_16_20_30_rich.jpg" width="585" height="386"/>
[video:youtube:nBXXLNIwAoo]
[video:youtube:Xo22mqWM4Xo]

Wer sich mehr fuer die Arbeit der InterOps interessiert, findet Informationen auf https://wiki.openstack.org/wiki/Interop_Challenge

Sehr interessant dazu auch der Vortrag von Monty Taylor zu Python Shade:

[video:youtube:Z4gnNdk5GQY]
Slides: http://inaugust.com/talks/everything-you-ever-wanted.html#/

Er zeigt in seinem Vortrag, wie Server-to-Server-Verbindungen in OpenStack funktionieren und wie man Python Shade erweitern kann (etwa mit eigenen Diensten und APIs wie bei der Open Telekom Cloud)

<strong>Was gabs sonst noch Neues:</strong>

<strong>Remotely managed Private Cloud</strong>
https://www.openstack.org/marketplace/remotely-managed-private-clouds/

Eine neue Kategorie von Cloud Diensten, bei dem Anbieter fernverwaltete private Clouds anbieten.

Und das naechste grosse Ding: <strong>Edge OpenStack</strong>, wo es darum geht, fuer IoT oder AR/VR/Dronen OpenStack-Instanzen in Stueckzahlen zu 2000+ statt in 20+ Rechenzentren/Verfuegbarkeitsszonen bereitzustellen. Einfach aus Gruenden der Latenzzeiten und Datenmengen, die sich in naher Zukunft rapide aendern werden.

<a href="https://twitter.com/bfcohen">Beth Cohen</a> von Verizon zeigte Anwendungsfaelle von Edge Computing auf der Keynote und in einem Fachvortrag:
https://www.openstack.org/videos/boston-2017/taking-openstack-out-to-the-network-edges

[video:youtube:WbeLMhcrkz8]

Etwas Probleme irdischer Art zeigte das OTC-Team:

Image Build as a Service- Why It Makes Sense to Build Your Own Cloud Images 

https://www.openstack.org/videos/boston-2017/image-build-as-a-service-why-it-makes-sense-to-build-your-own-cloud-images

Wenn man von jederzeit seine Applikation von einem blanken Ubuntu-Image mit oder ohne cloud-init mit Puppet und/oder Ansible hochziehen kann, ist das zwar sehr nobel im Automaisierungshimmel, es dauert aber seine Zeit. Mit fertig konfigurierten Images kann man unter Umstaenden schneller zum Erfolg kommen.

Sehr viel Lehrreiches dabei auf dem OpenStack Summit. Ein ganzer Bereich war zum Beispiel die OpenStack University. The Linux Academy bot zum Beispiel Schulungen an, die manche Teilnehmer den ganzen Tag verfolgt hatten. 
Ein Thema ist der Certified OpenStack Administrator, die erste Zertifizierung von OpenStack, die es seit 2016 gibt. Dazu gab es einen Vortrag mit zahlreichen Tips, wie man die Pruefung bestehen kann und wer weiss, vielleicht ist das eines Tages mit Bestandteil bei Telekom Ausbildung:

[video:youtube:G_JDLt2vDgY]

Zum Schluss noch ein Hinweis auf https://www.openstack.org/enterprise und dem neuen Buch "Designing, Migrating and Deploying Applications", welches zum Bestellen oder auch als Download gibt: 
https://www.openstack.org/assets/enterprise/OpenStack-AppDevMigration8x10Booklet-v10-online.pdf

Etwas zu Lesen und die Zeit zu Verkuerzen bis zum naechsten Summit!

<img src="/images/quick-uploads/p588/51jv-t9d-vl._sx398_bo1_204_203_200_.jpg" width="585" height="386"/>

[pagebreak]

OpenStack Summit Boston

<img src="/images/quick-uploads/p588/wp_20170510_18_35_52_rich.jpg" width="585" height="386"/>

It has just come to end - the "new" OpenStack Summit. Without Design Summit, it took place before some weeks ago as Project Team Gatering (PTG) in Atlanta. There were discussions if the OpenStack Summit is now a purely marketing event. But Jonathan Bryce, Executive Director OpenStack Foundation, didn't stop to emphasize that the summit was, is and will for developers. And so they came: more then 5000 registered attendees from 63 countries. More then 1000 organizations, an army of companies as sponsors.

<br/>
Deutsche Telekom the second time as Gold Sponsor:. 

<img src="/images/quick-uploads/p588/c_zb_wqw0aabtau.jpg" width="585" height="386"/>
<img src="/images/quick-uploads/p588/wp_20170511_16_37_39_rich.jpg" width="585" height="386"/>
And how was it? Expensive was it! In the community feedback, the Foundation had already had to accept this scolding as the Summit was to be one of the most expensive cities in the USA. At hotel prices around 300-500 dollars the night saw the budget in euros not just even better.
What did they offer? A large part of the event took place at the Hynes Convention Center. The conference center is surrounded by 4 major hotels, including the Sheraton Twin Tower, and all buildings are interconnected. So you could change dry foot in the 8 degrees cold and rainy weather between the sessions
.
<img src="/images/quick-uploads/p588/wp_20170510_22_59_01_rich.jpg" width="585" height="386"/>

All the talks can be found online at Youtube or the OpenStack website:
https://www.openstack.org/videos/summits/boston-2017
On this website, slides of the presentation are sometimes also online when the speakers have uploaded them.

The first highlight of earch Summit are, of course, the keynotes:

https://www.openstack.org/videos/boston-2017/tracks/keynotes

Jonathan Bryce sees growth in the use of OpenStack: 44% last year. 5 million CPU cores are managed by OpenStack according to the last survey. Half of the US Fortune 100 companies use OpenStack. We're now arrived in the second generation of Private Cloud. The first generation, the Hyperscale Cloud, has still turned around technologies and talents. VMWare, Eucalypthus, CloudStack and OpenStack were used for virtualization with key technologies. In the second generation of the Private Cloud, everything is now virtualized: networks, storage, containers, bare metal
Keystrokes are OpenStack, Cloud Foundy, Kubernetes and Mesos. It is more about culture and processes. The technology should be so simple that even small teams can install and manage OpenStack. Less costs, more benefits.

Not surprisingly, during his keynote, Jonathan Bryce brought two members of the User Comitee to the stage - the people who have the ear on the track. The OpenStack software is not a self-purpose. There are many software projects under the Big Tent, which are part of the OpenStack project. But what's going on when OpenStack is installed, was asked. Which application tools run on your OpenStack:

<pre>
45 % Kubernetes
18 % OpenShift
18 % CloudFoundry
17 % Build our own
14 % Mesos
14 % Docker Swarm
17 % Andere
</pre>

Such surveys were taken into account and the OpenSource Days were held parallel to the OpenStack Summit. Numerous software projects such as Ansible, Ceph or Kubernetes were able to thrash their fans. Just around Kubernetes there was a real hype and so almost every session, which holds something to itself, had to contain something of Kubernetes.

My focus, however, was Ansible and OpenStack Ansible and their application in the Translation Check Site 

https://review.openstack.org/#/c/440825/

And so I met on the forum with <a href="https://twitter.com/ianychoi">Ian Y. Choi</a> (PTL I18n), <a href="https://twitter.com/robcresswell">Rob Cresswell</a> (PTL Horizon) and <a href="https://twitter.com/andymccrae">Andy McCrae</a> (PTL OSA) to develop a common battle plan 

<img src="/images/quick-uploads/p588/c_lybmfxkaiz-ls.jpg" width="585" height="386"/>

Andy is really a smart guy who has bounced the problem quickly - with speed how the whole project is moving forward.
On some sessions, he presented the project and what should be done in the near future:

[video:youtube:QCmSHSaah3Y]
[video:youtube:UUe96OmCCug]

OpenStack Forum is a new event form at the OpenStack Summit. In about 10 different "hackrooms", the developer were able to withdraw and discuss current problems. Also new were the OnBoarding sessions. Projects had the opportunity to welcome new team members here. Who, for example, was interested in working with OpenStack-Ansible, was taught by Andy, what is important and, above all, how to work, so that the colaboration works well.

"The Next Generation of Contributor" - the OpenStack community is set to grow. Numerous participants from Germany were also present. In the list of most visitors to Summits, we were ranked at 6th. This coincides with the origin of the users who use http://docs.openstack.org, the documentation system of OpenStack: Germany also ranked at 6th. Not surprisingly, German documentation is ranked 7th among the most-read documentaries (after English, Chinese, Japanese, French and Korean). 
These metrics were presented by <a href="https://twitter.com/dewsday">Alexandra Settle</a>, PTL Documentation Team at Teammeeting of I18n.

<img src="/images/quick-uploads/p588/c_lzgdrxcaaibhj.jpg" width="585" height="386"/>

And who knows, maybe one of the next summits in Germany will take place if we find a suitable location.

On the same day we held our presentation "Participating in Translation Makes You an Internationalized OpenStacker and Developer" :

https://www.openstack.org/videos/boston-2017/participating-in-translation-makes-you-an-internationalized-openstacker-and-developer

<img src="/images/quick-uploads/p588/wp_20170511_20_11_44_rich.jpg" width="585" height="386"/>

<a href="https://twitter.com/ianychoi">Ian Y. Choi</a>,<a href="https://twitter.com/jftalta"> Jean-François Taltavull</a>, <a href="https://twitter.com/eumel_8">Frank Kloeker</a> (f.r.t.l.)

In addition to explaining what the I18n team is doing, there is also a tutorial on how to join as a contributer and translate OpenStack in your own language.

The presentation of the new OpenStack Release Ocata has come a little short at the main presentations. If I think about past Summits, innovations were still celebrated on a larger scale. In order for project teams to identify themselves with something outside of the code, there are now the project mascots
: 
https://www.openstack.org/project-mascots/

In the Foundation Lounge there were now numerous stickers with the team mascots and so you can now recognize each team at their chosen logo, animal or plant.

<img src="/images/quick-uploads/p588/c_8zb5buaaauqgk.jpg" width="585" height="386"/>

But also in other projects, something has happened, which is why numerous sessions had the project updates as a topic:

https://www.youtube.com/user/OpenStackFoundation/search?query=Project+Update&amp;sp=CAI

With the second Interop Challenge, the Interop project group was able to put itself in a particularly good position again. Mark Collier had once again come up with some "bad things" that had to make the Ops work on their respective Cloud:

<img src="/images/quick-uploads/p588/wp_20170510_16_20_30_rich.jpg" width="585" height="386"/>
[video:youtube:nBXXLNIwAoo]
[video:youtube:Xo22mqWM4Xo]

If you are interested in InterOps, you can find information on https://wiki.openstack.org/wiki/Interop_Challenge

Also interesting is the session by <a href="https://twitter.com/e_monty">Monty Taylor</a> on Python Shade:

[video:youtube:Z4gnNdk5GQY]
Slides: http://inaugust.com/talks/everything-you-ever-wanted.html#/

In his session, he shows how server-to-server connections work in OpenStack and how to extend PythonShade (for example with their own services and APIs like the Open Telekom Cloud)

Other interesting stuff

<strong>Remotely managed Private Cloud</strong>
https://www.openstack.org/marketplace/remotely-managed-private-clouds/

A new type of cloud services where provider offer remotely managed Private Cloud.

And the next big thing: <strong>Edge OpenStack</strong>, here are OpenStack instances for IoT or AR/VR/Drones in counts 2000+ instead 20+ data center/availabilty zones. Simply for reasons of latencies and data volumes, which will change rapidly in the near future.

<a href="https://twitter.com/bfcohen">Beth Cohen</a> from Verizon shows use cases of Edge Computing as keynote and session:
https://www.openstack.org/videos/boston-2017/taking-openstack-out-to-the-network-edges
https://www.youtube.com/watch?v=WbeLMhcrkz8

The OTC team showed some problems of earthly nature:

Image Build as a Service- Why It Makes Sense to Build Your Own Cloud Images 

https://www.openstack.org/videos/boston-2017/image-build-as-a-service-why-it-makes-sense-to-build-your-own-cloud-images

If you can deploy your application at any time from a naked Ubuntu image with or without cloud-init with Puppet and / or Ansible, this is, of course, very nice in automation, but it takes time. With preconfigured images, you can be more successful.

A lot of learning at the OpenStack Summit. A whole area was OpenStack University. The Linux Academy, for example, offered training sessions that some attendees followed the whole day.
One of the topics is the Certified OpenStack Administrator, the first OpenStack certification that has existed since 2016. In addition, there was a session with numerous tips on how to pass the test and who knows, maybe one day this is part of Telekom training:

[video:youtube:G_JDLt2vDgY]

At the end a reminder on https://www.openstack.org/enterprise and the new book "Designing, Migrating and Deploying Applications", which is to order or download: 
https://www.openstack.org/assets/enterprise/OpenStack-AppDevMigration8x10Booklet-v10-online.pdf

Something the read and cutting the time until the next Summit!

<img src="/images/quick-uploads/p588/51jv-t9d-vl._sx398_bo1_204_203_200_.jpg" width="585" height="386"/>

------------------------------------------------------------------------------------------------------------------------------------------------------
Links:
<ul>
 <li>Session-List: https://www.openstack.org/summit/boston-2017/summit-schedule</li>
 <li>Recap Superuser-Magazine: http://superuser.openstack.org/articles/openstack-summit-boston-recap-post/</li>
 <li>My Youtube Playlist: https://www.youtube.com/playlist?list=PLBYczRi39Ez77U-CBKfD7pMwtL9_p3_5f</li>
</ul>
