---
layout: post
tag: inet
title: Weblogauswertung mit Mapreduce Jobs
subtitle: "Oder: Was ist Pig und Hive?Als  praktische Anwendung fuer MapReduce-Jobs werden immer Statistiken und  Logfileauswertungen angefuehrt. Erstaunlich wenig Beispiele findet man  dazu allerdings bei Google. Ist alles doch nur graue Theorie? Oder  werkelt jeder heimlich vor sich hin?"
date: 2011-01-08
author: eumel8
---

>Oder: Was ist Pig und Hive?  Als praktische Anwendung fuer MapReduce-Jobs werden immer Statistiken und Logfileauswertungen angefuehrt. Erstaunlich wenig Beispiele findet man dazu allerdings bei Google. Ist alles doch nur graue Theorie? Oder werkelt jeder im stillen Kaemmerlein? Nach diversen [1] [2] [3] Analysen nach dem Woher und Wohin von Besuchern einer Webseite stellt sich fuer mich die Frage: Wieviel Pageviews hat meine Seite JETZT?  

Echtzeitanalysen von Webseiten macht man wohl am besten auch in Echtzeit. Also man bastelt ein kleines Google-Analytics-Javascript auf all seine Webseiten rein und kann bei den Google-Webmaster-Tools den Traffic seiner Webseite analysieren lassen. Oder, Plan B, man bastelt ein Perlscript, welches nach aussen ein kleines unsichtbares Bild darstellt und nach innen die Zugriffe der Webseite in eine Datenbank loggt. Apropos: Es gibt auch logtomysql [4], was im Apache HTTPD als Loginstanz eingebunden wird Zugriffe in eine Datenbank schreibt. Besonders nuetzlich, wenn man den Webserver auf mehrere Rechnerinstanzen betreibt und die Logzugriffe dann mal zusammenfuehren muss. Nachteilig dabei: VHosts vertraegt das Tool nicht. Ich brauche nicht nur eine eigene Tabelle fuer jeden VHost im Apache sondern auch ein eigenes Binary, wo ich den Tabellenamen vorher reinkompilieren muss. Uncool. Ausserdem wollten wir uns mit praktischen Beispiel zu MapReduce-Jobs beschaeftigen, obwohl das nun nicht gerade etwas mit Echtzeitkommunikation zutun hat, denn so ein Job dauert schon mal ein paar Sekunden oder gar Minuten. Warum soll es trotzdem fuer unser Vorhaben geeignet sein? Cloud Computing hat viel mit Queuing zutun: Erwarte das Ergebnis nicht gleich, aber sei gewiss, dass es irgendwann mal kommt. Klingt so bischen wie griechische Mythologie und um so mehr man sich damit beschaeftigt, kommt es einem auch so vor. Was ist zum Beispiel Pig? PigLatin ist eine Hochsprache fuer das Analyseprogramm Pig, welches zum Hadoop-Projekt gehoert [5]. Ein Pig-Script bezieht Daten aus einem HDFS-Storage, praesentiert diese in einem temporaerem Schema und laesst eine Verarbeitung der Daten mit Filter zu. Die Sortierung der Daten aehnelt der SQL-Syntax, wenn doch mit leichten Unterschieden [6] Folie 194 ff. Die Ergebnisse werden wieder im HDFS abgelegt. Dazwischen findet eie Job-Verarbeitung im Hadoop-Cluster statt, dem Pig muss also das Hadoop als Enviroment bekanntgemacht werden. Das ist aber schon die einzige Konfiguration.

```bash
# cd /usr/local/lily 
# wget http://apache.mirror.digionline.de/pig/pig-0.8.0/pig-0.8.0.tar.gz 
# tar xvfz pig-0.8.0.tar.gz 
# ln -s pig-0.8.0 pig 
# export PIGDIR=/usr/local/lily/pig 
# export HADOOP_HOME=/usr/local/lily/hadoop 
# export HADOOP_CONF_DIR=$HADOOP_HOME/conf 
# cp $HADOOP_CONF_DIR/*site* $PIGDIR/conf</pre>
```

