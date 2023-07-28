---
layout: post
tag: general
title: openSUSE 12 - Default Runlevel
subtitle: "Frueher war alles besser, es bewahrheitet sich gerade mal wieder. Wir aendern das Default Runlevel unseres Suse Servers:n# grep initdefault: /etc/inittab id:3:initdefault:"
date: 2013-05-03
author: eumel8
---

<p>Frueher war alles besser, es bewahrheitet sich gerade mal wieder. Wir aendern das Default Runlevel unseres Suse Servers:</p>
<br/>

```
grep initdefault: /etc/inittab 
id:3:initdefault: 
</code></pre><!-- /codeblock -->
<p>Runlevel 3, kein X, alles super, alles schnieke. Von wegen:</p>
<!-- codeblock lang="" line="1" --><pre><code>
runlevel
N 5 
```
<p>Die Ursache liegt in der neuen systemd Architektur, die Suse verwendet. Das Runlevel wird jetzt durch einen Symlink festgelegt:</p>

```
ls -l /etc/systemd/system/default.target 
lrwxrwxrwx 1 root root 36 May 10 2012 /etc/systemd/system/default.target &amp;gt; /lib/systemd/system/runlevel5.target 
```

<p>Einfach ersetzen durch:</p>

```
rm /etc/systemd/system/default.target 
ln -s /lib/systemd/system/runlevel3.target /etc/systemd/system/default.target 
reboot
```
<p>Warum einfach, wenn es auch kompliziert geht.</p>
