---
layout: post
tag: inet
title: Linux Ramdisk
subtitle: Geheimnisse der initrd
date: 2025-04-12
author: eumel8
twitter: 'images/blog-eumel-de.png?4362984378'
---

# Einstieg

Heute beschäfigen wir uns mal mit etwas völlig anderem als KI, Cloud und Kubernetes: Der Linux Ramdisk. Und damit fängt das Missverständnis gleich schon an. Was ist das? Zum einen kann es ein in Linux eingehangenes Dateisystem sein, welches sich im Ram-Speicher befindet. Zum anderen handelt es sich um den zweiten Teil, der beim Linux boot nach dem Laden des Kernel stattfindet. Hier geht es um letzteres.

# Linux Boot Prozess

<img src="/images/linux-boot.png" width="730" height="326"/>

Wenn man den Computer einschaltet, wird über BIOS oder UEFI die Hardware überprüft. Früher wurde dann mit einem knatternden Geräusch der Speicher hochgezählt. Das waren aber nur paar Kilobyte oder Megabyte, sowas macht man heute nicht mehr. Die Initialisierung der Hardware bleibt aber. Und es wird ein Bootloader gesucht, sei es von einer CD oder Festplatte.

Auf der Festplatte bedarf es einer bootfähigen Partition, die kann man bei `fdisk` entsprechend markieren. Bootloader wie Grub oder Lilo bieten auch ein Auswahlmenü, falls man unterschiedliche Betriebssysteme installiert hat und die booten möchte.

Bei Linux, oder auch allen anderen Unix-Arten, wird der Kernel in den Arbeitsspeicher geladen. Das ist eine einzelne Datei, die die Sprache vom Betriebssystem in Maschinensprache übersetzen kann. Der Kernel spricht alle Peripheriegeräte an wie Festplatte, Monitor usw. und kontrolliert quasi das System. Und damit wir dann später Programme starten können, die Ram-Speicher und CPU benötigen, verwaltet er auch diese Resourcen und teilt Rechenzeit und Resourcen den einzelnen Prozessen zu.

Ram-Disk initialisieren. Diese Datei heisst meist initrd und wird vom Bootloader mit geladen. Es handelt sich um ein Minimalsystem, was eine temporäre root-Dateisystem-Struktur in den Ram-Speicher lädt, damit dann das "echte" Root-Dateisystem eingebunden werden kann.

Root-Dateisystem mounten: Das ist das endgültige Dateisystem vom Betriebssystem mit Benutzern und Programmen.

Init-System starten. Das Programm hiess jahrelang wirklich `init` oder `initd`, heute wird `systemd` verwendet, um als eine Art Task-Manager weitere Programme zu starten und deren Status zu überwachen.

Login: Eines der vom `init` gestarteten Programme kann etwa `login` sein, damit sich der Benutzer im System einloggen kann.

# Grub Bootloader

Grub kommt mittlerweile mit einer Standardkonfiguration daher, dass man ihn gar nicht mehr sieht. Standardmässig wird meist sowieso nur ein Betriebsystem geladen, wozu den Anwender mit mehr Output verunsichern. Um Grub wieder sichtbar zu machen, müssen wir ein paar Einstellungen ändern

```
# /etc/default/grub
GRUB_DEFAULT=0
#GRUB_TIMEOUT_STYLE=hidden
GRUB_TIMEOUT=10
GRUB_DISABLE_OS_PROBER=true
GRUB_TERMINAL=console
```

Danach `update-grub` aufrufen, um die Änderungen in die Bootpartion zu schreiben. Voraussetzung: grub ist installiert und wird schon als Bootloader verwendet.

Zur Erklärung: Durch Auskommentieren von `GRUB_TIMEOUT_STYLE` sehen wir überhaupt wieder den Loader beim Booten. Und zwar 10 Sekunden lang. Standardmässig wird Menu 1 geladen. Wir lassen noch nach anderen Betriebsystmen mit `GRUB_DISABLE_OS_PROBER` suchen und die Ausgabe soll im Text-Mode auf der Konsole erfolgen.

In `/etc/grub.d/` sind weitere Teile des Grub-Bootloaders als Dateien hinterlegt. Wir können hier in einer eigenen Datei das Boot-Menue erstellen/erweitern:

