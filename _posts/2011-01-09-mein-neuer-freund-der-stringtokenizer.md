---
layout: post
tag: general
title: Mein neuer Freund der StringTokenizer (MapReduce Teil 2)
subtitle: "Eigentlich wollte ich ja fuer den Newstickerzaehler ein Servlet entwickeln, mit welchem man quasi interaktive die Hits des Tages abrufen kann, aber dann kam wieder alles ganz anders. Welcher praktische Nutzen hat jetzt MapReduce?" 
date: 2011-01-09
author: eumel8
---

Eigentlich wollte ich ja fuer den Newstickerzaehler ein Servlet entwickeln, mit welchem man quasi interaktive die Hits des Tages abrufen kann, aber dann kam wieder alles ganz anders. Welcher praktische Nutzen hat jetzt MapReduce?

Klassischer Fall fuer alle Statistiker: Logfileauswertung.

Man nehme ein klassisches Access-Logfile eines Apache-Webservers. Wenn man nur ein paar Tausend Zugriffe im Monat hat, kommt man mit Awstats oder Webalizer wunderbar zurecht. Aber was passiert bei paar Million Zugriffe am Tag? Richtig, da explodiert der Statistikrechner. Als Alibi fuer Unwissenheit kann man dann ein groesseren Rechner bestellen. Wenn da nicht schon Rechner vorhanden waeren, deren Rechenleistung wegen geringfuegiger Hauptbeschaeftigung die meiste Zeit brach liegt. Nutzen wir nun diese Zeit... Als erstes installieren wir einen Hadoop-Cluster. Klingt wahnsinnig kompliziert, aber es beschraenkt sich auf Runterladen der Software und Durchlesen des Howto auf http://hadoop.apache.org/common/docs/r0.20.2/cluster_setup.html.

In kurzen Schritten:


