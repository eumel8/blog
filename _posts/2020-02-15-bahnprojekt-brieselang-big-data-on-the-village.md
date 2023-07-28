---
layout: post
tag: general
title: Bahnprojekt Brieselang - Big Data on the Village
subtitle: "Bahnfahren ist wieder in. Wegen der Umwelt. Knapp 4,7% der Berrufspendler fahren jeden Tag mit Bahn oder S-Bahn. Es sollen noch voel mehr werden, denn knapp 70% der Pendler fahren derzeit mit dem Auto. Wie stehts also mit der Qualitaet des Bahnverkehr&hellip;"
date: 2020-02-15
author: eumel8
---

Bahnfahren ist wieder in. Wegen der Umwelt. Knapp 4,7% der Berrufspendler fahren jeden Tag mit Bahn oder S-Bahn. Es sollen noch voel mehr werden, denn knapp 70% der Pendler fahren derzeit mit dem Auto. Wie stehts also mit der Qualitaet des Bahnverkehr in Deutschland?
<br/>
Die Bahn ist auch im Internet moderner geworden. Die Portale https://developer.deutschebahn.com/ und https://data.deutschebahn.com/ bieten eine Menge APIs und Datensaetze zu Bahnanlagen wie <a href="https://data.deutschebahn.com/dataset/data-stationsdaten-regio">Stationsdaten</a> an. Fahrplaene kann man aucb ueber APIs im Json-Format abrufen, aber es handelt sich immer um den SOLL-Fahrplan. Fuer den IST-Plan gibt es dort derzeit keine Schnittstellen, da muss man die Webseiten https://reiseauskunft.bahn.de/ oder https://mobile.bahn.de bemuehen.

<strong>Bahn-API</strong>
Bevor es richtig losgeht, brauchen wir erstmal die EVA Nummer vom Bahnhof Brieselang. Die gibts auf https://developer.deutschebahn.com. Nach der Registerierung muss man die StaDa-Station_Data - v2 API abonnieren. Mit einem erstellten Bearer-Token kann man die Daten abrufen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
curl -X GET --header "Accept: application/json" --header "Authorization: Bearer 34fffsa2f792e5b779b3432432wd1f3d071d" "https://api.deutschebahn.com/stada/v2/stations?searchstring=Brieselang"
</code></pre><!-- /codeblock -->

<pre>
...
 "evaNumbers": [
 {
 "number": 8013472,
 "geographicCoordinates": {
 "type": "Point",
 "coordinates": [
 13.001394,
 52.582549
 ]
 },
 "isMain": true
 }
 ],
...
</pre>

Der EVA Code ist 8013472,

<strong>Python</strong>

Die Reise beginnt bei <a href="https://requests.readthedocs.io/en/master/">Python Requests</a>. in Zeile 80 von 
<a href="https://github.com/eumel8/trainqa/blob/master/apps/schiene2.py#L80">schiene2.py</a>

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
def departures(origin, dt=datetime.now()):

 query = {
 'si': origin,
 'bt': "dep",
 'date': dt.strftime("%d.%m.%y"),
 'ti': dt.strftime("%H:%M"),
 'p': '1111101',
 'rt': 1,
 'max': 4,
 'use_realtime_filter': 1,
 'start': "yes",
 'L': 'vs_java3'
 }
 rsp = requests.get('http://mobile.bahn.de/bin/mobil/bhftafel.exe/dox?', params=query)
 return parse_departures1(rsp.text,dt)

</code></pre><!-- /codeblock -->
origin = EVA
bt = Departure (Abfahrt)
date/ti = Date/Timestamp
p = Verkehrsmittel (alle Zuege, kein Bus)
max = maximale Anzahl Fahrten (4...8)
rt/use_realtime = Echtzeitplan
start = incl .bereits gestartete Zuege
L = Ausgabeformat (xml) 

Tatsaechlich sieht die Seite so aus:

<img src="/blog/media/quick-uploads/bahnprojekt-brieselang-big-data-on-the-village/dbfahrplan3-2.png" width="585" height="386"/>

