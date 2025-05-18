---
layout: post
tag: general
title: Windows Backup mit Restic
subtitle: "Backups sind unter Windows immer noch ein Trauerspiel - Windows 10, wie Windows 11. Dabei sind Backups doch so wichtig!"
date: 2022-06-12
author: eumel8
---

Backups sind unter Windows immer noch ein Trauerspiel - Windows 10, wie Windows 11. Dabei sind Backups doch so wichtig! 
<br/>
Die von Windows mitgelieferte Methode zur Datensicherung ist eher etwas zum Abgewoehnen. Am liebsten soll man OneDrive benutzen, um all seine Daten in die Cloud zu laden. Fuer Bilder und Dokumente mag das noch gehen, aber den ganzen Rechner? Das geht mir doch etwas zu weit.
Die lokale Datensicherung brauch eine separate Festplatte - die muss dann ein paar TB gross sein und zum Backup immer angeschlossen werden. Unpraktisch. Ueber NAS ist das Backup ultralangsam (WD MyCloud). Im Prinzip werden dort alle Daten ueber eine HTTP-Schnittstelle (API) auf das NAS geladen, kann man machen, muss aber nicht.
Bei Software von Drittanbietern hatte ich immer Pech. Lange Zeit war Acronis im Einsatz. Das war aber auch unzuverlaessig und wollte dann auch alles in die Cloud speichern. Dann gabs Minitools Shadowmaker. Das konnte sogar Backups verschluesseln, hat aber manchmal Backupsets "vergessen". Ausserdem war die GUI immer groesser als der Bildschirm. Der wichtigste Button "Apply" liess sich nur mit Bildschirmskalierung erreichen. Sehr nervig - vor allem, wenn die GUI eigentlich recht aufgeraeumt ist und wenige Buttons hat.
AOMEI Backuper konnte keine einzelnen Files zurueckspielen ... herrje! Dabei ist es keine Frage des Geldes. Fuer ein ordentliches Programm wuerde ich auch ordentlich bezahlen.
Bevor man jetzt in Go etwas selber programmiert, habe ich <a href="https://restic.net/">Restic</a> ausprobiert. Ein Command Line Tool, was in der Powershell zu bedienen ist. Man kann das WD MyCloud mit Netzwerklaufwerk einbinden, ein neues Backup mit Passwort initialisieren und dann werden einzelne Backupsets (Snapshots) angelegt. In einer internen Datenbank wird aehnlich wie im Git verglichen, welche Files schon gesichert sind und welche nicht. Das initiale Backup mag 6-8 Stunden dauern, das Delta ist deutlich kuerzer. Und so kann man es installieren:

```
New-SmbMapping -LocalPath 'T:' -RemotePath '\\MYCLOUD-16708\Public'
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
scoop install restic
[Environment]::SetEnvironmentVariable('RESTIC_PASSWORD','A12345678+')
restic init --repo T:\Backup\restic mycloud
restic -r T:\Backup\restic --verbose backup C:\
```

Backups listen:

```
restic -r T:\Backup\restic snapshots
repository 220c4fde opened successfully, password is correct
ID Time Host Tags Paths
-----------------------------------------------------------------
e2373fb1 2022-06-17 09:26:19 LAPTOP-A65JAK0U C:\
48061035 2022-06-17 21:31:44 LAPTOP-A65JAK0U C:\
-----------------------------------------------------------------
2 snapshots
```

Restore einer einzelnen Datei von einem bestimmten Snapshot auf ein neues Ziel:

```
restic -r T:\Backup\restic restore 48061035 -t T:\Backup\restore -i "/C/Users/user/Documents/migrationsplan.pdf"
```

Restore eines ganzen Ordners:

```
restic -r T:\Backup\restic restore 48061035 -t C:\Users\user\restore -i "/C/Users/user/"
```

Dokumentation: https://restic.readthedocs.io/

Noch zwei sinnvolle Programme mit graphischer Benutzeroberfläche für Windows, Linux und Mac:

Resticguugx: [Release Downloads](https://gitlab.com/stormking/resticguigx/-/releases)
Resticbrowser: [Release Downloads](https://github.com/emuell/restic-browser/releases)
