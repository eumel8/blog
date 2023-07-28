---
layout: post
tag: inet
title: Meine Buchempfehlungen, selbst gebaut
subtitle: "Seit einiger Zeit gehoert der Tolino als treuer Begleiter ins Reisegepaeck. Praktisch, leicht, egal ob daemmriges Licht, ich hab immer was zum Lesen dabei, ohne kiloschwere Buecher mit mir rumzuschleppen. Das einzige Problem war bis jetzt, wenn ein Buch&hellip;"
date: 2015-07-29
author: eumel8
---

<p>Seit einiger Zeit gehoert der Tolino als treuer Begleiter ins Reisegepaeck. Praktisch, leicht, egal ob daemmriges Licht, ich hab immer was zum Lesen dabei, ohne kiloschwere Buecher mit mir rumzuschleppen. Das einzige Problem war bis jetzt, wenn ein Buch zu Ende ist: Was lese ich als naechstes?</p>
<p>[teaserbreak] Eines muss man den Buchhaendlern und Ebook-Plattformen lassen: Onlinemarketing koennen sie nicht. Zum Beispiel Thalia: Immer am Ende eines Ebooks erscheint eine Seite "Empfehlungen". Auch flattert mehr oder weniger haeufig eine Email ins Postfach mit weiteren "Empfehlungen". Wenn man dann diese "Empfehlungen" mit dem abgleicht, was gerade in Deutschland auf Platz 1 der Bestseller-Liste ist, landet man sehr hohe Uebereinstimmungen. Leider aber nicht mit dem, was <strong>ich</strong> lesen moechte.</p>
<p>Damit ist jetzt Schluss. Lange genug habe ich mich darueber geaergert und die Zeit vertroedelt, in der ich schon laengst ein weiteres Buch haette lesen koennen. Wir machen uns dran, eine eigene Empfehlungssuchmaschine zu basteln. Dazu brauchen wir etwas PHP, XML und die <a href="http://docs.aws.amazon.com/AWSECommerceService/latest/DG/Welcome.html" target="_blank">Product Advertising API von Amazon. </a></p>
<p>Ueber die API kann man aehnlich der Amazon-Webseite im Artikelbestand des Warenhauses suchen. Wie auf dem <a href="http://associates-amazon.s3.amazonaws.com/scratchpad/index.html" target="_blank">Scratchpad</a> zu sehen ist, gibt es ein paar interessante Stellschrauben wie etwa die <a href="http://docs.aws.amazon.com/AWSECommerceService/latest/DG/CHAP_ResponseGroupsList.html" target="_blank">ResponseGroup Similarities</a>. Um die API aber benutzen zu koennen, muessen wir uns kostenlos fuer diesen Dienst freischalten. Ausserdem muessen wir uns einen AccessKey + Secret generieren, um uns an der API anmelden zu koennen. AssociateTag koennen wir vernachlaessigen, Operation stellen wir auf ItemSearch, SearchIndex auf Books und die Region auf webservices.amazon.de, um den deutschen Marktplatz zu durchsuchen. Bei Keywords tragen wir einfach den Autor unseres letzten Lieblingsbuches ein, z.B. Frank Schaetzing. Das Scratchpad bastelt unseren Request passend zusammen, signiert ihn und schickt ihn zur API. Als Antwort sollten wir ein XML-File mit den gewuenschten Treffern erhalten. Das XML-File koennen wir mit simplexml_load_string in php in ein Array laden und dieses als Webseite ausgeben. Auch verraet uns die API wieviel Treffer wir erzielt haben und koennen dami in den Ergebnissen "weiterblaettern", damit nicht alle 20.000 Ergebnisse auf einer Seite zu sehen sind.</p>
<p>Praktisch sieht unser PHP-Skript so aus:</p>

<!-- codeblock lang=php line=1 --><pre class="codeblock"><code>
&lt;?php
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

?&gt;
</code></pre><!-- /codeblock -->