Als naechstes muss der Output geparsed werden in parse_departures. Dazu verwenden wir die <a href="https://www.crummy.com/software/BeautifulSoup/bs4/doc/">Bibliothek BeautifulSoup</a>. 

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
def parse_departures1(html,dt):

 soup = BeautifulSoup(html, "html.parser")
 date = dt.strftime("%d.%m.%y")

 for row in soup.find_all('div', attrs={'class': 'sqdetailsDep trow'}):
 trainnumber = row.span.contents[0]
 trainurl = row.a['href']
 traintarget = row.br.previous_element.strip()[3:]
 traindeparture = (row.find_all('span', attrs={'class': 'bold'})[-1].get_text())
 traindelay, traintext, trainnote = traindetails(date,trainnumber,trainurl)
 gspread_data(date,trainnumber,traindeparture,traintarget,traindelay,traintext,trainnote)
 return

</code></pre><!-- /codeblock -->

Es ist sehr gut zu sehen, wie man mitz find_all nach bestimmten Tags suchen kann, um da die Informationen rauszuziehen. Die brauchen wir auch, denn um Informationen ueber einen Zug zu bekommen, brauchen wir eine weitere Abfrage.

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
def traindetails(date,trainnumber,trainurl):

 trainurl = trainurl.replace('dox','dn')
 rsp = requests.get(trainurl)
 traindelay, traintext, trainnote = parse_train(rsp.text)
 return traindelay,traintext, trainnote
</code></pre><!-- /codeblock -->

Also fast dieselbe Abfrage, aber auf einem anderen Endpunkt. Die Seite sieht dann so aus:

<img src="/blog/media/quick-uploads/bahnprojekt-brieselang-big-data-on-the-village/dbfahrplan2.png" width="585" height="386"/>

Wir sind interessiert an den Besonderheiten des Zuges. Das sind entweder fehlende Wagen, fehlendes Mehrzweckabteil, fehlende Einsteigehilfe fuer Rollstuhlfahrer ... es ist ein Freitext, dort kann alles moegliche drinstehen. Wir definieren das spaeter einfach als Stoerung:

<img src="/blog/media/quick-uploads/bahnprojekt-brieselang-big-data-on-the-village/dbfahrplan4.png" width="585" height="386"/>

Auch diese Ausgabe wird mit BeautifulSoup geparsed. Wir haben jetzt aich alle Informationen zusammen und koennen diese in einer Google-Exceltabelle abspeichern. DIe Tabelle koennen wir bei Google Drive von Hand erstellen. Dann brauchen wir einen <a href="https://console.developers.google.com/apis/api/sheets.googleapis.com/">Service-Account von der Google Spreadsheet API</a>, der Schreibrechte in die Tabelle hat.

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>

def gspread_data(date,trainnumber,traindeparture,traintarget,traindelay,traintext,trainnote):
 row = [date,trainnumber,traindeparture,traintarget,traindelay,traintext,trainnote]
 scope = ['https://spreadsheets.google.com/feeds','https://www.googleapis.com/auth/drive']
 creds = ServiceAccountCredentials.from_json_keyfile_name('gspread-secret.json', scope)
 client = gspread.authorize(creds)
 sheet = client.open('trainqa').sheet1
 sheet.insert_row(row)
 removeDuplicates(sheet)
 return
</code></pre><!-- /codeblock -->

Eigentlich ganz einfach. Der Service-Account meldet sich bei der API an. Das Secret-File mit den Credentials liefert Google fuer cut&amp;paste. Ins Arbeitsblatt 1 der Exceltabelle werde die Daten geschrieben. 

<img src="/blog/media/quick-uploads/bahnprojekt-brieselang-big-data-on-the-village/dbfahrplan1.png" width="585" height="386"/>

