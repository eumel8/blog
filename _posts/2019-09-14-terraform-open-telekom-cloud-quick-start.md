---
layout: post
tag: cloud-computing
title: Terraform Open Telekom Cloud Quick Start
subtitle: "Terraform bietet eine Moeglichkeit, den Zustand von Cloud Infrastruktur zu beschreiben und jederzeit den Wunschzustand wiederherzustellen, zu erweitern oder alles wieder zu zerstoeren. Zur besseren Bedienung in verschiedenen Clouds gibt es Provider.&hellip;"
date: 2019-09-14
author: eumel8
---

<a href="https://www.terraform.io/">Terraform</a> bietet eine Moeglichkeit, den Zustand von Cloud Infrastruktur zu beschreiben und jederzeit den Wunschzustand wiederherzustellen, zu erweitern oder alles wieder zu zerstoeren. Zur besseren Bedienung in verschiedenen Clouds gibt es Provider. Hier erklaert der <a href="https://www.terraform.io/docs/providers/opentelekomcloud/index.html">OpenTelekomCloud Provider</a> und der Erstellung einer VM (ECS) mit allen erforderlichen Resourcen.
<img src="/blog/media/quick-uploads/terraform-open-telekom-cloud-quick-start/terraform.png" width="585" height="386"/>
<br/>
Terraform erwartet eine bestimmte Dateistruktur, um seine Funktion zu entfalten.

<strong>
main.tf</strong>
Das ist das Herzstueck von Terraform. Hier wird beschrieben, welche Resourcen benoetigt werden, welche Parameter gesetzt sind und wer von wem abhaengt.
DIe Codebeschreibung ist relativ selbsterklaerend. Mit `data` werden vorhandene Informationen abgerufen, mit `resource`sind einzelne Resourcen beschrieben:

<code>
data "opentelekomcloud_images_image_v2" "image" {
 name = "${var.image_name}"
 most_recent = true
}

resource "opentelekomcloud_vpc_v1" "vpc" {
 name = "${var.vpc_name}"
 cidr = "${var.vpc_cidr}"
}

resource "opentelekomcloud_vpc_subnet_v1" "subnet" {
 name = "${var.subnet_name}"
 vpc_id = "${opentelekomcloud_vpc_v1.vpc.id}"
 cidr = "${var.subnet_cidr}"
 gateway_ip = "${var.subnet_gateway_ip}"
 dns_list = ["100.125.4.25","8.8.8.8"]
}

resource "opentelekomcloud_networking_secgroup_v2" "quickstart-secgroup" {
 name = "${var.secgroup_name}"
}

resource "opentelekomcloud_networking_secgroup_rule_v2" "quickstart-secgroup_rule_1" {
 direction = "ingress"
 ethertype = "IPv4"
 remote_ip_prefix = "0.0.0.0/0"
 security_group_id = "${opentelekomcloud_networking_secgroup_v2.quickstart-secgroup.id}"
}

resource "opentelekomcloud_networking_secgroup_rule_v2" "quickstart-secgroup_rule_2" {
 direction = "egress"
 ethertype = "IPv4"
 remote_ip_prefix = "0.0.0.0/0"
 security_group_id = "${opentelekomcloud_networking_secgroup_v2.quickstart-secgroup.id}"
}

resource "opentelekomcloud_compute_keypair_v2" "quickstart-key" {
 name = "quickstart-key"
 public_key = "${var.public_key}"
}

resource "opentelekomcloud_compute_instance_v2" "quickstart" {
 name = "quickstart"
 availability_zone = "${var.availability_zone}"

 flavor_id = "${var.flavor_id}"
 key_pair = "${opentelekomcloud_compute_keypair_v2.quickstart-key.name}"
 security_groups = ["${opentelekomcloud_networking_secgroup_v2.quickstart-secgroup.id}"]
 network {
 uuid = "${opentelekomcloud_vpc_subnet_v1.subnet.id}"
 }
 block_device {
 boot_index = 0
 source_type = "image"
 destination_type = "volume"
 uuid = "${data.opentelekomcloud_images_image_v2.image.id}"
 delete_on_termination = true
 volume_size = 30
 }
}

resource "opentelekomcloud_networking_floatingip_v2" "eip_quickstart" {
 pool = "admin_external_net"
}

resource "opentelekomcloud_compute_floatingip_associate_v2" "eip_quickstart" {
 floating_ip = "${opentelekomcloud_networking_floatingip_v2.eip_quickstart.address}"
 instance_id = "${opentelekomcloud_compute_instance_v2.quickstart.id}"
}
</code>

<strong>outputs.tf</strong>
Wann immer ich etwas Ausgeben moechte, kann ich das in `output` beschreiben, hier zum Beispiel die zufaellig vergebene Public IP fuer die VM, um zu zeigen, wo man sich einloggen muss:

