---
layout: post
tag: inet
title: 2023 - The year in Open Source
subtitle: The annual review to take part
date: 2023-12-29
author: eumel8
---

# Entry

This year too, open source was part of daily interaction. I am no longer exclusively active in selected open source projects. Instead, it comes as it comes or as the need arises. Experiences over the last 12 months have been mixed. There have been ups and downs, is open source still worth it? Let's take a closer look.

# Rancher Project Monitoring

Let's start with the absolute low point: [Prometheus-Federator](https://github.com/rancher/prometheus-federator), a new tool to replace the Rancher Project Monitoring V1, which in turn is necessary to run Rancher to operate version 2.7. The heart of the system is a Helm Chart Operator, like the one already used in Ranchers K3s. The user can manage a HelmChartConfig resource, which the Helm Chart operator then uses to control the Prometheus operator.

As a provider of managed Kubernetes services, we wanted to offer this Project Monitoring V2 to users and installed it on clusters with 50-80 projects. Numerous security holes had to be plugged beforehand, which would have weakened the project isolation. This is surprising since Rancher itself offers this isolation. Numerous support tickets and Github issues remained unprocessed. In the end, only our own fork was able to run.

At first it looked quite good if you had to live with the restriction that the user had no access to the operator logs and the status was reported back rather poorly. Due to the cluster-wide operator, there were also cluster-wide failures, for example when an incorrect HelmChartConfig was applied. The user doesn't even recognize the error because he doesn't receive any feedback after the apply.

The absolute disaster began with increasing use. In every operator there is a refresh function, the so-called reconciling. The Prometheus Federator needed more and more resources and sometimes crashed. Since it works in a stateless manner, it starts over again, but apparently forgot a few labels that it uses to declare its ownership of the Kubernetes resource. In one scenario, he simply deleted all resources that he no longer owned. As a result, the user loses all of their monitoring.

In another scenario, resources such as RoleBindings remained, which could no longer be overwritten by the operator and had to be deleted manually. Since this happened several times a day on different clusters, cron jobs were developed to correct this automatically. The user's monitoring was nevertheless briefly deleted and then automatically reinstalled if the user does not do so in the meantime. It was maddening.

