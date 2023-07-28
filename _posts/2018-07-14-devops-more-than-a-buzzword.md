---
layout: post
tag: cloud-computing
title: DevOps - more than a modern buzzword thriller
subtitle: "My last blog post about DevOps is now over 6 years ago. At that time, it was still about shadow IT and the constant trench war between development and operation. By now I am a member of a DevOps team, which is a paradox in itself, because there are no&hellip;"
date: 2018-07-14
author: eumel8
---

My last blog post about DevOps is now over 6 years ago. At that time, it was still about shadow IT and the constant trench war between development and operation. By now I am a member of a DevOps team, which is a paradox in itself, because there are no such things as DevOps teams. Instead, it's about the flow.
<br/>
<img src="/images/quick-uploads/p616/flow.jpg" width="585" height="386"/>
Today, IT should be something like a river, a river of work. So the <strong>first of three ways</strong> out of the <strong>"Phoenix Project"</strong> is described. Continuous Integration, Continuous Delivery and Continuous Deployment are the keywords here. Developers should always check their code into a repository, so that the software is constantly in a deliverable state and can be rolled out automatically after performing various tests. Everything is so nice in the flow.
The <strong>second way</strong> is feedback. Feedback is obtained, for example, through the automated tests. If they pass through without error, an OK will be returned. Otherwise there is an error message. Monitoring or evaluation of logfiles are also part of the feedback. Peer reviews when programming are feedbacks. Many components of ITIL, such as change, incident and problem management, describe feedback loops, as well as knowledge management.
The <strong>third way</strong> is already the king class: Continuous Experimentation and Learning. Lifelong learning, you hear nowadays more often. In this way, always looking for improvements. <strong>Deming Cycle</strong> is a keyword here (Plan-Do-Check-Act). <strong>Improvement Kata</strong> is also such a buzzword here. I would describe it as a way of small goals. You should always have a smaller goal in mind and not tinker for months or years on something big. For example, a vision helps what you actually want to achieve. These should be defined at the beginning of the third way.
Okay, and <strong>who</strong> are these DevOps now? Dev are, for example, the <strong>customers</strong> (yes, right!), architects, analysts, business people, product managers, project managers, testers, suppliers. Of course developers are also part of it, because of course they are involved in the development of software products and services. But more important here is the business. IT is not an end in itself. The money comes from the business and as it is so often: Follow the money.
On the Ops page are all persons who are entrusted with the delivery and the care of the software and services. So all kinds of administrators (network, security, databases, services), customer service, suppliers.
These two groups have been on the <strong>Wall of Confusion</strong> so far. One is extremely focused on change, the other group wants stability. Why stress the topic further?
Well, the world out there is turning faster and faster. Information are exchanged faster, products come to market faster, services get new functions that the customer is asking for or about which he has not even thought about. If you do not want to be left behind, you need a high-performance IT that can deliver fast but error-free.
The <strong>Theory of Constraints</strong> is n the first path still in the way, described in the book <a href="https://www.amazon.com/Goal-Process-Ongoing-Improvement/dp/0884271951/">The Goal</a>. Briefly explained: Every process has its bottleneck and therefore can only be as fast as this one. For example, a constraint can be a delayed software delivery, a server environment that is not yet finished, failed tests, but also complex and bureaucratic processes. Improving this bottleneck is the fastest way to improve the whole production process.
Okay, and <strong>what</strong> is this DevOps now? <strong>DevOps = CAMS (Culture, Automation, Measurement, Sharing)</strong>
<strong>DevOps is culture</strong>. Yes! No! DevOps is everything together. If I automate everything, that's very nice, but it's only 25% of the DevOps principle.
DevOps is culture. Yes, and as it has been so far, our culture is many thousands of years old. Only one will not need so long for a DevOps culture, but from today to tomorrow that will not work either.<strong> Cultural Dept </strong> is also called what has been built up for years, silo organizations, silo thinking, isolated teams.
Above all, culture is trust for me. Trust and respect. Transparency belongs to it like an open opinion. Collaboration and sharing still counts, we will come back again. Pride of work. We have summarized this as #Werkstolz. Actually quite funny that there are already many facets of DevOps everywhere, so the culture has already begun to change. The best way is to involve people. Starting with improved tooling like ChatOps, where people get together in Slack channels, Hipchat or IRC and also robots posting status messages in the current channel. 
Team building is back on the agenda, because only those who know each other will be happy. Internal DevOps days help with an exchange and a common understanding, as well as job shadowing, hackathons and simulations. One Team, One IT are even more headlines, but as already mentioned: The people have to want that too, otherwise it will not work and the next step can save you. We have already read about automation above. To CI/CD, there is this beautiful infographic of Gitlab, an automation tool for code management: 

