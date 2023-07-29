---
layout: post
tag: inet
title: Meine Buchempfehlungen, selbst gebaut
subtitle: "Seit einiger Zeit gehoert der Tolino als treuer Begleiter ins Reisegepaeck. Praktisch, leicht, egal ob daemmriges Licht, ich hab immer was zum Lesen dabei, ohne kiloschwere Buecher mit mir rumzuschleppen. Das einzige Problem war bis jetzt, wenn ein Buch zu Ende ist - was lese ich als Naechstes"
date: 2015-07-29
author: eumel8
---

<p>Seit einiger Zeit gehoert der Tolino als treuer Begleiter ins Reisegepaeck. Praktisch, leicht, egal ob daemmriges Licht, ich hab immer was zum Lesen dabei, ohne kiloschwere Buecher mit mir rumzuschleppen. Das einzige Problem war bis jetzt, wenn ein Buch zu Ende ist: Was lese ich als naechstes?</p>
<p>[teaserbreak] Eines muss man den Buchhaendlern und Ebook-Plattformen lassen: Onlinemarketing koennen sie nicht. Zum Beispiel Thalia: Immer am Ende eines Ebooks erscheint eine Seite "Empfehlungen". Auch flattert mehr oder weniger haeufig eine Email ins Postfach mit weiteren "Empfehlungen". Wenn man dann diese "Empfehlungen" mit dem abgleicht, was gerade in Deutschland auf Platz 1 der Bestseller-Liste ist, landet man sehr hohe Uebereinstimmungen. Leider aber nicht mit dem, was <strong>ich</strong> lesen moechte.</p>
<p>Damit ist jetzt Schluss. Lange genug habe ich mich darueber geaergert und die Zeit vertroedelt, in der ich schon laengst ein weiteres Buch haette lesen koennen. Wir machen uns dran, eine eigene Empfehlungssuchmaschine zu basteln. Dazu brauchen wir etwas PHP, XML und die <a href="http://docs.aws.amazon.com/AWSECommerceService/latest/DG/Welcome.html" target="_blank">Product Advertising API von Amazon. </a></p>
<p>Ueber die API kann man aehnlich der Amazon-Webseite im Artikelbestand des Warenhauses suchen. Wie auf dem <a href="http://associates-amazon.s3.amazonaws.com/scratchpad/index.html" target="_blank">Scratchpad</a> zu sehen ist, gibt es ein paar interessante Stellschrauben wie etwa die <a href="http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CHAP_ResponseGroupsList.html" target="_blank">ResponseGroup Similarities</a>. Um die API aber benutzen zu koennen, muessen wir uns kostenlos fuer diesen Dienst freischalten. Ausserdem muessen wir uns einen AccessKey + Secret generieren, um uns an der API anmelden zu koennen. AssociateTag koennen wir vernachlaessigen, Operation stellen wir auf ItemSearch, SearchIndex auf Books und die Region auf webservices.amazon.de, um den deutschen Marktplatz zu durchsuchen. Bei Keywords tragen wir einfach den Autor unseres letzten Lieblingsbuches ein, z.B. Frank Schaetzing. Das Scratchpad bastelt unseren Request passend zusammen, signiert ihn und schickt ihn zur API. Als Antwort sollten wir ein XML-File mit den gewuenschten Treffern erhalten. Das XML-File koennen wir mit simplexml_load_string in php in ein Array laden und dieses als Webseite ausgeben. Auch verraet uns die API wieviel Treffer wir erzielt haben und koennen dami in den Ergebnissen "weiterblaettern", damit nicht alle 20.000 Ergebnisse auf einer Seite zu sehen sind.</p>
<p>Praktisch sieht unser PHP-Skript so aus:</p>

```
<?php
// set AWS credentials and associate tag
$AWSAccessKeyId = "AK47PABLOIKA3344MONSA";
$AWSSecretKey = "4ZVtHsw7233HDoElCleeodmz";
$AssociateTag = "";
// start items from page 1
$ItemPage = 1;
// read client cookie if set
$cookie = isset($_COOKIE["Keywords"]) ? $_COOKIE["Keywords"] : "";
// use a standard keyword as start point
$Keywords = rawurlencode("Frank Schaetzing");
// set operation mode 
$Operation = "ItemSearch";
// set response group
$ResponseGroup = "Medium";
// set search index
$SearchIndex = "Books";
// set service name
$Service = "AWSECommerceService";
// generate current timestamp
$Timestamp = rawurlencode(gmdate('Y-m-d\TH:i:s\Z'));
// set API version
$Version = "2013-08-01";
// load keywords from cookies
$Keywords = $cookie;

?>
```

