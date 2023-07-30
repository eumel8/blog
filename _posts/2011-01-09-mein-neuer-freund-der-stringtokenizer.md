---
layout: post
tag: general
title: Mein neuer Freund der StringTokenizer (MapReduce Teil 2)
subtitle: "Eigentlich wollte ich ja fuer den Newstickerzaehler ein Servlet entwickeln, mit welchem man quasi interaktive die Hits des Tages abrufen kann, aber dann kam wieder alles ganz anders. Welcher praktische Nutzen hat jetzt MapReduce? Klassischer Fall fuer a&hellip;"
date: 2011-01-09
author: eumel8
---

<p>Eigentlich wollte ich ja fuer den Newstickerzaehler ein Servlet entwickeln, mit welchem man quasi interaktive die Hits des<br />Tages abrufen kann, aber dann kam wieder alles ganz anders. Welcher praktische Nutzen hat jetzt MapReduce?<br />Klassischer Fall fuer alle Statistiker: Logfileauswertung.<br />
<br/>
Man nehme ein klassisches Access-Logfile eines Apache-Webservers. Wenn man nur ein paar Tausend Zugriffe im<br />Monat hat, kommt man mit Awstats oder Webalizer wunderbar zurecht. Aber was passiert bei paar Million Zugriffe am<br />Tag? Richtig, da explodiert der Statistikrechner. Als Alibi fuer Unwissenheit kann man dann ein groesseren Rechner<br />bestellen. Wenn da nicht schon Rechner vorhanden waeren, deren Rechenleistung wegen geringfuegiger<br />Hauptbeschaeftigung die meiste Zeit brach liegt. Nutzen wir nun diese Zeit... Als erstes installieren wir einen Hadoop-<br />Cluster. Klingt wahnsinnig kompliziert, aber es beschraenkt sich auf Runterladen der Software und Durchlesen des<br />Howto auf http://hadoop.apache.org/common/docs/r0.20.2/cluster_setup.html.</p>
<p>In kurzen Schritten:</p>
<p>1. ssh-Verbindung zwischen Master und Nodes herstellen (am besten als User "hadoop"</p>
<blockquote>
<p>$ useradd -m hadoop<br />$ su - hadoop<br />$ ssh-keygen -t dsa -P '' -f ~/.ssh/id_dsa<br />$ cat ~/.ssh/id_dsa.pub >> ~/.ssh/authorized_keys<br />$ scp -r ~/.ssh hdp-cl02:~/<br />$ scp -r ~/.ssh hdp-cl03:~/<br />$ scp -r ~/.ssh hdp-cl04:~/<br /><br /></p>
</blockquote>
<p><span class="codefrag"><br /></span></p>
<p>2. Auf dem Master Java und Hadoop installieren.</p>
<blockquote>
<p>zypper install java-1_6_0-sun</p>
<p>java -version<br />java version "1.6.0_22"<br />Java(TM) SE Runtime Environment (build 1.6.0_22-b04)<br />Java HotSpot(TM) Client VM (build 17.1-b03, mixed mode)</p>
<p>wget "http://mirror.synyx.de/apache//hadoop/core/hadoop-0.20.2/hadoop-0.20.2.tar.gz"</p>
<p>tar xvfz hadoop-0.20.2.tar.gz</p>
</blockquote>
<p>3. Hadoop minimal konfigurieren conf/hadoop-env.sh</p>
<blockquote>
<p># export JAVA_HOME=/usr/java/jre1.6.0_20/</p>
<p>#export HADOOP_HOME=/home/hadoop/hadoop-0.20.0</p>
</blockquote>
<p>conf/core-site.xml</p>
<pre><?xml version="1.0"?><br /><?xml-stylesheet type="text/xsl" href="configuration.xsl"?><br /><configuration><br /><property><br /><name>fs.default.name</name><br /><value>hdfs://hdp-cl01:54310</value><br /><description>The name of the default file system. A URI whose<br />scheme and authority determine the FileSystem implementation. The<br />uri's scheme determines the config property (fs.SCHEME.impl) naming<br />the FileSystem implementation class. The uri's authority is used to<br />determine the host, port, etc. for a filesystem.</description><br /></property><br /></configuration></pre>
<p>conf/hdfs-site.xml</p>
<pre><br /><?xml version="1.0"?><br /><?xml-stylesheet type="text/xsl" href="configuration.xsl"?><br /><configuration><br /><property><br /><name>dfs.replication</name><br /><value>2</value><br /><description>Default block replication.<br />The actual number of replications can be specified when the file is created.<br />The default is used if replication is not specified in create time.<br /></description><br /></property><br /><property><br /><name>dfs.name.dir</name><br /><value>/tmp/hadoop-root</value><br /></property><br /><property><br /><name>dfs.data.dir</name><br /><value>/tmp/hadoop-data</value><br /></property><br /></configuration><br />conf/mapred-site.xml<br /><?xml version="1.0"?><br /><?xml-stylesheet type="text/xsl" href="configuration.xsl"?><br /><configuration><br /><property><br /><name>mapred.job.tracker</name><br /><value>hdp-cl01:54311</value><br /><description>The host and port that the MapReduce job tracker runs<br />at. If "local", then jobs are run in-process as a single map<br />and reduce task.<br /></description><br /></property><br /><property><br /><name>mapred.system.dir</name><br /><value>/usr/local/shadoop</value><br /></property><br /><property><br /><name>mapred.local.dir</name><br /><value>/tmp</value><br /></property><br /><property><br /><name>mapred.map.tasks</name><br /><value>40</value><br /></property><br /><property><br /><name>mapred.reduce.tasks</name><br /><value>8</value><br /></property><br /></configuration></pre>
<p>conf/masters</p>
<pre>hdp-cl01</pre>
<p>conf/slaves</p>
<pre>hdp-cl01<br />hdp-cl02<br />hdp-cl03<br />hdp-cl04</pre>
<p>Entscheidend ist der letzte Config-Eintrag, der dem Cluster sagt, wer ueberhaupt alles am Dreh beteiligt ist.</p>
<p>4. Hadoop auf Nodes verteilen</p>
<p>5. Auf Nodes Java installieren Fertig.</p>
<p>6. Vom Master aus Datanodes starten:</p>
<blockquote>
<p>bin/start-dfs.sh</p>
</blockquote>
<p>7. Vom Master Jobtracker starten:</p>
<blockquote>
<p>bin/start-mapred.sh</p>
</blockquote>
<p>Es sollte sowas im Output zu lesen sein, dass die erwarteten Dinge auch<br />geschehen sind (starting datanode/ starting jobtracker)</p>
<p>8. Cluster mit Daten betanken:<br /><br /></p>
<blockquote>bin/hadoop fs -mkdir files<br />bin/hadoop fs -copyFromLocal /var/log/apache2/access_log files<br />bin/hadoop fs -ls files<br /></blockquote>
<p><br />9. WordCount.java anpassen. Da dort nur stumpf nach Woertern gesucht wird, muss man die gewuenschten<br />Informationen aus dem Logfile rauspiepeln. Dazu habe ich mir die Java-Klasse Stringtokenizer rausgesucht:<br /><br /></p>
<p> </p>
<p>Wenn man auf ISO-Logformat umgestellt hat, sieht die ganze Klasse etwa so aus, wenn man nach Webzugriffen sucht:</p>
<pre>package org.myorg;<br />import java.io.IOException;<br />import java.util.*;<br />import org.apache.hadoop.fs.Path;<br />import org.apache.hadoop.conf.*;<br />import org.apache.hadoop.io.*;<br />import org.apache.hadoop.mapred.*;<br />import org.apache.hadoop.util.*;<br />public class WordCount2 {<br />public static class Map extends MapReduceBase implements Mapper<LongWritable,<br />Text, Text, IntWritable> {<br />private final static IntWritable one = new IntWritable(1);<br />private Text word = new Text();<br />public void map(LongWritable key, Text value,<br />OutputCollector<Text, IntWritable> output, Reporter reporter) throws IOException {<br />String line = value.toString();<br />StringTokenizer tokenizer = new StringTokenizer(line);<br />tokenizer.nextToken("]");<br />tokenizer.nextToken("\"");<br />tokenizer.nextToken(" ");<br />word.set(tokenizer.nextToken());<br />output.collect(word,one);<br />}<br />}<br />public static class Reduce extends MapReduceBase implements Reducer<Text,<br />IntWritable, Text, IntWritable> {<br />public void reduce(Text key, Iterator<IntWritable> values,<br />OutputCollector<Text, IntWritable> output, Reporter reporter) throws IOException {<br />int sum = 0;<br />while (values.hasNext()) {<br />sum += values.next().get();<br />}<br />// weniger als 100 Zugriffe wollen wir nicht sehen<br />if (sum > 100) {<br />output.collect(key,new IntWritable(sum));<br />}<br />}<br />}<br />public static void main(String[] args) throws Exception {<br />JobConf conf = new JobConf(WordCount2.class);<br />conf.setJobName("wordcount");<br />conf.setOutputKeyClass(Text.class);<br />conf.setOutputValueClass(IntWritable.class);<br />conf.setMapperClass(Map.class);<br />conf.setCombinerClass(Reduce.class);<br />conf.setReducerClass(Reduce.class);<br />conf.setInputFormat(TextInputFormat.class);<br />conf.setOutputFormat(TextOutputFormat.class);<br />FileInputFormat.setInputPaths(conf, new Path(args[0]));<br />FileOutputFormat.setOutputPath(conf, new Path(args[1]));<br />JobClient.runJob(conf);<br />}<br />}<br /></pre>
<p>Man koennte natuerlich auch nach Hits nach IP-Adresse suchen oder so. Dann bedarf es bloss einer Umstellung des</p>
<p>StringTokenizers. Da muss man vielleicht ein wenig basteln.<br /><br />9. Kompilieren und Packen der Klasse: <br /><br /></p>
<blockquote>javac -cp hadoop-0.20.2-core.jar -d wordcount_classes WordCount2.java<br />jar -cvf wordcount2.jar -C wordcount_classes/ .<br /></blockquote>
<p><br />10. Starten des Jobs: <br /><br /></p>
<blockquote>bin/hadoop jar wordcount2.jar org.myorg.WordCount2 input output</blockquote>
<p><br />input und output sind die Ein- und Ausgabe-Verzeichnisse des Jobs. <br /><br />Sie befinden sich bei der Standalone-Installaton lokal auf dem Rechner und beim <br /><br />Cluster-Setup im HDFS. Ich muss also vor dem Starten und nach dem Joblauf die <br /><br />Daten jeweils aus dem Cluster hoch- und runterladen (siehe oben!). <br /><br />Ueber ein Servlet oder eine jsp koennen wir den Output im Web ansehen: <br /><br />http://www.eumelnet.de:8080/cloud/logserv.jsp<br /><br /><br /><br />Ergebnisse der Aufgabe: Zeige die Webzugriffe des letzten Monats auf <br /><br />www.eumel.de mit mehr als 100 Hits:</p>
<p> </p>
<pre>String file = application.getRealPath("/") + "part-00002";<br />BufferedReader br = new BufferedReader(new FileReader( file));<br />String zeile;<br />ArrayList<String> Stuff = new ArrayList<String>();<br />AlphanumComparator ac = new AlphanumComparator();<br />while ((zeile = br.readLine()) != null) {<br />String [] splitupText = zeile.split("\t");<br />String a1 = splitupText[1] + " : " + splitupText[0];<br />Stuff.add(a1);<br />}<br />Collections.sort(Stuff, ac);<br />Collections.reverse(Stuff);<br />for(int j=0; j < Stuff.size(); j++) {<br />out.println(Stuff.get(j));<br />out.println("<br>");<br />}</pre>
<p><br /><br /><br />Links:<br />- <a href="http://www.cs.brandeis.edu/~cs147a/lab/hadoop-troubleshooting/" target="_blank">Hadoop-Troubleshooting</a><br />- <a href="http://www.michael-noll.com/wiki/Running_Hadoop_On_Ubuntu_Linux_(Multi-Node_Cluster)" target="_blank">Just Another Cluster Config</a><br />- <a href="http://www.java2s.com/Code/Java/Regular-Expressions/ParseanApachelogfilewithStringTokenizer.htm">StringTokenizer.class</a><br /><br /></p>