```
 /etc/grub.d/40_custom
root@ubuntu:~# cat /etc/grub.d/40_custom
#!/bin/sh
exec tail -n +3 $0
# This file provides an easy way to add custom menu entries.  Simply type the
# menu entries you want to add after this comment.  Be careful not to change
# the 'exec tail' line above.
#
#
menuentry "Ubuntu normal" --class ubuntu --class gnu-linux --class gnu --class os {
    recordfail
    load_video
    gfxmode text
    insmod gzio
    insmod lzopio
    insmod part_gpt
    insmod ext2
    #search --no-floppy --fs-uuid --set=root 8c9761a8-11ea-4a0b-98cf-8effbcf3ac00
    set root=(hd0,gpt2)
    linux /vmlinuz root=/dev/mapper/ubuntu--vg-ubuntu--lv ro
    initrd /initrd.img
}
menuentry "My Mini IPA " {
    linux /my-vmlinuz--generic console=tty0 console=ttyS0 debug
    initrd /initramfs-ubuntu.xz
}
```

Zu Beachten ist hier, dass die Dateien unter /boot liegen, aber in der Konfiguration direkt unter `/` angesprochen werden. Das hängt mit den Bootphasen wie weiter oben beschrieben zusammen. Gebootet wird unter `/boot`, dann wechselt der Bootloader zu `/`, um das eigentliche Betriebssystem zu laden.

Die `console` Parameter sind nicht unbedingt notwendig, genauso wie das `debug`. Als `linux` Kernel kann man einen üblichen Linux-Kernel nehmen, sofern man keine spezielle Anforderungen an die Hardware oder Umgebung hat. `initrd` ist die Datei zur Ram-Disk.

Und gleich noch eine Einschränkung: Bei meinen Tests kam es sehr häufig zur Kernel-Panik, weil die Initrd mehr Speicher benötigt als standardmässig vorgesehen ist (meist 512MB). Die Fehlermeldung ist meist nichtssagend, mit mehr Memory funktionierts dann. Grub hat hier noch Konfigurationsmöglichkeiten:


```
linux /my-vmlinuz--generic ro quiet splash mem=1024M
```

Der Memory wird auf 1024M erhöht. Andere Parameter sind noch `ro` für read-only Laden der Root-Partition, `splash` für Splash-Screen, `quiet`, um Boot-Meldungen zu unterdrücken.

Mehr Paratemeter sind noch `single` für Single-Usermode. Und, was wir früher immer machten, wenn wir das root-Passwort vergessen haben: `init=/bin/bash`. Damit wird der init-Prozess überschrieben und man landet am Systemprompt des Betriebssystems. Dort kann man dann das Zielsystem read-write Mounten und das root-Passwort neu setzen.

Eine andere Methode ist dazu auch `recovery`. Dadurch wird der systemd (als erster Prozess vom Booten) im Recovery-Mode gestartet, um Dinge zu reparieren, oder eben das root-Passwort neu zu setzen.


# Debootstrap

