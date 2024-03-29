---
layout: post
tag: cloud-computing
title: Open Telekom Cloud - Connect Cheat Sheet
subtitle: "Open Telekom Cloud (OTC) is a public cloud service based on OpenStack powered by Deutsche Telekom. [1] Sometimes people ask: is it OpenStack? Or not? The answer is: Of course,yes. No. Maybe. I'm afraid. One thing is certain: #OTC #RunsOnOpenstack&hellip;"
date: 2017-06-11
author: eumel8
---

Open Telekom Cloud (OTC) is a public cloud service based on OpenStack powered by Deutsche Telekom. [1] 
Sometimes people ask: is it OpenStack? Or not? The answer is: Of course,yes. No. Maybe. I'm afraid.
One thing is certain: #OTC #RunsOnOpenstack
Technology is provided by Huawei, one of the Top 4 contributor in OpenStack [2]. So you have core technology with slightly different services in OTC. Now there are different ways to connect to the cloud:
<br/>

<img src="/images/quick-uploads/p590/otc-connect.png" width="585" height="386"/>

<h1>1. The openstack client</h1>

Doing a 

```bash
apt-get -y install curl git ansible python-openstackclient
`` 

to install. Further there is a standard way to store configuraton data: os-client-config [3] Doing some shell commands:

```bash
mkdir -p ~/.config/openstack
touch ~/.config/openstack/clouds.yml
chmod 600 ~/.config/openstack/clouds.yml
vi ~/.config/openstack/clouds.yml
```

clouds.yml
```yaml
clouds:
 otc.10000:
 auth:
 auth_url: https://iam.eu-de.otc.t-systems.com:443/v3
 username: xxxxxx
 password: xxxxxx
 project_name: eu-de
 project_domain_name: Default
 user_domain_name: OTC-EU-DE-00000000001000010000
 region_name: eu-de
 otc.19720:
 auth:
 auth_url: https://iam.eu-de.otc.t-systems.com:443/v3
 username: xxxxx
 password: xxxxx
 project_name: eu-de
 project_domain_name: Default
 user_domain_name: OTC-EU-DE-00000000001000019720
 region_name: eu-de
```

For multiple mandants are multiple chapter. Configure username, password and user_domain_name. 

Test:

```bash
openstack --os-cloud otc.19720 server list
```

<h1>2. Python OTC-Client</h1>

The tool is similar built like the openstack client. From the feeling you have the same usage. Installation:

```bash
apt-get -y install python-pip
pip install python-otcclient
```

And configuration:

```bash
mkdir -p ~/.otc
touch ~/.otc/config
chmod 600 ~/.otc/config
vi ~/.otc/config
```
 
config

```
[otc]
# otc_access_key_id = yyyyy
# otc_secret_access_key = yyyyy
username = xxxxx
apikey = xxxxx
domain = OTC-EU-DE-00000000001000019720
```

<em>apikey</em> means here <em>password</em>. There were some changes in the authorization in the past. 

Test
```
otc ecs describe_instances
```

<h1>3. Bash OTC-Tools</h1>

This was the first developement of a cli tool for OTC and it's still supported. OpenStack environment variables are used but the usage of the tool is very different.

Installation: 

```bash
apt-get -y install curl git libs3-2 jq
git clone https://github.com/OpenTelekomCloud/otc-tools.git
touch ~/.otc_env.sh
chmod 600 ~/.otc_env.sh
vi ~/.otc_env.sh
```

otc_env.sh

```bash
OS_USERNAME=xxxxx
OS_PASSWORD=xxxxx
OS_USER_DOMAIN_NAME=OTC-EU-DE-00000000001000019720
OS_PROJECT_NAME=eu-de
OS_AUTH_URL=https://iam.eu-de.otc.t-systems.com/v3
```

Test connection:

```bash
cd otc-tools
./otc.sh ecs list
cd ~
```

<h1>4. Ansible for Open Telekom Cloud</h1>

Ansible is more an tool for automation things or machine to machine connection. But also operator can run task on OTC. 
Installation:

```bash
add-apt-repository -y ppa:ansible/ansible
apt-get update
apt-get -y install curl git ansible python-jmespath python-netaddr libs3-2
git clone https://github.com/eumel8/ansible-otc.git
cd ansible-otc
cp secrets.yml _secrets.yml 
cp ecs_secrets.yml _ecs_secrets.yml 
cp elb_secrets.yml _elb_secrets.yml
ansible-vault edit _secrets.yml --vault-password-file vaultpass.txt
```

Configuration: 

```
USERNAME: "xxxxx"
PASSWORD: "xxxxx"
DOMAIN: "OTC-EU-DE-00000000001000019720"
```

Test connection

```bash
ansible-playbook -i hosts ecs.yml --vault-password-file vaultpass.txt
```

As you can see; many roads lead to Rome

Try your best. The OTC Connect Cheat Sheet can you found at [4]

[1] [https://open-telekom-cloud.com/](https://open-telekom-cloud.com/)
[2] [http://stackalytics.com/?metric=commits](http://stackalytics.com/?metric=commits)
[3] [https://docs.openstack.org/developer/os-client-config/](https://docs.openstack.org/developer/os-client-config/)
[4] [https://github.com/eumel8/ansible-otc/blob/master/CONNECT.md](https://github.com/eumel8/ansible-otc/blob/master/CONNECT.md)