<p> 
Das mit den Cookies ist zwar etwas Doppelmoppel, aber mancher mag ja Cookies nicht und da sollte man auch ohne arbeiten koennen
</p>
<!-- codeblock lang=html line=1 --><pre class="codeblock"><code>
&lt;!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"&gt;
&lt;!--
Template Name: Opportunity
Author: &lt;a href="http://www.os-templates.com/"&gt;OS Templates&lt;/a&gt;
Author URI: http://www.os-templates.com/
Licence: Free to use under our free template licence terms
Licence URI: http://www.os-templates.com/template-terms
--&gt;
&lt;html xmlns="http://www.w3.org/1999/xhtml"&gt;
&lt;head&gt;
&lt;title&gt;#ebook wishlist&lt;/title&gt;
&lt;meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1"&gt;
&lt;link rel="stylesheet" href="layout/styles/layout.css" type="text/css"&gt;
&lt;/link&gt;&lt;/meta&gt;&lt;/head&gt;
&lt;body id="top"&gt; col1"&gt;
 &lt;div id="topbar"&gt;
 &lt;/div&gt;

&lt;div class="wrapper col2"&gt;
 &lt;div id="header"&gt;
 &lt;div id="logo"&gt;
 &lt;h1&gt;&lt;a href="index.php"&gt;ebook wishlist&lt;/a&gt;&lt;/h1&gt;
 <p>a free web service for search similar ebooks</p>
 &lt;/div&gt;
 &lt;div id="topnav"&gt;
 &lt;div id="search"&gt;
 &lt;form action='&lt;?php htmlspecialchars($_SERVER["SCRIPT_NAME"]) ?&gt;' method='get'&gt;
 &lt;fieldset&gt;
 &lt;legend&gt;ebook-search&lt;/legend&gt;
 &lt;input type="text" name="keywords" value="&lt;?php echo $cookie ? /&gt;" size="65" autofocus="autofocus"&gt;
 &lt;input type="submit" name="go" id="go" value="GO" onclick="history.go(0)" /&gt;
 &lt;/fieldset&gt;
 &lt;/form&gt;
 &lt;/div&gt;
 &lt;/div&gt;
 &lt;br class="clear" /&gt;
 &lt;/div&gt;
&lt;/div&gt;
&lt;/body&gt;&lt;/html&gt;

</code></pre><!-- /codeblock -->

<p>Etwas css foo macht die Seite bunter. Und wir generieren die Eingabeform fuer die Suche.</p>

<!-- codeblock lang=php line=1 --><pre class="codeblock"><code>
&lt;?php

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

</code></pre><!-- /codeblock -->

<p>Die Eingabevariablen <em>$_GET['ItemPage']</em> brauchen wir zum "Blaettern" und die anderen Variablen fuer einen anderen Suchmodus</p>

<!-- codeblock lang=php line=1 --><pre class="codeblock"><code>

$Keywords = preg_replace("/^/", "\"", $Keywords);
$Keywords = preg_replace("/$/", "\"", $Keywords);
$Keywords = preg_replace("/,/", "\"|\"", $Keywords);

</code></pre><!-- /codeblock -->

<p>Die Keywords werden fuer die API praepariert, um auch nach mehreren Suchbegriffen suchen zu koennen</p>

<!-- codeblock lang=php line=1 --><pre class="codeblock"><code>
 $srequest = "GET\necs.amazonaws.de\n/onca/xml\n";
 $url = "http://ecs.amazonaws.de/onca/xml?";

 if ($ItemId) {
 $request = "AWSAccessKeyId=".$AWSAccessKeyId."&amp;AssociateTag=".$AssociateTag."&amp;IdType=ASIN&amp;ItemId=".$ItemId."&amp;Operation=ItemLookup&amp;ResponseGroup=".$ResponseGroup."&amp;Service=AWSECommerceService&amp;Timestamp=".$Timestamp."&amp;Version=".$Version;
 } else {
 $request = "AWSAccessKeyId=".$AWSAccessKeyId."&amp;AssociateTag=".$AssociateTag."&amp;ItemPage=".$ItemPage."&amp;Keywords=".rawurlencode($Keywords)."&amp;Operation=".$Operation."&amp;ResponseGroup=".$ResponseGroup."&amp;SearchIndex=".$SearchIndex."&amp;Service=AWSECommerceService&amp;Timestamp=".$Timestamp."&amp;Version=".$Version;
 }

 $url .= $request;
 $srequest .= $request;
 $signature = rawurlencode(base64_encode(hash_hmac('sha256', $srequest, $AWSSecretKey, true)));
 $url .= "&amp;Signature=".$signature;

