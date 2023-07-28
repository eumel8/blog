---
layout: post
tag: openstack
title: Recap Open Infrastructure Summit Denver 2019
subtitle: "The first Open Infra Structure Summit Denver Spring 2019 has just ended after the last OpenStack Summit Berlin 2018, the original."
date: 2019-05-13
author: eumel8
---

The first Open Infra Structure Summit Denver Spring 2019 has just ended after the last OpenStack Summit Berlin 2018, the original.

<br/>
The facts straight away: It was the summit with the fewest visitors. 2000 were registered, only 1200 made it to the keynote. Normally the US Summits are among the better attended, not so in Denver. The participants got lost in the huge Colorado Convention Center on 14th Street in Denver, a fire alarm shortly before the keynote seems to be a bad omen. The keynotes themselves: Jonathan Bryce himself limited his speaking time to 19 minutes, in which he mostly told about his childhood and how he got to RackSpace. Now he has been Executive Director of the OpenStack Foundation for 8 years and his goal is clear: "Fight for the users". 

<img src="/blog/media/quick-uploads/p676/20190429_091736.jpg" width="585" height="386"/>

and the declaration of the 4 Open's. 

Open Source
Open Community
Open Development
Open Design.


<img src="/blog/media/quick-uploads/p676/20190429_091702.jpg" width="585" height="386"/>

But the whole thing is revised a little later by the sponsor keynote of Intel, held by Melissa Evers-Hood, who simply adds a 5th Open to it: 

<img src="/blog/media/quick-uploads/p676/20190429_102940.jpg" width="585" height="386"/>

Certainly right in the idea, but in sum somewhat scattered. Also the newly propagated number of community members of 105,000 can be revised in the same breath: Only 1468 have actually contributed something to the OpenStack software with code commits, i.e. 1.3 %.

So what's going on at OpenStack? Is this the beginning of the end, after the renaming of the event (you weren't even sure if it was the Open Infrastructure Summit or the Open Infra Summit)? Code store and code review systems are called https://opendev.org. from now on.

OpenStack has grown up. At the latest this summit has shown that there are no major developmental innovations. While the core projects like Nova, Cinder and Neutron are in quite good shape and have a solid, colorful developer base around them, other projects lie fallow or complain about lack of encouragement or too much one-sidedness, because a vendor has taken over the project completely.

On the other hand, the new projects Airship and StarlingX flow under the umbrella of the OpenStack Foundation to use its marketing and infrastructure, whereby the newly added gate check system Zuul has been part of the OpenStack CI/CD system for a long time and is also developed and operated by the same people. Not surprisingly, it gets official project status outside the OpenStack domain. Zuul consistently relies on the use of Ansible. 

<img src="/blog/media/quick-uploads/p676/20190429_104215_0_.jpg" width="585" height="386"/>

Virtual machines can also be started in other CI/CD systems such as Gitlab Runner or Travis, but only in Zuul there are already ready-made job templates that can be used or extended by the user.

The <a href=" https://docs.google.com/presentation/d/1Lq2X__xxRhrAaWDeDmQ6jfhhXhWvxjYNY0XnJlXwBV8/edit#slide=id.g58e7c76f24_0_858">Slides of the Technical Committee </a>gut summarize what else was new:

They focus more on core topics like Ironic (Bare Metal Provisioning) and Keystone (Authentication Service). Stabilization and better user-friendliness such as the newly invented Upgrade Checker are in the foreground.
And this is also the only way to achieve a mature industrial product: to gather user experience, to "improve the customer experience", as the saying goes. 

Dr. Bucher has summarized this well in the Deutsche Telekom Keynote: Day-2-Operations - without going into it in detail now, the 10 minute time slot didn't give that away. 

<img src="/blog/media/quick-uploads/p676/20190429_100058.jpg" width="585" height="386"/>

But this is the field of local user groups, whose organization has something new:
The portal groups.openstack.org will be abolished and all downstream activities will be bundled under the Meetup page https://meetup.com/pro/osf .
Meetup has always had OpenStack user groups, but you had to search for them explicitly. The new site has group activities at a glance. The idea is to better exchange information material for Meetups and Workshops and maybe find an interesting speaker for your region. We will see how it works this year.

The word at the end of the best keynote this year by canonical Mark Shuttleworth (Canonical Sponsor-Keynote).

<img src="/blog/media/quick-uploads/p676/20190429_104709.jpg" width="585" height="386"/>

"The revolution has got legs," he said. 10 years of OpenStack are to be celebrated, 15 years of Ubuntu. It is a reason for
the community to concentrate even more on the project. No reason to look for the midlife crisis and new fancy projects.
Even a vendor is obliged to be open. And there the circle closes again to the 4 Opens.

[video:youtube:s2kxHFLc_XA?t=508]

Picture gallery:

Marketplace Impressions

<img src="/blog/media/quick-uploads/p676/20190501_103154.jpg" width="585" height="386"/>

<img src="/blog/media/quick-uploads/p676/20190501_103302.jpg" width="585" height="386"/>

<img src="/blog/media/quick-uploads/p676/20190501_103441.jpg" width="585" height="386"/>


My personal topic 2019 Business Model of Open Source

<img src="/blog/media/quick-uploads/p676/20190501_091413.jpg" width="585" height="386"/>

<img src="/blog/media/quick-uploads/p676/20190430_160823.jpg" width="585" height="386"/>

<img src="/blog/media/quick-uploads/p676/20190430_165116.jpg" width="585" height="386"/>

PTG - and what the user survey thinks of it

<img src="/blog/media/quick-uploads/p676/20190502_175000.jpg" width="585" height="386"/>

<img src="/blog/media/quick-uploads/p676/20190502_125141.jpg" width="585" height="386"/>

<img src="/blog/media/quick-uploads/p676/20190501_144227.jpg" width="585" height="386"/>

List of interesting Etherpads:

https://etherpad.openstack.org/p/docs-i18n-project-onboarding-denver
https://etherpad.openstack.org/p/DEN-openlab-whats-next
https://etherpad.openstack.org/p/CommunityLeadership-Denver2019
https://etherpad.openstack.org/p/DEN-ops-war-stories-LT33243267
https://etherpad.openstack.org/p/DEN-ptl-tips-and-tricks
https://etherpad.openstack.org/p/DEN-Operator-end-user-Public-cloud-feedback
https://etherpad.openstack.org/p/DEN-drive-common-goals
https://etherpad.openstack.org/p/OIS-PTG-denver-feedback
https://wiki.openstack.org/wiki/PTG/Train/Etherpads