```
# vi apacheAccessLogAnalysis.pig</p>
-- Registriere piggybank fuer Logformat-Schema 
register /usr/local/lily/pig-0.7.0/contrib/piggybank/java/piggybank.jar;
DEFINE LogLoader org.apache.pig.piggybank.storage.apachelog.CombinedLogLoader();
-- Lade Logs ins LogLoader Schema 
logs = LOAD '$LOGS' USING LogLoader as (remoteAddr, remoteLogname, user, time, method, uri, proto, status, bytes, referer, userAgent); 
-- vgl. CombinedLogLoader vs. CommonLogLoader. Das Logformat muss stimmen!  
-- Filter Logrequests nach Methoden, Groesse, Pageviews und Statuscodes 
logs = FILTER logs BY method == 'GET'     AND bytes != '-' AND (NOT (uri  matches '.*(css|js|gif|png|jpg|bmp|ico|swf|jpeg|class)$'))     AND status >= 200 AND status < 300;  logsfull = FILTER logs BY method == 'GET'     AND bytes != '-'     AND status >= 200 AND status < 300;  
-- Generiere Report fuer uri, status und bytes 
logs = FOREACH logs GENERATE uri, status, bytes; logsfull = FOREACH logsfull GENERATE uri, status, bytes;  groupedByUri = GROUP logs BY uri; groupedByStatus = GROUP logsfull BY status; groupedByCount = GROUP logs ALL;  
-- Highscore nach PageViews bestimmen  
uriCounts = FOREACH groupedByUri GENERATE group AS uri, COUNT(logs) AS numHits;
ordered_uniq_frequency = ORDER uriCounts BY numHits DESC;
highscore_uniq = LIMIT ordered_uniq_frequency 10;  
-- Summe aller PageViews bestimmen 
sumCounts = FOREACH groupedByCount GENERATE COUNT(logs.$0);
sum_hits = FOREACH groupedByStatus GENERATE  group AS status, SUM(logsfull.bytes)/1024/1024 as sumSize; 
-- oder so 
sum_hits = FOREACH logsfull GENERATE COUNT(uri) as sumHits, SUM(bytes) as sumSize;  
-- Ausgabe aller Werte ins HDFS STORE 
highscore_uniq INTO 'uri_counts'; STORE sumCounts INTO 'sum_counts'; 
STORE sum_hits INTO 'sum_hits';
```

Aufruf:
```
/usr/local/lily/pig/bin/pig -x mapreduce -f apacheAccessLogAnalysis.pig \
 -param LOGS='/home/hadoop/www.cnntp.net-access_log.201012*.gz'
```

Der Parameter LOGS kann also mit einer einzelnen Datei oder mehreren Dateien mit Sternchen hinterlegt werden.  Dabei ist es unerheblich, ob die Dateien mit gzip gepackt sind - Java packt diese automatisch wieder aus.  Die Ergebnisse stehen im HDFS:

1. Uebertragene Daten per Request
2. Summe aller PageViews
3. Top 10 der meistaufgerufenen Seiten

```
# /usr/local/lily/hadoop-0.20.2/bin/hadoop dfs -cat /user/hadoop/sum_hits/part*
200  94.23733425140381 
206     0.2382373809814453
```

```
# /usr/local/lily/hadoop-0.20.2/bin/hadoop dfs -cat /user/hadoop/sum_counts/part* 8600
```

```
# /usr/local/lily/hadoop-0.20.2/bin> ./hadoop dfs -cat /user/hadoop/uri_counts/part*
/       1642 
/robots.txt     1087 
/pnews/index.php?category=1     220 
/404.html       191 
/index.php      168 
/reg.php        165 
/nntpphp/index.php      128 
/pay.php        127 
/boerse.php     119 
/supp.php       83
```

Als Tagesstatistik wuerde man also den Wert aus `sum_counts` herausholen und vielleicht  in ein HBase reinschreiben, um es von dort per REST rauszuholen und auf einer Webseite darzustellen.  Die HDFS-Zielverzeichnisse muessen vor jedem Start leer sein.

```
# /usr/local/lily/hadoop-0.20.2/bin> ./hadoop dfs -rmr /user/hadoop/*_counts 
# /usr/local/lily/hadoop-0.20.2/bin> ./hadoop dfs -rmr /user/hadoop/*_hits
```


Was ist Hive? Hive ist ein Dataware House Layer als Praesentationsschicht fuer Hadoop.  Es existiert ein permanentes Schema, in welchem Daten aus HDFS oder lokaler Festplatte  dargestellt werden. Die Ergebnisse werden im STDOUT dargestellt. Wir brauchen also  wieder die Verknuepfung ueber `HADOOP_HOME` zum Hadoop-Cluster.  Aus dem Beispiel `serde_regex.q`

```
/usr/local/lily/hive/bin/hive
```