<p> 
Das mit den Cookies ist zwar etwas Doppelmoppel, aber mancher mag ja Cookies nicht und da sollte man auch ohne arbeiten koennen
</p>

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!--
Template Name: Opportunity
Author: <a href="http://www.os-templates.com/">OS Templates</a>
Author URI: http://www.os-templates.com/
Licence: Free to use under our free template licence terms
Licence URI: http://www.os-templates.com/template-terms
-->
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>#ebook wishlist</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">
<link rel="stylesheet" href="layout/styles/layout.css" type="text/css">
</link></meta></head>
<body id="top"> col1">
 <div id="topbar">
 </div>

<div class="wrapper col2">
 <div id="header">
 <div id="logo">
 <h1><a href="index.php">ebook wishlist</a></h1>
 <p>a free web service for search similar ebooks</p>
 </div>
 <div id="topnav">
 <div id="search">
 <form action='<?php htmlspecialchars($_SERVER["SCRIPT_NAME"]) ?>' method='get'>
 <fieldset>
 <legend>ebook-search</legend>
 <input type="text" name="keywords" value="<?php echo $cookie ? />" size="65" autofocus="autofocus">
 <input type="submit" name="go" id="go" value="GO" onclick="history.go(0)" />
 </fieldset>
 </form>
 </div>
 </div>
 <br class="clear" />
 </div>