[Debootstrap](https://wiki.debian.org/Debootstrap) ist ein Programm von Debian, um von Debian-verwandten Distributionen, wie etwa Ubuntu, neue Betriebsystemumgebungen zu erstellen. Klingt total wissenschaftlich, letztlich ist es nur ein Shell-Script, welches mit verschiedenen Profilen wie `noble`, `jammy`, `focal` gefüttern wird und je nach Besonderheiten der jeweiligen Version arbei... ach, schauen wir uns das einfach an:

```bash
debootstrap --variant=minbase --arch amd64 --merged-usr --components=main,universe,multiverse --include=busybox-static,klibc-utils oracular ubuntu-root http://de.archive.ubuntu.com/ubuntu
```

Bedeutet: Eine Minimalversion von Ubuntu 24.10 (oracular) wird in das Verzeichnis `ubuntu-root` kopiert.
Es ist eine 64-bit-Version, alle apt-Sources werden konfiguriert, und wir wollen auf jeden Fall die Pakete busybox-static und klibc-utils für das init-Kommando. 

Jetzt könnte man noch ein eigenes init-Script erstellen:

```bash
#!/bin/sh
mkdir /proc /sys
mount -t proc none /proc
mount -t sysfs none /sys
echo "root:root" | chpasswd
exec login
```

Kopiere diese als `init` ebenfalls nach `ubuntu-root`, wechsel in das Verzeichnis und mache ein:

```
find . | cpio -H newc -o | xz -9e > ../initrds.cxz
```

und wäre auch schon fertig.  Statt `xz` kann (oder muss) man manchmal einen anderen Packer verwenden:

```
find . | cpio -H newc -o | pigz -9 > ../initrds.cxz
```

Das sollte jetzt schon tun. Man installiere `qemu-utils` und kann testen:

```
qemu-system-x86_64 -m 4096 -kernel /boot/vmlinuz -initrd ../initrd.cxz -nographic -append "console=tty0 console=ttyS0"
```

ALs exec-Kommando haben wir den Login-Promot gewählt. Wenn dieser erscheint, kann man sich mit dem tollen selbst erstellten root-Passwort einloggen. Alternativ hätte man statt `exec login` auch einfach `exec bash` verwenden können.

Beenden kann man qemu übrigens mit `<ctrl><shift><a>`.

# rootfs in ramdisk

Als Rettungs-System war unsere erste initrd sicher nicht schlecht. Aber wahrscheinlich wollen wir noch mehr Sachen installieren und konfigurieren. Dazu erstellen wir am besten ein weiteres Install-script:

```bash
# install.sh
mounts() {
    echo "Mounting proc and sys"
    if ! mountpoint -q /proc; then
        mount -t proc none /proc
    fi
    if ! mountpoint -q /sys; then
        mount -t sysfs none /sys
    fi
    if ! mountpoint -q /dev/pts; then
        mount -t devpts none /dev/pts
    fi
}

apt_pre_inst() {
    echo "Running apt update and installing essentials"
    apt -qq -y update
    apt -qq -y install vim-tiny locales tzdata
    #apt -qq -y install vim-tiny locales console-setup tzdata

    echo "Setting locale and timezone"
    echo 'LC_ALL="de_DE.UTF-8"' > /etc/default/locale
    locale-gen de_DE.UTF-8
    echo "Europe/Berlin" > /etc/timezone
    export LC_ALL="de_DE.UTF-8"
    dpkg-reconfigure -f noninteractive tzdata
    dpkg-reconfigure --frontend=noninteractive locales
}

apt_inst() {
    echo "Installing packages"
    DEBIAN_FRONTEND=noninteractive apt -y install --no-install-recommends \
        busybox-static cpio curl dbus dmidecode \
        ethtool fio gcc gnupg2 gpgv hdparm ifupdown \
        ipmitool iptables klibc-utils less libuuid1 lldpad lsb-release \
        lshw mdadm mstflint mtr nvme-cli psmisc \
        python3-dev python3-jinja2 python3-pip python3.12-venv  \
        sudo ssh systemd tcpdump tgt \
        uuid-runtime
}

init_inst() {
    echo "Creating init script"
    cat > /init <<EOF
#!/bin/sh
set -e
mkdir /proc
mkdir /sys
mount -t proc none /proc
mount -t sysfs none /sys
#echo "root:root" | chpasswd
#exec login
mkdir /newroot
MEMSIZE=$(free | grep 'Mem:' | awk '{ print $2 }')
mount -t tmpfs -o size=${MEMSIZE}k,mode=0755 tmpfs /newroot
cd /newroot
echo unpacking rootfs...
unxz - < ../rootfs.cxz | cpio -i
umount /proc
echo running /sbin/init...
#exec /busybox sh
exec /bin/run-init . /sbin/init < ./dev/console > ./dev/console
EOF
    chmod +x /init
}

main() {
    mounts || {
        echo -e "\033[31mExiting due to mounts failure\033[0m"
        exit 1
    }
    apt_pre_inst || {
        echo -e "\033[31mExiting due to app_rep_inst failure\033[0m"
        exit 1
    }
    apt_inst || {
        echo -e "\033[31mExiting due to app_inst failure\033[0m"
        exit 1
    }
    inst_init || {
        echo -e "\033[31mExiting due to inst_init failure\033[0m"
        exit 1
    }
}

main
echo -e "\033[32mOK\033[0m"
```

Dann kopieren wir das nach `ubuntu-root`, wechseln mit chroot in das Verzeichnis und führen es aus:

```bash
cp ../install.sh ubuntu-root
mkdir -p bin usr/lib
chroot ubuntu-root /install.sh || exit 1
```

Das Problem ist, dass die initrd zu gross wird und dann nicht mehr in die /boot-Partition passt. Infolgedessen: Kernel panic beim Booten. Andererseits: fehlt eine Datei oder lässt sich etwas nicht ausführen: Kernel panic beim Booten. Es gibt hier keinen Abfangmechanismus.

Die Lösung dazu lautet, dass gepackte zip-File von oben nochmal in ein Minimalsystem einzupacken. Dieses "Betriebssystem" brauch bloss die `busybox` und `run-init`. Letztere brauch noch eine lib. Diese 3 Dateien kopieren wir ein Verzeichnis weiter nach oben:

```bash
mkdir -p bin usr/lib
cp ubuntu-root/bin/busybox bin/ || exit 1
cp ubuntu-root/usr/lib/klibc/bin/run-init bin/ || exit 1
cp ubuntu-root/lib/klibc-* usr/lib/ || exit 1
```

Jetzt erweitern wir den Funktionsumfang mit Befehlen aus der busybox:

```bash
for util in awk cpio free grep gunzip ls mkdir mount rm sh umount ; do
    ln bin/busybox bin/"$util"
done
```

Fertig. Jetzt nur noch das init-Shellscript aus der ubuntu-root nach oben verschieben, den ganzen Kram löschen, nachem wir iihn bepackt haben und nochmal einpacken:

```bash
cd ubuntu-root
find . | cpio -H newc -o | xz -9e > ../rootfs.cxz || exit 1
cd ..
mv ubuntu-root/init .
rm -rf ubuntu-root
find . | cpio -H newc -o | pigz -9 > ../initrd.cxz || exit 1
```

Jetzt kann man wieder mit `qemu` testen. Es sollte das Minimalsystem aus initrd gestartet werden, dieses mounted /proc und /sys, erstellt eine Ramdisk, ein aus dem Speicher eingehängtes Dateisystem (sik!), entpackt das rootfs.cxz dahin und ruft init auf. Unser Sytem ist fertig gebootet.

# IPA - Ironic Python Agent

Wozu der viele Aufwand? Weil man mit kleinen Dingen etwas Grosses vorhat. Etwa mit OpenStack Ironic einen Server booten, um den dann mit einem richtigen Betriebssystem zu bestücken, etwa über Metal3. Dazu muss man den Server in Ironic registrieren. Dies erreicht man mit dem [Ironic Python Agent](https://docs.openstack.org/ironic-python-agent). Das Projekt stellt je OpenStack Release in [diesem](https://tarballs.opendev.org/openstack/ironic-python-agent/) interessantem Repo eine zusammengepackte Version der Software bereit, die aus einer Ramdisk und einem Kernel besteht. Alles schon fertig eingerichtet. Für die neueste OpenStack Version ist [tinyipa-stable-2024.2.gz](https://tarballs.opendev.org/openstack/ironic-python-agent/tinyipa/files/tinyipa-stable-2024.2.gz) die Ramdisk und [tinyipa-stable-2024.2.vmlinuz](https://tarballs.opendev.org/openstack/ironic-python-agent/tinyipa/files/tinyipa-stable-2024.2.vmlinuz) der dazugehörige Kernel. 

Das Betriebssystem besteht aus [TinyCore](http://tinycorelinux.net/). Die Webseite macht zwar nicht viel her, dennoch ist das Projekt gepflegt und gibt einmal im Jahr ein neues Release heraus. Für den Produktinseinsatz mag das freillig nicht reichen, deswegen ist TinyIPA auch für Entwicklung und Tests deklariert und für Prod gibt es CentOS-Pakete im selben Repo. Die sind allerdings auch knapp 500MB gross.

Bleiben wir beim TinyIPA und schauen uns die Verwendung an. Einsetzen kann man es sofort, es ist erstaunlich viel Software in dem kleinen Ding. Aber wie geht das, wenn wir etwas erweitern? Etwa FRR für dynamischen Routingdienst? Dann müssen wir TinyIPA runterladen, auspacken, erweitern und wieder einpacken. Los gehts:

```
#!/bin/sh
echo "starting rootfs creating"
rm -rf rootfs
mkdir rootfs
cd rootfs
echo "fetch tinyipa"
curl -s https://tarballs.opendev.org/openstack/ironic-python-agent/tinyipa/files/tinyipa-stable-2024.2.gz | gzip -d  | cpio dm
mkdir -p etc/frr usr/local/bin
echo "copy install files"
cp ../ipa-install.sh . || exit 1
cp ../files/frr.conf etc/frr/ || exit 1
echo "chroot install"
chroot . /ipa-install.sh || exit 1
echo "build ramdisk"
find . | cpio -H newc -o | gzip -9 > ../initramfs-ubuntu.gz
echo "fetch kernel"
curl -s https://tarballs.opendev.org/openstack/ironic-python-agent/tinyipa/files/tinyipa-stable-2024.2.vmlinuz > ../vmlinuz
```

Das Script kümmert sich also um die RamDisk und den Download des Kernel. Das Install-Script ist minimalistisch und sieht so aus:

```
#!/bin/sh
mount proc
echo "nameserver 8.8.8.8" > /etc/resolv.conf
ln -s /tmp/tce /etc/sysconfig/tcedir
mkdir -p /home/tc
chown tc /home/tc
su tc -c "mkdir -p /tmp/tce;tce-load -w -i frr python3.9 python3.9-jinja2" || exit 1
echo "/usr/local/sbin/bgpd -d -f /etc/frr/frr.conf" >> /opt/bootlocal.sh
umount proc
exit
```

Wir installieren FRR aus dem TinyCore Addon Repo und starten den `bgpd` über das TinyCore Standard-Startscript. Dort finden sich schon viele Dinge drin.

Leider haben wir vergessen, ein Passwort für den `rescue` User zu vergeben, den ipa haben möchte. Das Passwort brauchen wir verschlüsselt und können es im TinyCore konfigurieren:

```
mkdir -p /etc/ipa-rescue-config
echo $y$j9T$QLQU3gvCTsvTRqY1wl/PM.$dKMZJW5x/0ZQOA/xXmb4T7Zc/bQA4z2BiyFatZSGfN1 > /etc/ipa-rescue-config/ipa-rescue-password
```

Dann können wir uns auch mit `rescue:rescue` einloggen.

# Fallstricke

Bei meinen Versuchen trat schon sehr häufig `Kernel Panic` auf. Entweder hatte ich mich im Verzeichnis geirrt, das File war falsch hin kopiert, hatte die falschen Rechte, es fehlte die lib, oder /proc war nicht gemountet. Das System war also falsch installiert, zu minimal, oder zu maximal - da gab es auch Kernel Panic, weil der Speicher nicht ausreichte. Die wirkliche Ursache steht meistens, aber nicht immer dabei. Da hilft bloss: Probieren geht über Studieren.

Ubuntu 24.04 hat diesen [Bug](https://bugs.launchpad.net/ubuntu/+source/base-files/+bug/2054925) mit base-files. Da bin ich auf 24.10 gewechselt.

In 24.10 gab es wiederum [debirf](https://packages.ubuntu.com/search?suite=all&searchon=names&keywords=debirf) nicht mehr. Das wäre noch ein weiteres Shell-Script gewesen, was die Ubuntu-Distro erstellt. Es geht aber auch auf diesem Weg.

Fehlende Treiber: Wenn die passenden Kernel-Module fehlen, kann es passieren, dass keine Netzwerkkarte erkannt wird. Das bedarf as Laden von `linux-modules-<kernel-version>`. Das wiederum hängt vom Laden des ursprünglichen Kernels vmlinuz zusammen.
Heraus kam irgendwie sowas:

```
    LINUX_KERNEL=linux-image-"$(uname -r | cut -d- -f3-)" | grep '^Depends: ' | sed 's/^Depends: //' | tr ',' '\n' | tr -d ' ' | grep ^linux-image | sort -r | head -n1
    DEBIAN_FRONTEND=noninteractive apt -y install --no-install-recommends $LINUX_KERNEL
```
UEFI Boot: Eine Ramdisk funktioniert grundsätzlich auch mit UEFI statt herkömmlichen Bios. Es wird derselbe Bootloader verwendet (Grub). Zu beachten sind nur die Console-Umleitungen, etwa auf `serial`, wenn man im Netzwerksegment unterwegs ist.

Viel Spass!
