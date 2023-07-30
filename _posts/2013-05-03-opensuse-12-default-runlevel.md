---
layout: post
tag: general
title: openSUSE 12 - Default Runlevel
subtitle: "Frueher war alles besser, es bewahrheitet sich gerade mal wieder. Wir aendern das Default Runlevel unseres Suse Servers"
date: 2013-05-03
author: eumel8
---

<p>Frueher war alles besser, es bewahrheitet sich gerade mal wieder. Wir aendern das Default Runlevel unseres Suse Servers:</p>
<br/>

```bash
grep initdefault: /etc/inittab 
id:3:initdefault: 
```

<p>Runlevel 3, kein X, alles super, alles schnieke. Von wegen:</p>

```bash
runlevel
N 5 
```
<p>Die Ursache liegt in der neuen systemd Architektur, die Suse verwendet. Das Runlevel wird jetzt durch einen Symlink festgelegt:</p>

```bash
ls -l /etc/systemd/system/default.target 
lrwxrwxrwx 1 root root 36 May 10 2012 /etc/systemd/system/default.target &gt; /lib/systemd/system/runlevel5.target 
```

<p>Einfach ersetzen durch:</p>

```bash
rm /etc/systemd/system/default.target 
ln -s /lib/systemd/system/runlevel3.target /etc/systemd/system/default.target 
reboot
```

<p>Warum einfach, wenn es auch kompliziert geht.</p>
