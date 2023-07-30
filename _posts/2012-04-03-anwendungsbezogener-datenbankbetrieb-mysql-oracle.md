---
layout: post
tag: general
title: Anwendungsbezogener Datenbankbetrieb MySQL & Oracle
subtitle: "Im anwendungsbezogenen Datenbankbetrieb ist es wie mit dem Auto: Man weiss zwar, dass es ein Getriebe und einen Motor gibt, aber als Fahrer interessiert nur das Ziel und die Bedienung von Schaltern und Knoepfen. nnAnbei einige Zaubersprueche zur Bedie&hellip;"
date: 2012-04-03
author: eumel8
---

Im anwendungsbezogenen Datenbankbetrieb ist es wie mit dem Auto: Man weiss zwar, dass es ein Getriebe und einen Motor gibt, aber als Fahrer interessiert nur das Ziel und die Bedienung von Schaltern und Knoepfen. Anbei einige Zaubersprueche zur Bedienung einer Oracle- oder MySQL-Datenbank:
<br/>
<strong>Exportiere und Importiere Daten</strong> <strong>Datenbank mit Inhalt exportieren</strong>
<em>**MySQL**</em>
<pre> # mysqldump database > database.dmp </pre>
<em> **Oracle**</em> 
<pre># exp userid=\'sys/manager as sysdba\' \ 
file=database_exp.dmp \ 
log=database_exp.log \ 
compress=no \ 
owner=mailadm \ 
statistics=none \ 
rows=yes 
</pre>
full database
<pre> 
# exp userid=\'sys/manager as sysdba\' \ 
file=full_exp.dmp \ 
log=full_exp.log \ 
compress=no \ 
full=yes \ 
statistics=none \ 
consistent=yes 
</pre> 
<strong>Datenbank ohne Inhalt exportieren</strong>
<em>**MySQL**</em> 
<pre># mysqldump -d database > database.dmp </pre>
<em>**Oracle**</em>
<pre> # exp userid=mailadm/mailadm \ 
file=database_exp.dmp \ 
log=datbase_exp.log \ 
compress=no \ 
owner=mailadm \ 
statistics=none \ 
rows=no 
</pre>
<strong>Datenbank imporieren</strong> 
<em>**MySQL**</em>
<pre> # mysqladmin create database </pre>
<pre># mysql database < database.dmp </pre>
<em>**Oracle**</em>
<pre> 
# imp userid=\'sys/manager as sysdba\' \ 
file=database_exp.dmp \ 
log=database_imp.log \ 
ignore=yes \ 
feedback=50 \ 
fromuser=mailadm \ 
touser=newsadm 
</pre>
full database
<pre> # imp userid=\'sys/manager as sysdba\' \ 
file=full_exp.dmp \ 
log=full_imp.log \ 
full=yes \ ignore=yes \ feedback=50 </pre>
<strong>Zeige alle laufenden Prozesse/Statements</strong>
<em>**MySQL**</em>
<pre> # mysql > SHOW PROCESSLIST; </pre>
<em> **Oracle**</em>
<pre> # sqlplus / as sysdba > SELECT sql_id,sql_text FROM v$sqlarea; </pre> 
waites 
<pre> > SELECT sw.sid sid , p.spid spid , s.username username , \
s.osuser osuser , sw.state state , sw.wait_time wait_time , \
s.machine machine , depre(sw.event,'db file sequential read', \
sw.p3, 'db file scattered read', sw.p3, NULL) blocks \
FROM v$session_wait sw , v$session s , v$process p \
WHERE s.paddr = p.addr AND sw.state != 'Idle' \
AND sw.sid = s.sid AND sw.wait_time > 0; </pre> 
<strong>Zeige alle Tabellen an</strong>
<em>**MySQL**</em>
<pre> # mysql SHOW TABLES; 
<em>**Oracle**</em>
# sqlplus / as sysdba <br />
SQL> SELECT TABLE_NAME FROM ALL_TABLES WHERE OWNER='MAILADM'
# sqlplus <br />
SQL>set pages 999 ; 
SQL>SELECT TABLE_NAME FROM USER_TABLES; 
# sqlplus 
SQL>set pages 999 ; 
SQL>SELECT TABLE_NAME FROM TABS; 
# sqlplus 
SQL> set pages 999 ; 
SQL>SELECT * FROM _TABLES; 
</pre>

<strong>Zeige vollstaendiges Datum von Datenfeldern</strong>
<em>**MySQL**</em> 
<pre> 
# mysql
SQL> SELECT logindate from logintable: 
</pre> 
<em>**Oracle**</em> 
<pre> 
# sqlplus 
SQL>SELECT to_char(logindate,'YYYY-MM-DD HH:MM:SS') FROM logintable; 
</pre>