</div>
</body></html>
```


<p>Etwas css foo macht die Seite bunter. Und wir generieren die Eingabeform fuer die Suche.</p>

```html
<?php

 if ($_GET) {
 if ($_GET['keywords']) {$Keywords = filter_var($_GET['keywords'],FILTER_SANITIZE_STRING) ;}
 if ($_GET['ItemPage']) {$ItemPage = filter_var($_GET['ItemPage'],FILTER_SANITIZE_NUMBER_INT);}
 if ($_GET['ItemId']) {$ItemId = filter_var($_GET['ItemId'],FILTER_SANITIZE_STRING);}
 if ($_GET['Operation']) {$Operation = filter_var($_GET['Operation'],FILTER_SANITIZE_STRING);}
 if ($_GET['ResponseGroup']) {$ResponseGroup = filter_var($_GET['ResponseGroup'],FILTER_SANITIZE_STRING);}

 if (preg_match("/^[a-zA-Z0-9 %\.\,]{3,}+$/", $Keywords)) {
 setcookie("Keywords",$Keywords,time()+ (10 * 365 * 24 * 60 * 60));
 } else {
 die("Cookie not valid ".$Keywords);
 }

```

<p>Die Eingabevariablen <em>$_GET['ItemPage']</em> brauchen wir zum "Blaettern" und die anderen Variablen fuer einen anderen Suchmodus</p>

```php
$Keywords = preg_replace("/^/", "\"", $Keywords);
$Keywords = preg_replace("/$/", "\"", $Keywords);
$Keywords = preg_replace("/,/", "\"|\"", $Keywords);
``` 


<p>Die Keywords werden fuer die API praepariert, um auch nach mehreren Suchbegriffen suchen zu koennen</p>

```php
 $srequest = "GET\necs.amazonaws.de\n/onca/xml\n";
 $url = "http://ecs.amazonaws.de/onca/xml?";

 if ($ItemId) {
 $request = "AWSAccessKeyId=".$AWSAccessKeyId."&AssociateTag=".$AssociateTag."&IdType=ASIN&ItemId=".$ItemId."&Operation=ItemLookup&ResponseGroup=".$ResponseGroup."&Service=AWSECommerceService&Timestamp=".$Timestamp."&Version=".$Version;
 } else {
 $request = "AWSAccessKeyId=".$AWSAccessKeyId."&AssociateTag=".$AssociateTag."&ItemPage=".$ItemPage."&Keywords=".rawurlencode($Keywords)."&Operation=".$Operation."&ResponseGroup=".$ResponseGroup."&SearchIndex=".$SearchIndex."&Service=AWSECommerceService&Timestamp=".$Timestamp."&Version=".$Version;
 }

 $url .= $request;
 $srequest .= $request;
 $signature = rawurlencode(base64_encode(hash_hmac('sha256', $srequest, $AWSSecretKey, true)));
 $url .= "&Signature=".$signature;

```

<p>Das Herzstueck der Anlage. Die Parameter werden zum API-Aufruf zusammengebaut. Dabei ist darauf zu achten, dass die Parameter in alphabetischer Reihenfolge stehen! Zum Schluss wird der Aufruf signiert</p>

```php
$response = file_get_contents($url);
$result = simplexml_load_string($response);
?>
```


<p>Ab die Post und her damit. Die URL wird ueber das Internet aufgerufen und das Ergebnis in der Variable <em>$result</em> abgespeichert</p>

```html

<div class="wrapper col4">
 <div id="container">
 <div id="content">
</div></div></div>
``` 

<p>divs als table Ersatz</p>

```php
<?php

foreach ($result->Items->Item as $item) {

?>
 <div id="latestnews">
 <ul>
 <li>
<?php
 if($item->MediumImage->URL){
 echo ("<div class=\"imgholder\"><a href=\"".$item->DetailPageURL."\" target=\"_blank\"><img src=\"".$item- />MediumImage->URL."\" border=\"0\" alt=\"Cover\"></a></div>\n");
 }
 echo "<div class=\"latestnews\">";
 echo ("<h3><a href=\"".$item->DetailPageURL."\"target=\"_blank\" >".htmlspecialchars($item->ItemAttributes->Title)."</a></h3><br />\n");
 if($item->ItemAttributes->Author[0]){
 echo ("Autor: ".htmlspecialchars($item->ItemAttributes->Author[0])."\n");
 }
 if($item->ItemAttributes->Publisher){
 echo ("<br />Verlag: ".htmlspecialchars($item->ItemAttributes->Publisher)."\n");
 }
 if($item->ItemAttributes->PublicationDate){
 echo ("<br />erschienen: ".htmlspecialchars($item->ItemAttributes->PublicationDate)."\n");
 }
 if($item->OfferSummary->LowestNewPrice->FormattedPrice){
 echo ("<br />Preis: ".htmlspecialchars($item->OfferSummary->LowestNewPrice->FormattedPrice)."\n");
 }
 if($item->OfferSummary->LowestUsedPrice->FormattedPrice){
 echo (" / erh&auml;ltlich ab: ".htmlspecialchars($item->OfferSummary->LowestUsedPrice->FormattedPrice)."\n");
 }
 if($item->DetailPageURL) {
 echo ("<p class=\"readmore\"><a href=\"".$item->DetailPageURL."\" target=\"_blank\" >more details</a>\n");
 }
```

<p>Ausgabe diverser Eigenschaften des Produkts (wenn vorhanden) in einer Schleife.</p>

```php
 if($item->ASIN){
 echo "<p class=\"readmore\"><a href=\"".htmlspecialchars("?".
 "SearchIndex"."=". $SearchIndex ."&".
 "ItemPage" ."=".$ItemPage ."&".
 "Operation=ItemLookup&" .
 "ResponseGroup=Similarities&" .
 "ItemId" ."=".$item->ASIN).
 "\">SimilarityLookup: $item->ASIN</a>\n";
 }

 if($item->SimilarProducts){
 echo "<p>";
 echo "Similar: <ul>";
 foreach ($item->SimilarProducts->SimilarProduct as $similarproduct) {
 echo "<li><a href=\"".htmlspecialchars("?".
 "ItemId" ."=".$similarproduct->ASIN."&".
 "Operation=ItemLookup&" .
 "ResponseGroup=ItemAttributes") .
 "\">".$similarproduct->Title."</a></li>";

 }
 echo "</ul>";
 echo "</p>";
 }
?>
<?php
}
?>
```

<p>Hier koennen similare Produkte weiter nach Similaritaeten durchsucht werden</p>


```php
<div id="container">
 <div id="content">
<?php

foreach ($result->Items->Request as $found) {
 echo ("<h3>Page ".$found->ItemSearchRequest->ItemPage."</h3>\n");
 $SearchIndex = ($found->ItemSearchRequest->SearchIndex);
 $Keywords = ($found->ItemSearchRequest->Keywords);
}


foreach ($result->Items as $results) {
 echo ("Results total: ".$results->TotalResults);
 echo (" on ".$results->TotalPages. " pages");
}

$TotalPages = ($results->TotalPages);
$SearchIndex = ($found->ItemSearchRequest->SearchIndex);
$Keywords = ($found->ItemSearchRequest->Keywords);
$ItemPage = ($found->ItemSearchRequest->ItemPage);
$Keywords = preg_replace("/[ ]/", "+", $Keywords);

if ($TotalPages > 1) {
 if ($ItemPage*1 <= $TotalPages) {
 echo "<p class=\"readmore\">";
 echo "<a class=\"fl_right\" href=\"".htmlspecialchars("?".
 "SearchIndex"."=". $SearchIndex ."&".
 "Keywords" ."=". $Keywords ."&".
 "ItemPage" ."=".($ItemPage +1)).
 "\">next</a>\n";
 }
}
?>
 <div id="coloumn">
 <a href="<?php echo $_SERVER["SCRIPT_NAME"];?>">new search</a>
 <br class="clear" />
 </div>
</div>
</div>
<?php

}
```

<p>Am Schluss erfahren wir, wieviel Suchtreffer es gibt und bereiten die "Blaetterfunktion" vor, um weitere Ergebnisse anzeigen zu koennen</p>

<p><strong>Fertig!</strong> Das Script in Aktion finden wir auf <a href="http://ebooks.eumel.de" target="_blank">ebooks.eumel.de</a>. Und wie wir die Kindle-Buecher ins Tolino reinbekommen, steht auf <a href="https://unsupported.eumel.de/2015/07/29/tolino-kindle-unsupported.html" target="_blank">unsupported.eumel.de</a></p>