```
add jar lib/hive_contrib.jar;
DROP TABLE serde_regex; 
CREATE TABLE serde_regex(  host STRING,  identity STRING,  user STRING,  time STRING,  request STRING,  status STRING,  size STRING,  referer STRING,  agent STRING) ROW FORMAT SERDE 'org.apache.hadoop.hive.contrib.serde2.RegexSerDe' WITH SERDEPROPERTIES (   "input.regex" = "([^ ]*) ([^ ]*) ([^ ]*) (-|\\[[^\\]]*\\]) ([^  \"]*|\"[^\"]*\") (-|[0-9]*) (-|[0-9]*)(?: ([^ \"]*|\"[^\"]*\") ([^ \"]*|\"[^\"]*\"))?",  "output.format.string" = "%1$s %2$s %3$s %4$s %5$s %6$s %7$s %8$s %9$s" ) STORED AS TEXTFILE; LOAD DATA LOCAL INPATH "/home/hadoop/www.cnntp.net-access_log" INTO TABLE serde_regex;
SELECT * FROM serde_regex ORDER BY time;
```

Mit Serde wird also das Schema definiert, im dem meine Logfile-Daten dargestellt werden. Neben dem raw-Format  gibt es noch einige Hilfsprogramme, um Daten im Hive zu bearbeiten:  SQuirrel SQL Client: Die Sache mit dem Eichhoernchen. Das ist ein grafisches Tool, vergleichbar mit dem SQL-Developer  von Oracle. Man kann Schemas erstellen und SQL-Abfragen starten. Setzt voraus, dass ein JDBC-Treiber im Squirrel  eingebunden ist, welcher mit  jisql auf Port 444 laeuft und die Cloudbase-Libs mit eingebunden hat:

```
# cat /home/hadoop/jisql-2.0.7/runit java -classpath lib/jisql-2.0.7.jar:../cloudbase-1.3.1/build/jar/cloudbasejdbc-1.3.jar com.xigole.util.sql.Jisql \
 -user test -password test -driver com.business.cloudbase.CBDriver -cstring jdbc:cloudbase://localhost:4444 -c \;
```

[9]-[11]  Cloudbase findet dann den Weg zu unserem Hadoop-Cluster, respektive Hive mit seinen sql-artigen Tabellen.  Zum Schluss sei noch [8] erwaehnt. Ein Tool mit dem man Daten aus einer SQL-Datenbank ins Hadoop transerieren kann.  Sicherlich nicht uninteressant. Weitere praktische Beispiele findet man in [12] und [13]  

[1] [http://www.joshdevins.net/2010/02/22/log-analysis-pig-gnuplot/](http://www.joshdevins.net/2010/02/22/log-analysis-pig-gnuplot/)
[2] [http://allaboutdata.net/blog/?p=38](http://allaboutdata.net/blog/?p=38)
[3] [http://www.cloudera.com/blog/2009/06/analyzing-apache-logs-with-pig/](http://www.cloudera.com/blog/2009/06/analyzing-apache-logs-with-pig/)
[4] [http://logtomysql.sourceforge.net/index.html](http://logtomysql.sourceforge.net/index.html)
[5] [http://pig.apache.org](http://pig.apache.org)
[6] [http://www.slideshare.net/hadoop/practical-problem-solving-with-apache-hadoop-pig](http://www.slideshare.net/hadoop/practical-problem-solving-with-apache-hadoop-pig)
[7] [http://hive.apache.org](http://hive.apache.org)
[8] [https://github.com/sonalgoyal/hiho](https://github.com/sonalgoyal/hiho)
[9] [http://cloudbase.sourceforge.net/index.html#userDoc](http://cloudbase.sourceforge.net/index.html#userDoc)
[10] [http://www.squirrelsql.org/](http://www.squirrelsql.org/)
[11] [http://www.xigole.com/software/jisql/jisql.jsp](http://www.xigole.com/software/jisql/jisql.jsp)
[12] [http://www.cloudera.com/blog/2009/09/grouping-related-trends-with-hadoop-and-hive/](http://www.cloudera.com/blog/2009/09/grouping-related-trends-with-hadoop-and-hive(
[13] [http://nandz.blog-spot.com/2009/07/using-hive-for-weblog-analysis.html](http://nandz.blog-spot.com/2009/07/using-hive-for-weblog-analysis.html)

Begriffserklaerungen des Wegs: CLI - Command Line Interface GUI - Graphical User Interface
