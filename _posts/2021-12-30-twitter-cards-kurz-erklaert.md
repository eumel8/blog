---
layout: post
tag: general
title: Twitter Cards kurz erklärt
subtitle: "Manche Sachen passieren einfach so. Man hält sie schon für selbstverständlich. Doch wenn man genauer hinguckt, ist alles ganz anders. Heute wird Twitter Cards kurz erklärt."
date: 2021-12-30
author: eumel8
background: '/images/twitter-cards.jpeg?4362984378'
twitter: 'images/blog-eumel-de.png?4362984378'
---

Manche Sachen passieren einfach so. Man hält sie schon für selbstverständlich. Doch wenn man genauer hinguckt, ist alles ganz anders. Heute wird Twitter Cards kurz erklärt.
<br/>
Was ist Twitter Cards? Normalerweise sind Twitternachrichten reine Textnachrichten. Deswegen heisst er auch Textnachrichtendienst. Die Anzahl der Zeichen ist auch noch begrenzt - 140, glaube ich. Wurde auch vor paar Jahren mal erhöht, was einer Revolution gleich kam, weil vorher waren es noch weniger. Die Kunst besteht also dadrin, soviel wie möglich Informationen auf kleinstem Raum unterzubringen. Erinnert so ein bischen an <a href="https://de.wikipedia.org/wiki/V.90#V.92">56k Modem</a>. Mittlerweile erlaubt Twitter auch Bilder in Tweets, sogar mehrere (ganze 3 Stueck!). Ein Bild sagt bekanntlich mehr als Worte und so ist so ein Hinweis auf einen kürzlich verfassten Blogpost gleich viel ansprechender:

<img src="/images/quick-uploads/twitter-cards-kurz-erklaert/2021-12-30_2_.png" width="585" height="386"/>

Bislang erlag ich der Annahme, dass Twitter einfach das erste Bild (Teaser) heranzieht, um das im Tweet einzubetten. Nee, ist es nicht.

Dann dachte ich, dass die Social Media Sharing Dienste wie Shareaholic und Sharethis zusammenbasteln. Nee, ist es auch nicht.

Das Feature nennt sich Twitter Cards und ist auch in der <a href="https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started">Developer Dokumentation</a> beschrieben. Im Prinzip werden im HTML-Header des Blogposts META-Anweisungen hinterlegt, die Twitter beim Einfügen der URL im Tweet abruft und auswertet. Bei B2Evolution oder Wordpress gibt es Social Media Plugins. Wenn man Github Pages mit Jekyll oder Hugo verwendet, kann man sich das auch plain zusammenbasteln:

```html
<meta property="og:url" content="https://blog.eumelnet.de/blogs/blog8.php/kubernetes-ipv6-jetzt-gehts-los" />
<meta property="og:description" content="Hurra! Kubernetes 1.21 ist da! Und damit endlich eine Implementierung von IPv6 DualStack in K3S. IPv6 kann also zusammen mit IPv4 betrieben werden. Nun, was bedeutet das genau? Schauen wir uns das in der Praxis unseres Heimnetzwerkes an." />
<meta property="og:site_name" content="blog.eumel.de" />
<meta property="og:image" content="images/blog-eumel-de.png?mtime=1594142083" />
<meta property="og:image:height" content="851" />
<meta property="og:image:width" content="315" />
<meta property="twitter:card" content="summary_large_image" />
```

Es gibt also eine Meta Property "twitter:card", welches das grundsaetzliche Aussehen des Tweets bestimmt (siehe Dokumentation).
Die anderen sind <a href="https://ogp.me/">Open Graph Tags (og)</a>, auch eine Entwicklung, die an mir vorbeigegangen ist. Dieser <a href="https://support.sendible.com/hc/en-us/articles/115000159366-How-are-link-previews-handled-by-the-different-social-sites-">englischsprachige Blogpost</a> erklärt das in Tiefe und auch für andere Social Media Dienste.
Man kann aber auch klein anfangen wie mit dem "og:image" Tag, indem sich tatsaechlich der Link zu unserem Blogbild hier befindet.

Twitter bietet auch noch <a href="https://cards-dev.twitter.com/validator">diesen Validierungsdienst</a> an, bei dem an einfach die URL eingibt, die man zu posten gedenkt und diese dann auf Fehler analysiert wird (siehe Logoutput). Auch die Groesse des Bildes kann man begutachten und entsprechend aendern, wenn man nicht damit zufrieden ist. 

Dem perfekten Tweet kann dann nichts mehr im Wege stehen!
