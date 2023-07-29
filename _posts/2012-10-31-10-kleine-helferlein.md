---
layout: post
tag: general
title: 10 kleine Helferlein
subtitle: "CHANGE MASTER TOn   MASTER_HOST='master2.mycompany.com',n   MASTER_USER='replication',n   MASTER_PASSWORD='bigs3cret',n   MASTER_PORT=3306,n   MASTER_LOG_FILE='master2-bin.001',n   MASTER_LOG_POS=4,n   MASTER_CONNECT_RETRY=10;nnnnnnmysql&gt&hellip;"
date: 2012-10-31
author: eumel8
---

<p>
Neue Liste: https://github.com/eumel8/10-kleine-helferlein/blob/main/README.md
</p>
<p>
Manche Shell-Einzeiler braucht man irgendwie immer wieder, egal in welche Tastatur man seine Finger steckt. Es wird Zeit, diese kleinen Helferlein mal aufzulisten.
</p>
<br/>

<strong>Bash</strong>

Finde alle Dateien in einem Verzeichnis und kopiere sie in ein anderes Verzeichnis. Alle Dateieigenschaften bleiben erhalten.

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
find . -depth | cpio -pvdm /new_data
</code></pre><!-- /codeblock -->

Ersetze einen String durch einen anderen in einer Datei (hier Zeilenendezeichen \r)

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
perl -p -i -e 's/\r//g' datei
</code></pre><!-- /codeblock -->

Dekodiere einen base64-String in einer Datei

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
perl -MMIME::Base64 -0777 -ne 'print decode_base64($_)' datei
</code></pre><!-- /codeblock -->

Fuehre nacheinander auf vielen Rechnern ein Kommando aus (z.B. "date")

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
for i in 51 52 53 61 62 63; do ssh root@192.168.0.$i "hostname; date";done
</code></pre><!-- /codeblock -->

Meine Loop-Devices sind alle.

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
#!/bin/bash
for i in {8..30};
do
/bin/mknod -m640 /dev/loop$i b 7 $i
/bin/chown root:disk /dev/loop$i
done
</code></pre><!-- /codeblock -->

rpm/deb cheats:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
Zu welchem Paket gehoert eine Datei:

# rpm -qif /path/to/file
# dpkg -S /path/to/file

Welche Dateien sind in einem installierten Paket:
# rpm -qil paket-name
# dpk -L paket-name

Abhaengigkeiten eines Pakets pruefen:
# rpm -qpR ./paket.rpm
# dpkg -I ./paket.deb

Abhaengigkeiten eines installierten Pakets pruefen:
# rpm -qR paket-name
# apt-cache depends
</code></pre><!-- /codeblock -->

Text aus Zwischenablage in vi einfuegen:
Manchmal gibt es haessliche Zeilenverschiebungen. Dagegen hilft ein

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
:set paste
</code></pre><!-- /codeblock -->

bash script debug mit Zeilennummer

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
PS4='Line ${LINENO}: ' bash -x script
</code></pre><!-- /codeblock -->

<strong>MySQL</strong>

Lege einen User an, vergebe ein Passwort und bestimmte Rechte

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
GRANT File, Process,suprt,replication client,select on *.* TO 'depl_mon'@'192.168.0.100' identified by 'poddfsdkfskflpr934r1';
</code></pre><!-- /codeblock -->

Widerufe die Rechte fuer einen Datenbankuser

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'hans'@'192.168.100.%'
</code></pre><!-- /codeblock -->

Replikation mit SQL-Shell einrichten

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
mysql&gt;
CHANGE MASTER TO
 MASTER_HOST='master2.mycompany.com',
 MASTER_USER='replication',
 MASTER_PASSWORD='bigs3cret',
 MASTER_PORT=3306,
 MASTER_LOG_FILE='master2-bin.001',
 MASTER_LOG_POS=4,
 MASTER_CONNECT_RETRY=10;
</code></pre><!-- /codeblock -->

MySQL-Replikation: Ueberspringe einen Fehlercounter (z.B. "Duplicate entry")

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
mysql&gt; slave stop; set global sql_slave_skip_counter=1; slave start ; show slave status\G
</code></pre><!-- /codeblock -->