Nun ist es aber so, dass wir den Fahrplan ohne gesten Bezugspunkt aufrufen. Wenn wir das Programm stuendlich laufen lassen, wissen wir nur ungefaehr, wieviel Datensaetze also Fahrten zurueckgeliefert werden. Die Gefahr fuer doppelte Datensaetze ist also ziemlich gross. DIese koennen wir durch removeDuplicates loeschen:

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
def removeDuplicates(sheet):
 data = sheet.get_all_values()
 datalen = len(data)
 newData = []

 for i in range(len(data)):
 row = data[i]
 if row not in newData:
 newData.append(row)
 else:
 sheet.delete_row(i)
 return

</code></pre><!-- /codeblock -->

Das vollstaendige Programm befindet sich hier: https://github.com/eumel8/trainqa/blob/master/apps/schiene2.py

[pagebreak]

<strong>Android Studio</strong>

DIe technischen Daten, also der Echtzeitfahrplan, ist natuerlich nur die eine Seite, um die Qualitaet der Zugverbindung zu messen. Was sagen aber die Fahrgaeste? "Eine App muesste man haben"; kam schnell der Wunsch auf. Wie kann man sowas bewerkstelligen?
Mit <a href="https://developer.android.com/studio">Android Studio</a> geht das relativ einfach. Das Entwicklertool fuer Android-App erinnert ein bischen an Visual Basic, es handelt sich aber tatsaechlich um Java-Code. Es gibt auch eine Menge Anleitungen im Netz. Am besten gefaellt mir https://abhiandroid.com/, um so Grundfunktionen auszuprobieren. Auch ein interessantes Projekt ist <a href="https://www.crazycodersclub.com/android/how-to-use-google-sheet-as-database-for-android-app-1-insert-operation/">hier </a>beschrieben. Der Plan waere also eine App, mit der man den Zug auswaehlen kann und diesen nach Puenktlichkeit, Auslastung und Platzangebot bewerten kann. Die Daten sollen in eine Excel-Tabelle geschrieben werden. Da kommt auch schon das erste Problem: Damit die App Daten in die Exceltabelle schreiben kann, braucht sie den Serviceaccount mit Schreibrechten. Nun wird die App, wenn sie erstmal im AppStore zur Verfuegung gestellt wird, auf jedermanns Handy installiert, der diese App haben moechte - incl. dem Service-Account nebst Credentials. Auch wenn Java-Klassen kompiliert sind, koennen sie wieder dekompiliert werden, um solche Informationen rauszuziehen. Dazu bietet Google Webformulare an, die die Antworten in Exceltabellen abspeichert. Die Formulare sind oeffentlich zugaenglich, nix Service-Account. Wir brauchen nur einen Webservice in der App, der dieses Formular mit den Appdaten fuer uns ausfuellt

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>

public interface QuestionsSpreadsheetWebService {