After 6 months the ripcord was pulled. We developed a slim [Helm Chart Bundle](https://github.com/caas-team/caas-project-monitoring), which includes the open source kube-prometheus-stack. Any user with project rights can install this in Rancher.


Another tool [Prometheus-Auth](https://github.com/caas-team/prometheus-auth) was helpful. This proxy service is placed in front of the cluster Prometheus, which can be reached via bearer token and federation and provides corresponding metrics for dedicated namespaces, which is authenticated via the ServiceAccount token. In Kubernetes 1.21 the token format changed, which is why Prometheus-Auth no longer works for RKE1 clusters. This could be fixed with minimal knowledge of Go. The project is now deprecated at Rancher, which is why we continue to manage our own fork.

# Prometheus Webex Alertmanager

With the new monitoring, new functions also came into operation, such as the AlertmanagerConfig, i.e. a configuration on how I can notify alarms from Prometheus. The Prometheus operator already knew a lot of notification options: email, Skype, with Webhook you could create a [Webex authentication](https://github.com/mcsps/alertmanager-webhook-webex-teams/). Someone had already implemented the program logic in the Prometheus Operator, but the API implementation was missing to use it directly as AlertmanagerConfig. Since there are already other notification options, it was limited to copying lines of code and functions. Nevertheless, it took [8 months]( https://github.com/prometheus-operator/prometheus-operator/pull/5305) until the new release included the feature and could be used. A difficult journey, but still a great success.

# Cosignwebhook

Also an open source project, which [started at the beginning of the year](https://github.com/eumel8/cosignwebhook/releases/tag/0.0.1).

According to security regulations, container images should be signed and the signature verified before use. After the Notary V1 process, there was an evolution of Sigstore that made it possible to store the signatures together with the container image in the same registry. A number of tools offer the verification function, but as usual it fails due to the tenant capability. During the evaluation, various pull requests were submitted for improvements, and the problem of multi-tenant capability was also recognized in issues, but it will probably take some time because the architecture has partially maneuvered itself into a dead end.

All we need is a small webhook that reacts to the creation of pods and verifies the container images used with the supplied public key. A few lines of code, that's how it started at the beginning of the year. We have now developed a level of maturity with version 4 that covers code tests and end-to-end tests. User requirements are implemented directly and errors can be fixed on a daily basis.

# Kube-Logging

Speaking of daily updates. A notable open source project, which again has something to do with Rancher, is [Kube Logging](https://github.com/kube-logging/). It is better known as Banzai Cloud, has had different owners and is now back, or still, with the original development team under the new name Axoflow in Hungary.

Banzaicloud was also used in Rancher as a means to an end to give the user the opportunity to have logs from their containers collected and sent to their logging service via the logging operator. As with monitoring, the operator approach, if it operates cluster-wide, carries the risk that cluster-wide logging services will be affected if a project logging is incorrectly configured or the endpoint fails. We called the phenomenon “The Noisy Neighbor.” With Axoflow we have found a competent software supplier who operates exclusively open source. New features benefit everyone, Github issues were responded to within hours and solutions were provided through bug fixes or new releases. New resources were also invented that support the ability to mandate, i.e. everything to make the world a little better. For me the software project of 2023.

# Ast Sort Docs

Btw, when reading the Kube logging documentation, it always bothered me that parameters for a function are always listed in a jumbled manner, just as they were added over time during program development and were simply appended to the corresponding type definitions in the code. I had just started sorting these [types in code](https://github.com/kube-logging/logging-operator/pull/1409), which would have made me an absolute top contributor, but the maintainers didn't like that. Instead, the problem should be solved programmatically.

Admittedly, these [25 lines of code](https://github.com/cisco-open/operator-tools/pull/188) actually come from ChatGPT, some in-house development and testing is of course included. The result can then be viewed [here](https://kube-logging.dev/docs/configuration/crds/v1beta1/flow_types/). Everything sorted alphabetically.

# Canary-Bot/Sparrow

Another highlight this year was the change in the team to Open Source. Of course, we have a lot of Git repos internally that are used to manage the cluster landscapes. But the fact that software is developed directly publicly on Github was new.
On the one hand, there is the [Canary Bot](https://github.com/telekom/canary-bot/), a monitoring tool to measure latencies between different clusters or environments.

Later in the year the [Sparrow](https://github.com/caas-team/sparrow/) was added, a slightly more stripped-down version with a slightly different use case. My personal contributions were the Helm Charts for installing the birds. It was interesting to observe the technical progress that had been made over the months. It wasn't just copying code, but rather incorporating experiences and new features from Helm. The whole thing was perfected in the team review. This also brings all team members to the same level of knowledge if, for example, they do not understand a function or can contribute a better solution. Great. And priceless.

In our [Github organization](https://github.com/caas-team) there are now a wealth of repos such as use cases that are intended to represent or simplify the use of our services.

# No space left on device

Funny incidents from the world of container operations. In June, users were faced with the message "no space left on device" when starting their workload in the Kubernetes cluster. The message was a bit misleading as there was enough storage space on the nodes. It took a while to figure out the cause and led us into the world of the overlay file system. The number of mounts on the nodes had been exhausted (at least 100,000 by default), which was caused by the cloud provider's management software, which happily nested itself in the overlay mounts of the containers and remounted all the mounts of the computer that were found there.

The [problem description](https://github.com/moby/moby/issues/45760) only brought a weary smile from the Docker maintainers - it had long since been fixed in the next version of Docker. It's your own fault if you're still running such an old version. The actual culprit with the management software is fine again. Really!

# Vcluster

Vcluster was also on the agenda this year and integrating the technology into the portfolio. Of course, it didn't work right away [either](https://github.com/crossplane-contrib/provider-helm/issues/199). That's what you have to live with in the Open Source world: that no one is interested in your problems. There's [something like that](https://github.com/rancher/rancher/issues/39778), or [something like that](https://github.com/minio/minio/pull/18296), or [something like that] (https://github.com/JiangKlijna/web-shell/pull/13). As you can see, there are also well-known projects with 13,000 Github Stars. But what use is it if you close PR without comment or ignore it for months? These are such doubts about the Open Source idea. Either you have risen to the high-flyer category (Github Status: I'm very busy) or the project is orphaned because the maintainers are no longer there. People with a sense of order at least set the status of such projects to "archived" and put a note in the readme. It's always worth checking out the project you're interested in:

- When was the last release?
- Is there even a release or artifacts such as compiled software versions or finished container images?
- When was the last commit?
- How many open PRs and issues are there?
- How old are these?
- How many maintainers are there and how active are they?

Maybe you will also read that help is needed and you can contribute something permanently to this project. I've also decided to permanently fork the project and live on with my fork. Of course, the intention is not to continue maintaining the software yourself, but sometimes there is no other option.

The important thing is not to give up and not to get discouraged. A majority of people are happy when they get help or find a [comment](https://github.com/traefik/traefik/issues/7112#issuecomment-1870903221) about the solution on Github. Sometimes [the horse is simply dead](https://github.com/b2evolution/b2evolution/issues/105), so it doesn't help to get back in the saddle again and again. I switched my blogs from B2evolution to Github Pages (https://unsupported.eumel.de/2023/07/17/b2evo-unsupported-2.html).

There you can also find the article about [Vcluster](https://k8sblog.eumel.de/2022/12/14/vcluster-in-rancher-mit-crossplane.html). The implementation in Rancher is pretty cool. It began a study at the end of 2022 before being used productively this year.

# CaaS Carbon Footprint

Another cool project before the end of the year: [CaaS Carbon Footprint](https://github.com/caas-team/caas-carbon-footprint), also known as GreenOps.

Measuring power consumption is easier with a washing machine than with a Kubernetes cluster. After years of scientific research, the breakthrough has now been achieved and with Kepler there is a way to determine the power consumption down to the pod in the Kubernetes cluster in real time.

On the other hand, electricity is generated from various sources. Of course, renewable energy is desired, but that doesn't always work. In Germany we are too dependent on wind and sun. But when the wind blows, there is up to 86% of renewable energy in it. And you should use these too. Otherwise the energy has to be thrown away because we cannot store it. Caas Carbon Footprint brings these two metrics together and motivates moving power-intensive workloads to times when renewable energy is in abundance (>80%). Of course, it's not possible for every workload, but there are definitely use cases. With this project we are making an active contribution to climate protection.
And that will continue next year.