Query-log einschalten:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
mysql> show global variables like '%general%';
+------------------+------------+
| Variable_name | Value |
+------------------+------------+
| general_log | OFF |
| general_log_file | mysqld.log |
+------------------+------------+

mysql> set global general_log = 1;
</code></pre><!-- /codeblock -->

Dump MySQL Datenbank

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
mysqldump --master-data --all-databases > /tmp/mysql.sql
</code></pre><!-- /codeblock -->

MySQl too many connection:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
mysql> select @@max_connections;

+-------------------+
| @@max_connections |
+-------------------+
| 151 |
+-------------------+
1 row in set (0.00 sec)

mysql> set global max_connections = 500;
</code></pre><!-- /codeblock -->

Anzahl Einttraege pro Tabelle anzeigen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
mysql> SELECT table_name, table_rows FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'my_schema' order by table_rows;
</code></pre><!-- /codeblock -->

<strong>Git</strong>

Git: Eine Datei in 2 Branches vergleichen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
git diff reference live -- modules/deploy/manifests/init.pp
</code></pre><!-- /codeblock -->

Git: Eine Datei aus einem anderen Branch in den aktuellen kopieren:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
git checkout reference -- modules/deploy/manifests/init.pp
</code></pre><!-- /codeblock -->

lokales git repo mit remote git repo syncen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
git remote add mygithub https://github.com/eumel8/ansible-otc
git pull mygithub master
git push
</code></pre><!-- /codeblock -->

<strong>OpenSSL</strong>

Openssl: SSL-Zertifikat anlegen (fuer apache, postfix usw.)

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
openssl req -new -x509 -days 730 -nodes -out hostname1.pem -keyout hostname1.pem
</code></pre><!-- /codeblock -->

SSL-Zertifkat angucken:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
openssl x509 -in eumelnetde.pem -noout -text
</code></pre><!-- /codeblock -->

Überprüfen, ob ein SSL-Zertifikat zum Key passt:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
openssl x509 -noout -modulus -in server.crt| openssl md5
openssl rsa -noout -modulus -in server.key| openssl md5

die checksum sollte gleich sein
</code></pre><!-- /codeblock -->

<strong>Docker</strong>

Loesche alle Docker Container

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
for i in `docker ps --all |awk '{print $1}'`;do docker rm --force $i;done
</code></pre><!-- /codeblock -->

Loesche alle Docker Images

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
for i in `docker images |awk '{print $3}'`;do docker image rm $i;done
</code></pre><!-- /codeblock -->

<strong>OpenStack</strong>

unbenutze volumes loeschen

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
for i in `openstack volume list --status available -f value| awk '{print $1}'`;do openstack volume delete $i;done
</code></pre><!-- /codeblock -->

bestimte Sorte VMs loeschen

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
for i in `openstack server list | grep k8s-00 | grep ranchermaster | awk '{print $2}'`;do openstack server delete $i;done
</code></pre><!-- /codeblock -->

<strong>Dies & Das</strong>

Virtuelle Konsole aufrufen mit virt-viewer

<!-- codeblock lang= line=1 --><pre class="codeblock"><code>
virt-viewer -c qemu+ssh://root@192.168.0.101/system test
</code></pre><!-- /codeblock -->

ZFS set automatic mountpoints (lxd story)

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
zfs get mountpoint lxd00/containers/dns
zfs set mountpoint=/var/lib/lxd/containers/dns.zfs lxd00/containers/dns
zfs mount lxd00/containers/jump
cd /var/lib/lxd/containers
ln -s /var/lib/lxd/containers/dns.zfs dns

used by rollback lxd 2.2 to 2.0
</code></pre><!-- /codeblock -->

test smtp connection with curl

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
curl -v smtp://out-cloud.mms.t-systems-service.com:25 --mail-from noreply@raseed.external.otc.telekomcloud.com --mail-rcpt f.kloeker@t-online.de --upload-file /etc/os-release
</code></pre><!-- /codeblock -->