<img src="/images/quick-uploads/p616/cicd_pipeline_infograph.png" width="585" height="386"/>

Very beautiful is the flow of writing from the code to take off the rocket. What other tools still help Xebialabs has shown in a <a href="https: //xebialabs.com/periodic-table-of-devops-tools/">periodic table</a>: 

It's even worth pointing out that you can use <strong>Open Source Tools</strong> should prefer the selection of its tools for DevOps. 
<strong>Lean</strong> also belongs to the subject of measurement. Lean Thinking means creating added value from the perspective of the end customer. There is also a value stream from the customer request to the delivery of the feature or product. It should eliminate any kind of waste (waste). Waste is also referred to as <strong>Muda</strong>, variants are Muri and Mura and sign in the sources of the waste (Source of Waste). For example, this could be defects, overproduction, waiting times, transport times, inventory, excessive processes. Avoidance of Waste pays for <strong>Kata Improvement</strong> (see above). As we may have already realized, DevOps can not stand alone. We have already recognized components of ITIL at the very top. We have just read from Lean. 
And of course <strong>Agile</strong> is one of them, the phrased word for agility. 
Actually, I only knew the term from <a href="https://www.youtube.com/watch?v=LbQZ4FGv9ugTo">dog sports</a>: [video:youtube:LbQZ4FGv9ug] 

React quickly to events and situations that belong to <strong>Agile Service Management</strong>. 

The two best known working methods are <strong>Scrum</strong> and <strong>Kanban</strong>. Scrum in a sentence explains: There are different roles: Scrum Master, Product Owner, Scrum Team, there are various meetings: grooming, daily, retrospective, working in sprints, which is a time-limited mini-project phase and work becomes one Scrum board visualizes where a thousand small pieces of paper are attached. 
Kanban also has a board, the so-called Kanban board. Horizontal columns show the flow of work. Starting from what to do (ToDo), what's being done (InProgress) and what's done (Review/Done). Anyone working in the Kanban team "pulls" the task that they want to work on. Kanban itself is not very collaborative. Rather, it's about work organization and planning. At Kanban you should always be able to make statements about when a job is done. 
But enough of the work. Let's move on to the last part of DevOps: <strong>Sharing</strong>. Sharing knowledge, troubleshooting and use cases, leasons learned is not the head of DevOps. As I wrote above, it is an integral part. <strong>The culture of sharing</strong> can be shaped in many ways: code sharing on Github, blog posts, video tutorials on Youtube, internal DevOps days, local Meetups, Summits. 
Other methods like <strong>Working Out Loud (WOL)</strong>. WOL is briefly explained here by the inventor <a href="https://www.youtube.com/watch?v=7l3azE-eis4">John Stepper</a> and is especially interesting for not so extroverted people. In small groups (circle), people meet to reach each of them for a specific goal over a period of 12 weeks and to let others in the group participate in it. The experiences and results are shared. 

At this point also the circle of DevOps closes. Earlier, I wrote about using open source software. But where does this software come from? The Open-Source-Community only lives by sharing, without which it would not be possible.

And <strong>how</strong> does DevOps work? John P. Kotter described this in his book "Leading Change": 

"Leadership defines what the future should look like like, aligns people with that vision, and inspires them to make it happen despite the obstacles."

For DevOps, management must give it a green light. There must be a sense of urgent. A strategy and a vision must be formulated and widely communicated. Profitable goals should be achievable at short notice. Experimenting and trying out are part of it.