</code></pre><!-- /codeblock -->

<p>Das Herzstueck der Anlage. Die Parameter werden zum API-Aufruf zusammengebaut. Dabei ist darauf zu achten, dass die Parameter in alphabetischer Reihenfolge stehen! Zum Schluss wird der Aufruf signiert</p>

<!-- codeblock lang=php line=1 --><pre class="codeblock"><code>

$response = file_get_contents($url);
$result = simplexml_load_string($response);
?>

</code></pre><!-- /codeblock -->

<p>Ab die Post und her damit. Die URL wird ueber das Internet aufgerufen und das Ergebnis in der Variable <em>$result</em> abgespeichert</p>

<!-- codeblock lang=html line=1 --><pre class="codeblock"><code>

&lt;div class="wrapper col4"&gt;
 &lt;div id="container"&gt;
 &lt;div id="content"&gt;
&lt;/div&gt;&lt;/div&gt;&lt;/div&gt;

</code></pre><!-- /codeblock -->

<p>divs als table Ersatz</p>

<!-- codeblock lang=php line=1 --><pre class="codeblock"><code>

&lt;?php

foreach ($result-&gt;Items-&gt;Item as $item) {

?&gt;
 &lt;div id="latestnews"&gt;
 &lt;ul&gt;
 &lt;li&gt;
&lt;?php
 if($item-&gt;MediumImage-&gt;URL){
 echo ("&lt;div class=\"imgholder\"&gt;&lt;a href=\"".$item-&gt;DetailPageURL."\" target=\"_blank\"&gt;&lt;img src=\"".$item- /&gt;MediumImage-&gt;URL."\" border=\"0\" alt=\"Cover\"&gt;&lt;/a&gt;&lt;/div&gt;\n");
 }
 echo "&lt;div class=\"latestnews\"&gt;";
 echo ("&lt;h3&gt;&lt;a href=\"".$item-&gt;DetailPageURL."\"target=\"_blank\" &gt;".htmlspecialchars($item-&gt;ItemAttributes-&gt;Title)."&lt;/a&gt;&lt;/h3&gt;&lt;br /&gt;\n");
 if($item-&gt;ItemAttributes-&gt;Author[0]){
 echo ("Autor: ".htmlspecialchars($item-&gt;ItemAttributes-&gt;Author[0])."\n");
 }
 if($item-&gt;ItemAttributes-&gt;Publisher){
 echo ("&lt;br /&gt;Verlag: ".htmlspecialchars($item-&gt;ItemAttributes-&gt;Publisher)."\n");
 }
 if($item-&gt;ItemAttributes-&gt;PublicationDate){
 echo ("&lt;br /&gt;erschienen: ".htmlspecialchars($item-&gt;ItemAttributes-&gt;PublicationDate)."\n");
 }
 if($item-&gt;OfferSummary-&gt;LowestNewPrice-&gt;FormattedPrice){
 echo ("&lt;br /&gt;Preis: ".htmlspecialchars($item-&gt;OfferSummary-&gt;LowestNewPrice-&gt;FormattedPrice)."\n");
 }
 if($item-&gt;OfferSummary-&gt;LowestUsedPrice-&gt;FormattedPrice){
 echo (" / erh&auml;ltlich ab: ".htmlspecialchars($item-&gt;OfferSummary-&gt;LowestUsedPrice-&gt;FormattedPrice)."\n");
 }
 if($item-&gt;DetailPageURL) {
 echo ("&lt;p class=\"readmore\"&gt;&lt;a href=\"".$item-&gt;DetailPageURL."\" target=\"_blank\" &gt;more details&lt;/a&gt;\n");
 }

</code></pre><!-- /codeblock -->

<p>Ausgabe diverser Eigenschaften des Produkts (wenn vorhanden) in einer Schleife.</p>

<!-- codeblock lang=php line=1 --><pre class="codeblock"><code>
 if($item-&gt;ASIN){
 echo "&lt;p class=\"readmore\"&gt;&lt;a href=\"".htmlspecialchars("?".
 "SearchIndex"."=". $SearchIndex ."&amp;".
 "ItemPage" ."=".$ItemPage ."&amp;".
 "Operation=ItemLookup&amp;" .
 "ResponseGroup=Similarities&amp;" .
 "ItemId" ."=".$item-&gt;ASIN).
 "\"&gt;SimilarityLookup: $item-&gt;ASIN&lt;/a&gt;\n";
 }

 if($item-&gt;SimilarProducts){
 echo "<p>";
 echo "Similar: &lt;ul&gt;";
 foreach ($item-&gt;SimilarProducts-&gt;SimilarProduct as $similarproduct) {
 echo "&lt;li&gt;&lt;a href=\"".htmlspecialchars("?".
 "ItemId" ."=".$similarproduct-&gt;ASIN."&amp;".
 "Operation=ItemLookup&amp;" .
 "ResponseGroup=ItemAttributes") .
 "\"&gt;".$similarproduct-&gt;Title."&lt;/a&gt;&lt;/li&gt;";

 }
 echo "&lt;/ul&gt;";
 echo "</p>";
 }
?&gt;
&lt;?php
}
?&gt;
</code></pre><!-- /codeblock -->