<code>
output "external-ip" {
 value = ["ssh ubuntu@${opentelekomcloud_networking_floatingip_v2.eip_quickstart.address}"]
}
</code>

<strong>provider.tf</strong>
Hier sind die Provider beschrieben, die zur Ausfuehrung von Terraform mit der Beschreibung in main.tf benoetigt werden. Der Provider brauch bestimmte Parameter, wie hier die Cloud-Credentials. Das Providermodule wird beim Initialisieren ins Verzeichnis .terraform aus dem Internet heruntergeladen.

<code>
provider "opentelekomcloud" {
 tenant_name = "${var.tenant_name}"
 access_key = "${var.access_key}"
 secret_key = "${var.secret_key}"
 region = "${var.region}"
 auth_url = "${var.auth_url}"
}
</code>

<strong>terraform.tfstate</strong>
Der Status von Terraform wird in sogenannten Statefiles hinterlegt. Die Json-Struktur ist menschenlesenbar. Achtung: Diese Datei kann auch geheime Daten wie Passwoerter enthalten.

<strong>terraform.tfvars</strong>
In dieser Datei kann ich Variablen konfigurieren, die ich zum Ausfuehren von Terraform benoetige. Als da waeren Cloud-Credentials access_key und secret_key, sowie mein Public-SSH-Key, um sich auf der VM spaeter mit ssh einloggen zu koennen.

<code>
access_key = "xxxxxxxxxxxxxxxxxxxx"
secret_key = "xxxxxxxxxxxxxxxxxxxx"
public_key = "ssh-rsa xxxxxxxxxxxx"
</code>

<strong>variables.tf</strong>

Alle notwendigen Variablen fuer dieses Terraform sind hier deklariert. Meist sind schon Default-Werte vorgegeben, die in terrraform.tfvars nicht extra angegeben werden muessen, koennen aber auch von dort ueberschrieben werden:

<code>
# OTC vars
variable "access_key" {
 description = "Auth Access Key"
}

variable "secret_key" {
 description = "Auth Secret Key"
}

variable "auth_url" {
 description = "IAM Auth Url"
 default = "https://iam.eu-de.otc.t-systems.com:443/v3"
}

variable "tenant_name" {
 description = "Name of the tenant"
 default = "eu-de"
}

variable "region" {
 description = "Cloud Region"
 default = "eu-de"
}

variable "availability_zone" {
 description = "Availability Zone"
 default = "eu-de-01"
}

variable "vpc_name" {
 description = "Name of VPC"
 default = "quickstart-vpc"
}

variable "vpc_cidr" {
 description = "VPC network"
 default = "192.168.0.0/16"
}

variable "subnet_name" {
 description = "Subnetwork name"
 default = "quickstart-subnet"
}

variable "subnet_cidr" {
 description = "Sub Network CIDR"
 default = "192.168.1.0/24"
}

variable "dns_list" {
 description = "list of DNS servers"
 default = ["100.125.4.25", "8.8.8.8"]
}

variable "subnet_gateway_ip" {
 description = "Subnet Gateway"
 default = "192.168.1.1"
}

variable "secgroup_name" {
 description = "Secgroup name"
 default = "quickstart-secgroup"
}

variable "image_name" {
 description = "Name of the image"
 default = "Standard_Ubuntu_18.04_latest"
}

variable "flavor_id" {
 description = "ID of Flavor"
 default = "c3.large.2"
}

variable "public_key" {
 description = "ssh public key to use"
 default = ""
}

</code>

<strong>versions.tf</strong>
Manche Funktionen sind erst in neueren Versionen von Terraform oder den Provider-Modulen vorhanden. Die Notwendigkeit einer Version kann hier festgelegt werden:

<code>
terraform {
 required_version = ">= 0.12"
 required_providers {
 opentelekomcloud = ">= 1.11"
 }
}

</code>

<strong>Hier gehts jetzt richtig los:</strong> Nach dem Initialisieren wird der Terraform Plan aufgerufen, der anzeigt, was gemacht werden wuerde - also welche Resourcen in der Cloud angelegt werden. Richtig ernst wird es beim Apply - dort werden dann tatsaechlich die Resourcen in der Cloud angelegt:

<code>
terraform init
terraform plan
terraform apply
</code>

Der grosse Vorteil von Terraform ist die rueckstandslose Beseitigung aller Resourcen in der Cloud, wenn diese nicht mehr benoetigt werden. Entsprechend den gespeicherten Informationen im State-Files werden die Resourcen in der Cloud wieder geloescht:

<code>
terraform destroy
</code>

Download Code: https://github.com/eumel8/tf-otc-quickstart
