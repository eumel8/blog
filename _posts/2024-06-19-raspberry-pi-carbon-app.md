---
layout: post
tag: inet
title: Raspberry PI Carbon App
subtitle: Grüner Strom in Echtzeit messen
date: 2024-06-19
author: eumel8
twitter: 'images/blog-eumel-de.png'
---

# Einstieg

Im [K8S Blog](https://k8sblog.eumel.de/2023/11/14/sustainable-computing.html) haben wir uns schon mal mit Nachhaltigem Computern und Green-IT auseinandergesetzt. Dabei haben wir den Strommix in Deutschland in Echtzeit gemessen und daraus Massnahmen für unsere Kubernetes-Workload abgeleitet. Nun wollen wir diese Daten, ganz privat, zu Hause nutzen, um etwa das Einschalten der Waschmaschine nachhaltig zu bestimmen oder die Bügel-Session in eine Zeit zu verlagern, in der Ökostrom ausreichend vorliegt. Um jetzt nicht das ganze Haus mit Smart-Home-Kram zu verkabeln, genügt uns eine Visualisierung wie etwa eine Uhr oder ein Thermometer, um die Ökobilanz zu bestimmen, konkret: die Energieampel!

# Energieampel Hardware

Wir benötigen hierzu:

- Raspberry 4 B 4GB Ram
- 3,5 Zoll LCD Display
- 32 GB SanDisk

<img src="/images/2024-06-19_2.jpg" width="585" height="386"/>

<img src="/images/2024-06-19_3.jpg" width="585" height="386"/>

# Carbon-App

Um Prometheus-Metriken graphisch anzuzeigen, dazu gibt es Grafana. Um den ganzen Stack auf dem Raspberry laufen zu lassen, ist der Aufwand schon ziemlich hoch. Eigentlich wollen wir bloss eine Zahl graphisch darstellen, das LCD-Display ist auch nicht so gross. Eigentlich soll das Display auch nur 3 Farben anzeigen: rot = wenig Ökostrom, gelb = ein bisschen Ökostron, grün = viel Ökostrom, quasi eine Energieampel.

Diese Aufgabe erfüllt die [Carbon App](https://github.com/eumel8/carbon-app), eine Go-Applikation, die Betriebssystem unabhängig ein Fenster startet (brauch also mindestens unter Linux X) und dort dann die Farbe darstellt. Im Hintergrund wird zyklisch Prometheus abgefragt, die Umgebungsvariable `PROMETHEUS_URL` zeigt auf diesen Endpunkt. In der Version 0.0.20 läuft die App im Vollbildmodus und lässt sich abgesehen von der Prometheus-URL und dem Abfrage-Timer nicht weiter konfigurieren.

# Energieampel Software (Fast Track)

Für den Fast Track haben wir schon irgendwo einen Prometheus laufen, der uns die entsprechende Metrik mit dem Energieanteil von Ökostrom in Deutschland in Echtzeit liefert. 

Ausgehend vom verwendeten LCD-Display findet man [hier](http://www.lcdwiki.com/3.5inch_RPi_Display) fertig konfigurierte Images für den Raspberry, bei dem das LCD-Display direkt angesprochen wird. Ansonsten müsste man das extra konfigurieren (siehe unten). Ich entschied mich für das `MPI3501-3.5inch-ubuntu-mate-22.04-desktop-armhf+raspi.img`, da es für mein LCD Display entwickelt wurde. Mit einem USB-Diskwriter kann man es auf die SD-Karte kopieren und in den Raspberry reinschieben. Nach dem Booten wird automatisch X gestartet mit Autologin vom user `pi`. Was wir noch brauchen, sind die Netzwerkeinstellungen für WLAN, wenn wir keine LAN-Verbindung verwenden wollen. Fertig.

Jetzt müsste nur noch die [Carbon-App](https://github.com/eumel8/carbon-app) nach dem Booten starten. Dazu verbinden wir uns mit ssh mit dem Raspberry und legen folgende Datei an:

```bash
ssh pi@<raspberry-ip>
mkdir -p /home/pi/.config/autostart/carbonapp.desktop
```

/home/pi/.config/autostart/carbonapp.desktop

```
[Desktop Entry]
Name=Carbonapp startup commands for LightDM session
Type=Application
NoDisplay=true
Exec=/home/pi/bin/autostart.sh
X-Ubuntu-Gettext-Domain=lightdm
```

Das funktioniert hier alsot mit Lightdm als Displaymanager in X:

```bash
cat /etc/X11/default-display-manager
/usr/sbin/lightdm
```

Jetzt legen wir noch diese Datei an:

```bash
mkdir /home/pi/bin/
```

/home/pi/bin/autostart.sh

```
#!/bin/sh

wget https://github.com/eumel8/carbon-app/releases/download/0.0.20/carbonapp-arm.tgz
tar xvfz carbonapp-arm.tgz
rm -f carbonapp-arm.tgz
export PROMETHEUS_URL=http://<prometheus-server>
./carbonapp
```

Wir haben hier ein 32-bit-Betriebssystem, es gibt aber auch App-Versionen für amd64 und arm64 - da muss man das enstsprechend anpassen. Schaut einfach auf die [Release](https://github.com/eumel8/carbon-app/releases) Seite.

Als Prometheus-Server brauchen wir einen gültigen Endpunkt für die Metriken, etwa 127.0.0.1:9090

Jetzt noch die Datei ausführbar machen:

```bash
chmod +x /home/pi/bin/autostart.sh
```

Beim Raspberry gibt es die Eigenart, dass nach 30 Minuten das Power-Management das Display in den Sleep-Modus versetzt. Das kann man in der X-Oberfläche ändern: Apps-Powermanagement, Sleep Display: none

In den Gnome-Settings kann man das auch in der Gnome-Datenbank des pi-Users verifizieren.

```bash
sudo su -
dconf read /org/mate/power-manager/sleep-display-ac
```

Das zweite Störelement ist der Screensaver. Hier kann man mit 

```bash
apt install xscreensaver
```

das passende Paket installieren und in den Menüeinstellungen den Screensaver Mode auf `Disable Screen Saver` stellen.


Alle anderen Screensaver sollte man deinstallieren:

```bash
apt purge mate-screensaver
```

Auch unattended upgrade mögen wir nicht:

```bash
rm /etc/apt/apt.conf.d/50unattended-upgrades
```

Vielleicht noch Datum/Uhrzeit/Zeitzone einstellen, etwa mit `raspi-config`, reboot, fertig. Danach sieht es dann so aus:

<img src="/images/2024-06-19_1.jpg" width="585" height="386"/>

# Energieampel Software (The hard way)

Für den etwas längeren Weg installieren wir Ubuntu One, etwa von [https://ubuntu.com/download/raspberry-pi](https://ubuntu.com/download/raspberry-pi). Wir richten WLAN, User und Zeitzone manuell ein.

Danach müssen wir den Treiber für das LCD-Display installieren:

```bash
apt update
apt install git cmake g++ curl
snap install helm --classic
git clone https://github.com/lcdwiki/LCD-show-ubuntu
cd LCD-show-ubuntu
./LCD35-show
```

Nach dem Reboot sollte die Bildschirmausgabe auf das LCD-Display umgelenkt werden. Das Einrichtungsprogramm bietet auch einen Backup/Restore im Programmverzeichnis an. Es lässt sich also wieder deinstallieren und die ursprüngliche Bildschirmausgabe herstellen.

Dann kann man den Bildschirm noch kalibrieren:

```bash
apt install xinput-calibrator
```

Es gibt auch einige Anleitungen dafür im Netz:

- (https://www.waveshare.com/wiki/3.5inch_RPi_LCD_(A)
- [xrandr](https://wiki.ubuntu.com/X/Config/Resolution#Resetting_an_out-of-range_resolution)
- [xinput_calibrator](https://manpages.ubuntu.com/manpages/xenial/man1/xinput_calibrator.1.html)

Es kommt natürlich auch darauf an, welche Typ von Display man verwendet.

Als nächstes erstellen wir eine Autostart-Datei:

~/.config/autostart/kiosk.desktop:

```
[Desktop Entry]
Type=Application
Exec=autostart.sh
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name[en_US]=carbon-kiosk
Name=firefox
Comment[en_US]=
Comment=
```

Dann die Start-Datei

/home/pi/bin/autostart.sh

```
export KUBECONFIG=/home/pi/.carbon.kubeconfig
kubectl -n carbon wait --for=condition=available deployment carbon-grafana
# use pre-installed firefox browser in kiosk mode
firefox --kiosk http://10.43.2.152/d/carbonstation/carbon-station?orgId=1&refresh=5m
# OR download https://github.com/grafana/grafana-kiosk
# install chrome browser with: apt install chromium-browser
# and use this line instead firefox:
#/usr/local/bin/grafana-kiosk --URL http://10.43.2.152/d/carbonstation/carbon-station?orgId=1 --kiosk-mode tv
```

Es gibt hier zwei Optionen. Eine mit Firefox und eine mit Grafana-Kiosk, die im Prinzip auf Google Chrome beruht.

Jetzt installieren wir K3S:

```bash
sudo curl -sfL https://get.k3s.io | sh -
```

Wenn wir nicht die Admin-Credentials für unsere Kiosk-App verwenden wollen, können wir noch einen User in Kubernetes einrichten, siehe dazu [diese Anleitung](https://aungzanbaw.medium.com/a-step-by-step-guide-to-creating-users-in-kubernetes-6a5a2cfd8c71)

Wenn der Kubernetes-Cluster läuft, können wir die Carbon Footprint App installieren:

```bash
snap install helm --classic
git clone https://github.com/eumel8/carbon-footprint.git
cd carbon-footprint
export KUBECONFIG=/var/lib/rancher/k3s/server/cred/admin.kubeconfig
helm -n carbon upgrade -i carbon . --create-namespace --set entsoe.entsoe_api_key=xxxx --set grafana.adminPassword=carbon-station
```

Zu beachten sind die Installationsanweisungen der [Carbon Footprint App](https://github.com/eumel8/carbon-footprint/), insbesondere das Besorgen des Entsoe-API-Keys.

Mit `kubectl -n carbon get services` kann man die Service-IP von Grafana abfragen und oben in der autostart.sh anpassen.

Fortan sollte nach dem nächsten Reboot der K3S starten, mittels Prometheus/Grafana die Backend-Services bereitstellen, damit dann Prometheus/Chrome im Kiosk-Mode in einem Dashboard die Öko-Strom-Metrik und die Ampel darstellen kann:

<img src="/images/2024-06-19_4.jpg" width="585" height="386"/>

Man muss sagen, das K3S mit dem Prometheus, zusammen mit dem X und dem Firefox Browser schlaucht den Raspberry schon mächtig. 4 GB Ram sind hier zu wenig, man sollte hier mehr investieren. Dann gibt es Probleme mit dem Auto-Refresh, ansonsten ist die Anzeige relativ statisch. Auch die Anzeige ist relativ klein, das Dashboard wird trotz Kiosk-Mode nicht richtig dargestellt und ist aus grösserer Entfernung schwer zu lesen. Am beste verzichtet man auf den Browser-Anteil und verwendet die [Carbon-App](https://github.com/eumel8/carbon-app/) wie im Fast Track beschrieben. Als `PROMETHEUS_URL` verwendet man einfach den Service-Endpunkt für Prometheus im carbon Namespace unseres Clusters.

# Ziel erreicht

Ich habe sichtbar, etwa im Hauswirtschaftsraum oder der Küche, Informationen über den Anteil des Ökostroms in Echtzeit. Dieser Wert existiert derzeit nur deutschlandweit, in Zukunft wird sowas per Stadt/Strasse/Hausnummer funktionieren und ich kann meinen Energieverbrauch auf die Zeiten mit Ökostrom-Erzeugung anpassen.

Happy Planet!