 @POST("1FAIpQLSeyBr1tJ3y7SjX2c107B92yv2P600WRxmlJyAWzrPt59Bvf7g/formResponse")
 @FormUrlEncoded
 Call<void> completeQuestionnaire(
 @Field("entry.1476348758") String feld1t,
 @Field("entry.679257558") String feld2,
 @Field("entry.1485087550") Float feld4,
 @Field("entry.617878135") Float feld5,
 @Field("entry.1543695788") Float feld6,
 @Field("entry.51849126") Boolean feld7
 );
</void></code></pre>k -->

Die Feld-ID bekommen wir aus dem HTML-Sourccode des Webformulars. DIe Post-ID ist die Formular-ID aus der URL desselbigen.
Aequivalente Felder bekommen wir in Android mit <a href="https://github.com/eumel8/trainqa/blob/master/android/app/src/main/res/layout-v17/questions_activity.xml#L92">dieser xml</a>. Dazu gehoert dann eine <a href="https://github.com/eumel8/trainqa/blob/master/android/app/src/main/java/com/eumelnet/bahn/spreadsheetinput/QuestionsActivity.java#L42">onCreate-class</a>, in der dann auch das onClick des Webformulars verarbeitet wird und zu dem Webservice oben weiterleitet.
Nachtraeglich reingefummelt ist noch eine Liste von Zuegen, die zur Bewertung ausgewaehlt werden koennen. Dazu gibts einen <a href="https://github.com/eumel8/trainqa/blob/master/android/app/src/main/java/com/eumelnet/bahn/spreadsheetinput/QuestionsActivity.java#L99">zweiten Click-Button</a>, mit der eine ListView aufgerufen wird. Jetzt braeuchten wir wieder die ServiceAccount Credentials zum Zugriff auf die Excel-Tabelle, wenn wir auf dieselben Daten zugreifen wollen die wir oben im Python-Script erstellt haben. Hier hilft uns ein <a href="https://github.com/eumel8/trainqa/blob/master/android/app/src/main/java/com/eumelnet/bahn/spreadsheetinput/JSONParser.java#L16">Json-Parser</a>, welches als App bei Google gehostet ist. Man gibt der Excel-Tabelle Lesezugriff fuer die Welt und verfuettern die Excel-ID aus der URL als Parameter an das Script. Als Ausgabe erhalten wir die Excell-Tabelle als Json, was wir in der App als Liste verarbeiten koennen. 
Mhm, alles bischen tricky und schwer zu erklaeren. Es gibt aber eine sehr grosse Community und so ziemlich jedes Problem ist im Netz schon mal beschrieben und geloest. Vielleicht leistet der Blog auch einen kleinen Beitrag.
DIe App wird im Android Studio kompiliert, signiert und dann im https://play.google.com hochgeladen. Dazu muss man sich als Entwickler registrieren, 25 Dollar einwerfen und paar Tage warten, bis die App freigeschalten ist.



<img src="/blog/media/quick-uploads/bahnprojekt-brieselang-big-data-on-the-village/bahnapp1.png" width="585" height="386"/>

<img src="/blog/media/quick-uploads/bahnprojekt-brieselang-big-data-on-the-village/bahnapp2.png" width="585" height="386"/>

[pagebreak]

<strong>Public Tableau</strong>

<a href="https://public.tableau.com/profile/eumel#!/">Public Tableau</a> ist ein Dienst, mit dem man Daten visualisieren kann. Das Programm gibts auch als Serverinstallation, mit derm man bestimmte Datenbanken auslesen kann, es gibt aber auch den Onlinedienst, der sich mit Google Excel verbinden kann, um die Daten von dort abzugreifen. Es gibt auch einen Tableau-Client, den man sich ruinterladen kann, und eine Menge Vorlagen an Tabellenformationen und Diagrammen. Die Verbindung zu Google wird ueber einen Auth-Token aufrecht erhalten. Sicherheitshalber koennte man noch einen extra Google-Account erstellen, um nicht seine persoenlichen Credentials an dieser Stelle zu verwenden. Aber etwa einmal am Tag werden die Daten automatisch aktualisiert.
Fallstrick: Man darf bei dieser Methode nicht mehrere Google Sheet Tabellennblaetter mischen und auch keine zwei Tabellen miteinander verbinden - auch nicht in einem gemeinsamen Dashboard in einem Projekt! Sonst werden die Daten nicht mehr automatisch aktualisiert.

<strong>Ausblick</strong>
Mit der Zeit (Stand 02/2020) werden sich eine Menge Daten dort ansammeln. So lassen sich laengerfristige und belastbare Statistiken erstellen ueber Qualitaet des Bahnverkehrs.

Projektlinks

<ul>
 <li>https://github.com/eumel8/trainqa</li>
 <li>https://bahn-brieselang.github.io/</li>
</ul>

Credits:
<ul>
<li>https://github.com/posixpascal/optimusbahn (Python Bahn API)</li>
<li>https://abhiandroid.com (Android Tutorials)</li>
<li>https://www.crazycodersclub.com/android/using-google-spread-sheet-as-database-for-android-application-part-1/ (Google Excel Json)</li>
<li>http://jmcglone.com/guides/github-pages/ (Github Pages)</li>
</ul>
