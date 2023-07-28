---
layout: post
tag: inet
title: MRNT - der map/reduced Newsticker (MapReduce Teil 3)
subtitle: "Okay, letztlich war es leichter als gedacht - wenn man Servlets erstmal verstanden hat. Die neue Java-Webanwendung ist zwar noch nicht perfekt, aber das Projekt soll ja auch noch Potential fuer ein Release 2.0 hergeben und die prinzipielle Funktionsweis&hellip;"
date: 2011-01-09
author: eumel8
---

<p>Okay, letztlich war es leichter als gedacht - wenn man Servlets erstmal verstanden hat. Die neue Java-Webanwendung<br />ist zwar noch nicht perfekt, aber das Projekt soll ja auch noch Potential fuer ein Release 2.0 hergeben und die<br />prinzipielle Funktionsweise von Servlets und Apache Tomcat demonstrieren.<br /><br />Kernkomponente unserer Anwendung ist jetzt NNTP.class. Wir kennen die Java-Klasse schon aus frueheren Tests, aber<br />nun ist es ein Servlet:<br /><br />http://www.eumelnet.de:8080/cloud/NNTP.servlet.html</p>
<br/>
<p>Es hat die HTTP-Servlet Classes bekommen, erwartet<br />Parametereingaben und ruft zum Schluss per Systemcall das Hadoop auf., nachdem es alle Artikel der gewuenschten<br />Gruppe abgeholt hat.Wir koennten die Servlet-Klasse in /usr/local/apache-tomcat-6.0.26/webapps/cloud/WEBINF/<br />classes kompilieren:<br /><br /></p>
<blockquote>javac -cp /usr/local/share/java/gnumail.jar:/usr/local/share/java/gnumail-provider<br />s.jar:/usr/local/share/java/inetlib.jar:/usr/local/apache-tomcat-6.0.26/lib/servlet-api.jar NNTP.java</blockquote>
<p> </p>
<p><br />Aber dann muessten wir gnumail.jar und inetlib.jar als CLASSPATH in die catalina.sh schreiben, aber es geht auch<br />anders: Die benoetigten jars einfach ins Tomcat-Lib-Verzeichnis unter /usr/local/apache-tomcat-6.0.26/lib/ kopieren.<br />In /usr/local/apache-tomcat-6.0.26/webapps/cloud/WEB-INF/web.xml machen wir das Servlet fuer den Browser sichtbar:</p>
<pre>&lt;servlet&gt;<br />&lt;servlet-name&gt;NNTP&lt;/servlet-name&gt;<br />&lt;servlet-class&gt;NNTP&lt;/servlet-class&gt;<br />&lt;/servlet&gt;<br />&lt;servlet-mapping&gt;<br />&lt;servlet-name&gt;NNTP&lt;/servlet-name&gt;<br />&lt;url-pattern&gt;/NNTP&lt;/url-pattern&gt;<br />&lt;/servlet-mapping&gt;<br /><br /></pre>
<p>Nach dem Tomcatneustart koennte das Servlet schon funktionieren, wenn wir es mit den Parametern direkt fuettern.<br />Stattdessen bauen wir noch eine schicke Java-Server-Page fuer die Eingabe:<br />http://www.eumelnet.de:8080/cloud/mrnt.jsp.html</p>
<p>Die Ausgabe holen wir uns von dieser Server-Page ab:http://www.eumelnet.de:8080/cloud/load.jsp.html</p>
<p>Wir haben also Daten-Eingabe/-Ausgabe und -Verarbeitung gut<br />entkoppelt. Jedoch krankt unsere Webanwendung gleich an mehreren Stellen:</p>
<p><br />- Only one Single-Thread. Parallele Verarbeitung und mehrere gleichzeitige Benutzer nicht moeglich.<br />- Abholen der News dauert bei grossen Gruppen sehr lange. Hier wuerde ein Background-Job besser laufen<br />- Ausgabe der Artikelanzahl nicht begrenzt (bei 5000 Artikeln gibt es eine Art von Timeout)<br />- Eingabe wird nicht ueberprueft (eher ein fehlendes Sicherheitsfeature)<br />- Hadoop wird direkt aufgerufen und nicht als Jobconf im Hadoop-Cluster. Deswegen laeuft Hadoop auch noch relativ<br />lang. Aber das ist dann vielleicht etwas fuers naechste Release, oder ;-)</p>
<p>Das Ergebnis des Projekts gibt es erstmal<br />hier: http://www.eumelnet.de:8080/cloud/mrnt.jsp</p>
