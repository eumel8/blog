---
layout: post
tag: inet
title: DeepSeek-Coder mit Ubuntu GPU
subtitle: DeepSeek-R1 & Co auf dem Heimcomputer im Eigentest (Teil2)
date: 2025-02-11
author: eumel8
background: '/images/chatbot-gpu.png?4362984378'
twitter: 'images/blog-eumel-de.png'
---

# Einstieg

Im Teil 1 zu KI Chatbots haben wir uns mit den Grundlagen beschäftigt und die verschiedenen Models verglichen.
Am Schluss kam der Hinweis zu [DeepSeek-Coder](https://github.com/deepseek-ai/DeepSeek-Coder), eine fertige Lösung zum Einsatz als Chatbot oder Visual Studio Code Plugin.
Der Schnelltest funktionierte nicht, weil die Hardware-Resourcen dazu fehlten. Für diesen Test haben wir hier eine virtuelle Maschine mit Nvidia-GPU und so schauen wir uns an, wie das auf Ubuntu zu installieren ist.

# Nvidia auf Ubuntu 22.04

Ob ein Nvidia-Treiber installiert ist, kann man mit folgendem Befehl rausfinden:

```
$ cat /proc/driver/nvidia/version
NVRM version: NVIDIA UNIX x86_64 Kernel Module  550.120  Fri Sep 13 10:10:01 UTC 2024
GCC version:  gcc version 11.4.0 (Ubuntu 11.4.0-1ubuntu1~22.04)
```

Vermutlich ist da aber nichts, obwohl eine GPU vorhanden ist. Also muss man den Treiber und vorher das Programm zum Installieren der Treiber installieren:


```
$ apt install ubuntu-drivers-common
$ ubuntu-drivers --gpgpu install
```

Nach der Installation sollte es ungefähr so aussehen:

```
# nvidia-smi
Mon Feb 10 22:43:56 2025
+-----------------------------------------------------------------------------------------+
| NVIDIA-SMI 550.120                Driver Version: 550.120        CUDA Version: 12.4     |
|-----------------------------------------+------------------------+----------------------+
| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |
|                                         |                        |               MIG M. |
|=========================================+========================+======================|
|   0  Tesla V100-SXM2-16GB           Off |   00000000:21:01.0 Off |                    0 |
| N/A   35C    P0             31W /  300W |       1MiB /  16384MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+
|   1  Tesla V100-SXM2-16GB           Off |   00000000:21:02.0 Off |                    0 |
| N/A   33C    P0             30W /  300W |       1MiB /  16384MiB |      0%      Default |
|                                         |                        |                  N/A |
+-----------------------------------------+------------------------+----------------------+

+-----------------------------------------------------------------------------------------+
| Processes:                                                                              |
|  GPU   GI   CI        PID   Type   Process name                              GPU Memory |
|        ID   ID                                                               Usage      |
|=========================================================================================|
|  No running processes found                                                             |
+-----------------------------------------------------------------------------------------+
```

Es sind also 2 GPU vorhanden und vom System auch erkannt. Man kann sich auch noch `gpustats` installieren:

```
# apt install gpustat
# gpustat
quickstart1              Mon Feb 10 22:46:25 2025  550.120
[0] Tesla V100-SXM2-16GB | 35'C,   0 % |   239 / 16384 MB |
[1] Tesla V100-SXM2-16GB | 33'C,   0 % |   239 / 16384 MB |
```

# DeepSeek-Coder

Weiter gehts mit dem eigentlichen Programm. Wir wollen nur dir Chatbot-Option testen. Ein Beispiel-Code für Python ist mit im Repo, also brauchen wir eine virtuelle Umgebung für Python:

```
$ apt install python3.10-venv
$ python3 -m venv venv
$ . ./venv/bin/activate
$ git clone https://github.com/deepseek-ai/DeepSeek-Coder.git
$ cd DeepSeek-Coder/
$ ../venv/bin/pip install -r requirements.txt
```

Irgendwas stimmte mit den requirements.txt im Repo nicht, denn es kam immer zum Fehler. ChatGPT empfahl das Update der Bibliotheken und das haben wir einfach gemacht:

```
$ ../venv/bin/pip install --upgrade transformers huggingface_hub accelerate torch
```

Den Beispiel-Code haben wir einfach mit unserer Frage zu Golang ersetzt, mit denen die meisten LLM Probleme hatten:

```python
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
tokenizer = AutoTokenizer.from_pretrained("deepseek-ai/deepseek-coder-6.7b-instruct", trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained("deepseek-ai/deepseek-coder-6.7b-instruct", trust_remote_code=True, torch_dtype=torch.bfloat16).cuda()
messages=[
    { 'role': 'user', 'content': "Write a Go programm to list all Pods in a Kubernetes cluster"}
]
inputs = tokenizer.apply_chat_template(messages, add_generation_prompt=True, return_tensors="pt").to(model.device)
# tokenizer.eos_token_id is the id of <|EOT|> token
outputs = model.generate(inputs, max_new_tokens=512, do_sample=False, top_k=50, top_p=0.95, num_return_sequences=1, eos_token_id=tokenizer.eos_token_id)
print(tokenizer.decode(outputs[0][len(inputs[0]):], skip_special_tokens=True))
```

Und los gehts auf der Kommandozeile:

```
 ../venv/bin/python chat.py
```

Ausgabe:

```
Loading checkpoint shards: 100%|████████████████████████████████████████████████████████████████| 2/2 [00:00<00:00,  8.18it/s]
/root/venv/lib/python3.10/site-packages/transformers/generation/configuration_utils.py:633: UserWarning: `do_sample` is set to `False`. However, `top_p` is set to `0.95` -- this flag is only used in sample-based generation modes. You should set `do_sample=True` or unset `top_p`.
  warnings.warn(
The attention mask and the pad token id were not set. As a consequence, you may observe unexpected behavior. Please pass your input's `attention_mask` to obtain reliable results.
Setting `pad_token_id` to `eos_token_id`:32021 for open-end generation.
The attention mask is not set and cannot be inferred from input because pad token is same as eos token. As a consequence, you may observe unexpected behavior. Please pass your input's `attention_mask` to obtain reliable results.
To list all Pods in a Kubernetes cluster using Go, you need to use the Kubernetes client-go library. Here is a simple example:
```

```go
package main

import (
        "context"
        "flag"
        "fmt"
        "path/filepath"
        "k8s.io/client-go/kubernetes"
        "k8s.io/client-go/tools/clientcmd"
        metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func main() {
        var kubeconfig *string
        kubeconfig = flag.String("kubeconfig", filepath.Join("your-path-to-kubeconfig"), "<kubeconfig>")

        flag.Parse()

        config, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
        if err != nil {
                panic(err)
        }

        clientset, err := kubernetes.NewForConfig(config)
        if err != nil {
                panic(err)
        }

        pods, err := clientset.CoreV1().Pods("").List(context.Background(), metav1.ListOptions{})
        if err != nil {
                panic(err)
        }

        for _, pod := range pods.Items {
                fmt.Printf("Namespace: %s, Name: %s\n", pod.Namespace, pod.Name)
        }
}
```

```
In this program, we first import the necessary packages. Then we set up the kubeconfig file path using the flag package. We use the BuildConfigFromFlags function to create the config object. We then create a new clientset using the NewForConfig function.

We use the List function of the Pods interface to get a list of all Pods in the cluster. We then loop over the list and print the namespace and name of each Pod.

Please replace "your-path-to-kubeconfig" with the actual path to your kubeconfig file.

Note: This code assumes that you have the kubeconfig file and the kubernetes client-go library installed. If you haven't installed
```

Das Programm funktioniert auf Anhieb und die Ausgabe dauerte 27 Sekunden. Der User hat länger gebraucht, um den Code zu kopieren, wie angegben die Kubernetes client-go Libs zu installieren, eine passende kubeconfig Datei zu suchen, den Pfad anzupassen und das Programm zu starten.

Bei täglicher Nutzung gehen die Antwortzeiten wahrscheinlich deutlich nach unten. Jedoch ist die Test-VM sehr teuer. Entweder findet man adäquate Hardware mit Nvidia-GPU oder schaut sich das Programm noch genauer an, um es ohne GPU zum Laufen zu bringen. Vielleicht im Teil 3?

Viel Spass dahin mit der KI!