1. ssh-Verbindung zwischen Master und Nodes herstellen (am besten als User "hadoop"

```
$ useradd -m hadoop
$ su - hadoop
$ ssh-keygen -t dsa -P '' -f ~/.ssh/id_dsa
$ cat ~/.ssh/id_dsa.pub >> ~/.ssh/authorized_keys
$ scp -r ~/.ssh hdp-cl02:~/
$ scp -r ~/.ssh hdp-cl03:~/
$ scp -r ~/.ssh hdp-cl04:~/
```

2. Auf dem Master Java und Hadoop installieren.

```
$ zypper install java-1_6_0-sun
$ java -version
java version "1.6.0_22"
Java(TM) SE Runtime Environment (build 1.6.0_22-b04)
Java HotSpot(TM) Client VM (build 17.1-b03, mixed mode)
$ wget "http://mirror.synyx.de/apache//hadoop/core/hadoop-0.20.2/hadoop-0.20.2.tar.gz"
tar xvfz hadoop-0.20.2.tar.gz
```

3. Hadoop minimal konfigurieren conf/hadoop-env.sh

```
# export JAVA_HOME=/usr/java/jre1.6.0_20/
# export HADOOP_HOME=/home/hadoop/hadoop-0.20.0
```

conf/core-site.xml

```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
<property>
<name>fs.default.name</name>
<value>hdfs://hdp-cl01:54310</value>
<description>The name of the default file system. A URI whose
scheme and authority determine the FileSystem implementation. The uri's scheme determines the config property (fs.SCHEME.impl) naming
the FileSystem implementation class. The uri's authority is used to
determine the host, port, etc. for a filesystem.</description>
</property>
</configuration>
```

conf/hdfs-site.xml

```xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
<property>
<name>dfs.replication</name>
<value>2</value>
<description>Default block replication.
The actual number of replications can be specified when the file is created.
The default is used if replication is not specified in create time.
</description>
</property>
<property>
<name>dfs.name.dir</name>
<value>/tmp/hadoop-root</value>
</property>
<property>
<name>dfs.data.dir</name>
<value>/tmp/hadoop-data</value>
</property>
</configuration>
conf/mapred-site.xml
<?xml version="1.0"?>
<?xml-stylesheet type="text/xsl" href="configuration.xsl"?>
<configuration>
<property>
<name>mapred.job.tracker</name>
<value>hdp-cl01:54311</value>
<description>The host and port that the MapReduce job tracker runs at. If "local", then jobs are run in-process as a single map and reduce task.<
</description>
</property>
<property>
<name>mapred.system.dir</name>
<value>/usr/local/shadoop</value>
</property>
<property>
<name>mapred.local.dir</name>
<value>/tmp</value>
</property>
<property>
<name>mapred.map.tasks</name>
<value>40</value>
</property>
<property>
<name>mapred.reduce.tasks</name>
<value>8</value>
</property>
</configuration>
```

conf/masters

```
hdp-cl01
```


conf/slaves

```
hdp-cl01
hdp-cl02
hdp-cl03
hdp-cl04
```

Entscheidend ist der letzte Config-Eintrag, der dem Cluster sagt, wer ueberhaupt alles am Dreh beteiligt ist.

4. Hadoop auf Nodes verteilen

5. Auf Nodes Java installieren Fertig.

6. Vom Master aus Datanodes starten:

```
bin/start-dfs.sh</p>
```

7. Vom Master Jobtracker starten:

```
bin/start-mapred.sh
```

Es sollte sowas im Output zu lesen sein, dass die erwarteten Dinge auch geschehen sind (starting datanode/ starting jobtracker)

8. Cluster mit Daten betanken:

```
bin/hadoop fs -mkdir files
bin/hadoop fs -copyFromLocal /var/log/apache2/access_log files
bin/hadoop fs -ls files
```

9. WordCount.java anpassen. Da dort nur stumpf nach Woertern gesucht wird, muss man die gewuenschten Informationen aus dem Logfile rauspiepeln. Dazu habe ich mir die Java-Klasse Stringtokenizer rausgesucht:

<p>Wenn man auf ISO-Logformat umgestellt hat, sieht die ganze Klasse etwa so aus, wenn man nach Webzugriffen sucht:</p>

```java
package org.myorg;
import java.io.IOException;
import java.util.*;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.conf.*;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapred.*;
import org.apache.hadoop.util.*;
public class WordCount2 {
public static class Map extends MapReduceBase implements Mapper<LongWritable,
Text, Text, IntWritable> {
private final static IntWritable one = new IntWritable(1);
private Text word = new Text();
public void map(LongWritable key, Text value,
OutputCollector<Text, IntWritable> output, Reporter reporter) throws IOException {
String line = value.toString();
StringTokenizer tokenizer = new StringTokenizer(line);
tokenizer.nextToken("]");
tokenizer.nextToken("\"");
tokenizer.nextToken(" ");
word.set(tokenizer.nextToken());
output.collect(word,one);
}
}
public static class Reduce extends MapReduceBase implements Reducer<Text,
IntWritable, Text, IntWritable> {
public void reduce(Text key, Iterator<IntWritable> values,
OutputCollector<Text, IntWritable> output, Reporter reporter) throws IOException {
int sum = 0;
while (values.hasNext()) {
sum += values.next().get();
}
// weniger als 100 Zugriffe wollen wir nicht sehen
if (sum > 100) {
output.collect(key,new IntWritable(sum));
}
}
}
public static void main(String[] args) throws Exception {
JobConf conf = new JobConf(WordCount2.class);
conf.setJobName("wordcount");
conf.setOutputKeyClass(Text.class);
conf.setOutputValueClass(IntWritable.class);
conf.setMapperClass(Map.class);
conf.setCombinerClass(Reduce.class);
conf.setReducerClass(Reduce.class);
conf.setInputFormat(TextInputFormat.class);
conf.setOutputFormat(TextOutputFormat.class);
FileInputFormat.setInputPaths(conf, new Path(args[0]));
FileOutputFormat.setOutputPath(conf, new Path(args[1]));
JobClient.runJob(conf);
}
}
```

<p>Man koennte natuerlich auch nach Hits nach IP-Adresse suchen oder so. Dann bedarf es bloss einer Umstellung des</p>
<p>StringTokenizers. Da muss man vielleicht ein wenig basteln.

9. Kompilieren und Packen der Klasse:

```
javac -cp hadoop-0.20.2-core.jar -d wordcount_classes WordCount2.java
jar -cvf wordcount2.jar -C wordcount_classes/ .
```

10. Starten des Jobs:

```
bin/hadoop jar wordcount2.jar org.myorg.WordCount2 input output
```

input und output sind die Ein- und Ausgabe-Verzeichnisse des Jobs. Sie befinden sich bei der Standalone-Installaton lokal auf dem Rechner und beim Cluster-Setup im HDFS. Ich muss also vor dem Starten und nach dem Joblauf die Daten jeweils aus dem Cluster hoch- und runterladen (siehe oben!). Ueber ein Servlet oder eine jsp koennen wir den Output im Web ansehen: http://www.eumelnet.de:8080/cloud/logserv.jsp<

Ergebnisse der Aufgabe: Zeige die Webzugriffe des letzten Monats auf www.eumel.de mit mehr als 100 Hits:

```
String file = application.getRealPath("/") + "part-00002";
BufferedReader br = new BufferedReader(new FileReader( file));
String zeile;
ArrayList<String> Stuff = new ArrayList<String>();
AlphanumComparator ac = new AlphanumComparator();
while ((zeile = br.readLine()) != null) {
String [] splitupText = zeile.split("\t");
String a1 = splitupText[1] + " : " + splitupText[0];
Stuff.add(a1);
}
Collections.sort(Stuff, ac);
Collections.reverse(Stuff);
for(int j=0; j < Stuff.size(); j++) {
out.println(Stuff.get(j));
out.println("
");
}
```

Links:

- <a href="http://www.cs.brandeis.edu/~cs147a/lab/hadoop-troubleshooting/" target="_blank">Hadoop-Troubleshooting</a><br />- <a href="http://www.michael-noll.com/wiki/Running_Hadoop_On_Ubuntu_Linux_(Multi-Node_Cluster)" target="_blank">Just Another Cluster Config</a>

- <a href="http://www.java2s.com/Code/Java/Regular-Expressions/ParseanApachelogfilewithStringTokenizer.htm">StringTokenizer.class</a>

