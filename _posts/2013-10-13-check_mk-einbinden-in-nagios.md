---
layout: post
tag: general
title: check_mk einbinden in Nagios
subtitle: "Eine der grossen Ansprueche der (Computer)-Neuzeit ist der Anspruch, sich um nichts mehr kuemmern zu muessen. Alles so automatisch passieren und der Computer soll die Arbeit erleichtern. Daraus ist dann das Cloud Computing entstanden."
date: 2013-10-13
author: eumel8
---

Eine der grossen Ansprueche der (Computer)-Neuzeit ist der Anspruch, sich um nichts mehr kuemmern zu muessen. Alles so automatisch passieren und der Computer soll die Arbeit erleichtern. Daraus ist dann das Cloud Computing entstanden. Auch das Monitoring meiner Dienste soll sich am liebsten von selbst etablieren, ohne dass der Nutzer gross drueber nachdenken muss. Den Anspruch gerecht werde moechte check_mk...
<br/>
<a href="http://mathias-kettner.de/index.html">check_mk</a> praesentiert sich als komplette IT-Monitoring-Loesung mit eigener GUI. Naja, eigentlich ist es ein Derivat von Nagios und ich will bloss check_mk in ein bestehendes Nagios/Icinga einbinden, um die in check_mk eingebaute Inventory-Loesung zu benutzen. Damit wird der hauseigene Rechner nach zu ueberwachenden Services untersucht und eine passende Nagios-Konfiguration dafuer erstellt. 
Damit das alles so klappt, brauchen wir fuer unsere OpenSuse-12.1-Installation check_mk-agent-1.2.0p3-18.2.i586.rpm und check_mk-1.2.0p3-18.2.i586.rpm.

```bash
# rpm -Uhv check_mk-agent-1.2.0p3-18.2.i586.rpm
# rpm -Uhv check_mk-1.2.0p3-18.2.i586.rpm
```

Der check_mk agent hat sich eingnistet unter /etc/xinetd.d/check_mk und lauscht auf Port 6556. 
In der Konfiguration kann man den Agent enablen (sinnvoll!) und den Zugriff auf bestimmte Netze einschraenken. Ausserdem bedarf es des xinetd, der gewoehnlich installiert ist und gestartet sein sollte.

Das Hauptprogramm selber brauchen wir bloss zum inventarisieren. Die passende Konfiguration ist zu finden unter /etc/check_mk/main.mk. Dort muessen wir ein paar Eintraege taetigen:

```
all_hosts = [ 'monitor.test.local' ]
generate_hostconf = False
nagios_command_pipe_path = "/var/lib/icinga/rw/icinga.cmd"
check_submission = "pipe"
```

<p></p>
Wir geben die Adresse unseres Monitoring-Hosts an. Wir koennten auch localhost nehmen, aber dann werden alle Checks mit diesem Hostnamen generiert. Da die bestehende Nagios-Konfiguration nur erweitert werden soll, brauch keine Host-Config erstellt werden. Die anderen Checks sind alles passive_checks in Nagios. Demnach muss das entsprechende Feature aktiviert sein. Von check_mk werden nur sogenannte Pseudo-Checks in der Config erstellt, z.B.:

```
define command {
 command_name check_mk-mounts
 command_line echo "ERROR - you did an active check on this service - please disable active checks" && exit 1
}
```

<p></p>
Die tatsaechlichen Checks finden ueber die Command-Pipe von Nagios statt. Deswegen ist es wichtig, diese in der check_mk config mit anzugeben. 

Danach starten wir von der Kommandozeile das Inventory:

```bash
cmk -I
```

Mit entsprechendem OK-Status wird suggeriert, dass eine installierte Nagios/Icinga-Konfiguration gefunden wurde und check_mk auf Basis dessen eine Konfiguration und fuer den Rechner ein Inventory erstellt.

Jetzt wird die Nagios-Config geschrieben:

```bash
cmk -R
```

Der Speicherort variiert von /etc/nagios/conf.d bis /etc/icinga/conf.d. check_mk prueft aber nicht, ob dieses Verzeichnis in Nagios/Icinga tatsaechlich eingebunden ist - eine Kontrolle kann also nicht schaden.
