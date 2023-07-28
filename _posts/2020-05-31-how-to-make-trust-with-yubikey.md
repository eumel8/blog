---
layout: post
tag: inet
title: How to make trust with Yubikey
subtitle: "Most of the people doesn't care about their used Docker images in various deployments like in Kubebernetes. That's a bit dangerous because everything can happen, especially if the container run as root or in host network. Docker introduced Trust to&hellip;"
date: 2020-05-31
author: eumel8
---

Most of the people doesn't care about their used Docker images in various deployments like in Kubebernetes. That's a bit dangerous because everything can happen, especially if the container run as root or in host network. Docker introduced <a href="https://docs.docker.com/engine/security/trust/content_trust/">Trust</a> to verify your Docker image. Here is a way to sign your Docker images with Yubikey

<br/>

Howto


1. Yubikey 5 series with PIV (https://www.yubico.com/product/yubikey-5-nfc)
2. Ubuntu 18.04
3. Install Software

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
 apt install docker.io 
 add-apt-repository ppa:yubico/stable &amp;&amp; sudo apt-get update
 apt install yubikey-manager 
 wget http://archive.ubuntu.com/ubuntu/pool/universe/y/yubico-piv-tool/yubico-piv-tool_2.0.0-2_amd64.deb
 dpkg -i yubico-piv-tool_2.0.0-2_amd64.deb
 wget -O /usr/local/bin/notary https://github.com/docker/notary/releases/download/v0.6.1/notary-Linux-amd64 &amp;&amp; chmod a+x /usr/local/bin/notary
</code></pre><!-- /codeblock -->

Older version of yubico-piv-tool won't work correctly. Older version of notary haven't Yubikey Support


4. Insert Yubikey into computer

5. Test Yubikey

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
$ ykman info
Device type: YubiKey 5 NFC
Serial number: 13316522
Firmware version: 5.2.6
Form factor: Keychain (USB-A)
Enabled USB interfaces: OTP+FIDO+CCID
NFC interface is enabled.

Applications USB NFC
OTP Enabled Enabled
FIDO U2F Enabled Enabled
OpenPGP Enabled Enabled
PIV Enabled Enabled
OATH Enabled Enabled
FIDO2 Enabled Enabled
</code></pre><!-- /codeblock -->

Default Management Key: 102030405060708010203040506070801020304050607080
Default PIN: 123456


6. Generate key/cert

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
yubico-piv-tool -s 9c -a generate -k --pin-policy=always --touch-policy=always --algorithm=ECCP256 -o public.pem
yubico-piv-tool -a verify-pin -a selfsign-certificate -s 9c -S '/CN=root/' --valid-days=365 -i public.pem -o cert.pem
yubico-piv-tool -k -a import-certificate -s 9c -i cert.pem
</code></pre><!-- /codeblock -->

7. Check notary key list

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
/usr/local/bin/notary -d ~/.docker/trust key list

ROLE GUN KEY ID LOCATION
---- --- ------ --------
root 8a030f980da58cb3df91bbd1af8ad71ff0573fa1901661f2d752b0d380b20654 yubikey
</code></pre><!-- /codeblock -->

8. A simple Dockerfile

<pre>
FROM alpine
RUN true
</pre> 

9. Build

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
DOCKER_CONTENT_TRUST_SERVER=https://notary.docker.io DOCKER_CONTENT_TRUST=1 docker build -t mtr.external.otc.telekomcloud.com/eumel8/alpine:0.0.1 .

DOCKER_CONTENT_TRUST_SERVER=https://notary.external.otc.telekomcloud.com DOCKER_CONTENT_TRUST=1 docker build -t mtr.external.otc.telekomcloud.com/eumel8/test:0.0.3 . 
</code></pre><!-- /codeblock -->

10. Sign

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
# DOCKER_CONTENT_TRUST_SERVER=https://notary.external.otc.telekomcloud.com DOCKER_CONTENT_TRUST=1 docker trust sign mtr.external.otc.telekomcloud.com/eumel8/test:0.0.3
INFO[0000] Unsupported x509 PublicKeyAlgorithm: 1
Please touch the attached Yubikey to perform signing.
Enter passphrase for new repository key with ID d8ca7e1:
Repeat passphrase for new repository key with ID d8ca7e1:
Please touch the attached Yubikey to perform signing.
Enter passphrase for new eumel8 key with ID 88ca03e:
Repeat passphrase for new eumel8 key with ID 88ca03e:
Created signer: eumel8
Finished initializing signed repository for mtr.external.otc.telekomcloud.com/eumel8/test:0.0.3
Signing and pushing trust data for local image mtr.external.otc.telekomcloud.com/eumel8/test:0.0.3, may overwrite remote trust data
The push refers to repository [mtr.external.otc.telekomcloud.com/eumel8/test]
50644c29ef5a: Mounted from eumel8/alpine 0.0.3: digest: sha256:e51e47319b0aa0d026e773e31ec1ad63d8f48dad6402f34110f2a2deb5f63285 size: 528
Signing and pushing trust metadata
INFO[0059] Unsupported x509 PublicKeyAlgorithm: 1
Enter passphrase for eumel8 key with ID 88ca03e:
Successfully signed mtr.external.otc.telekomcloud.com/eumel8/test:0.0.3
</code></pre><!-- /codeblock -->

11. Inspect

<!-- codeblock lang=shell line=1 --><pre class="codeblock"><code>
# docker trust inspect mtr.external.otc.telekomcloud.com/eumel8/test:0.0.3
INFO[0000] Unsupported x509 PublicKeyAlgorithm: 1
[
 {
 "Name": "mtr.external.otc.telekomcloud.com/eumel8/test:0.0.3",
 "SignedTags": [
 {
 "SignedTag": "0.0.3",
 "Digest": "e51e47319b0aa0d026e773e31ec1ad63d8f48dad6402f34110f2a2deb5f63285",
 "Signers": [
 "eumel8"
 ]
 }
 ],
 "Signers": [
 {
 "Name": "eumel8",
 "Keys": [
 {
 "ID": "88ca03e36ea032948bcf59cbb3624debf22ce7796ccd69f3e0e1dc4b5c3bdf98"
 }
 ]
 }
 ],
 "AdministrativeKeys": [
 {
 "Name": "Root",
 "Keys": [
 {
 "ID": "6d5216e9ce27dda440183f7945b3d26c8990322921fa2ba2bd8a012e1b716b0d"
 }
 ]
 },
 {
 "Name": "Repository",
 "Keys": [
 {
 "ID": "d8ca7e1860f8198f7c300717c73149423d79b05e0e40913f23237a3e1959933c"
 }
 ]
 }
 ]
 }
]
 </code></pre><!-- /codeblock -->


Reference: 

* https://ruimarinho.gitbooks.io/yubikey-handbook/content/docker-content-trust/pushing-signed-image/
* https://hairyhenderson.github.io/blog/public/post/yubikey-dct/
* https://docs.docker.com/engine/security/trust/content_trust/#signing-images-with-docker-content-trust
* https://developers.yubico.com/yubikey-piv-manager/PIN_and_Management_Key.html
* https://gist.github.com/eumel8/44a66326aa91ea5aea7748f6c3459383
* https://mtr.external.otc.telekomcloud.com/