<p>Hier koennen similare Produkte weiter nach Similaritaeten durchsucht werden</p>

<!-- codeblock lang=php line=1 --><pre class="codeblock"><code>

&lt;div id="container"&gt;
 &lt;div id="content"&gt;
&lt;?php

foreach ($result-&gt;Items-&gt;Request as $found) {
 echo ("&lt;h3&gt;Page ".$found-&gt;ItemSearchRequest-&gt;ItemPage."&lt;/h3&gt;\n");
 $SearchIndex = ($found-&gt;ItemSearchRequest-&gt;SearchIndex);
 $Keywords = ($found-&gt;ItemSearchRequest-&gt;Keywords);
}


foreach ($result-&gt;Items as $results) {
 echo ("Results total: ".$results-&gt;TotalResults);
 echo (" on ".$results-&gt;TotalPages. " pages");
}

$TotalPages = ($results-&gt;TotalPages);
$SearchIndex = ($found-&gt;ItemSearchRequest-&gt;SearchIndex);
$Keywords = ($found-&gt;ItemSearchRequest-&gt;Keywords);
$ItemPage = ($found-&gt;ItemSearchRequest-&gt;ItemPage);
$Keywords = preg_replace("/[ ]/", "+", $Keywords);

if ($TotalPages &gt; 1) {
 if ($ItemPage*1 &lt;= $TotalPages) {
 echo "&lt;p class=\"readmore\"&gt;";
 echo "&lt;a class=\"fl_right\" href=\"".htmlspecialchars("?".
 "SearchIndex"."=". $SearchIndex ."&amp;".
 "Keywords" ."=". $Keywords ."&amp;".
 "ItemPage" ."=".($ItemPage +1)).
 "\"&gt;next&lt;/a&gt;\n";
 }
}
?&gt;
 &lt;div id="coloumn"&gt;
 &lt;a href="&lt;?php echo $_SERVER["SCRIPT_NAME"];?&gt;"&gt;new search&lt;/a&gt;
 &lt;br class="clear" /&gt;
 &lt;/div&gt;
&lt;/div&gt;
&lt;/div&gt;
&lt;?php

}

</code></pre><!-- /codeblock -->

<p>Am Schluss erfahren wir, wieviel Suchtreffer es gibt und bereiten die "Blaetterfunktion" vor, um weitere Ergebnisse anzeigen zu koennen</p>

<p><strong>Fertig!</strong> Das Script in Aktion finden wir auf <a href="http://ebooks.eumel.de" target="_blank">ebooks.eumel.de</a>. Und wie wir die Kindle-Buecher ins Tolino reinbekommen, steht auf <a href="http://blog.eumelnet.de/blogs/blog6.php/main-1/tolino-kindle-unsupported" target="_blank">unsupported.eumel.de</a></p>
