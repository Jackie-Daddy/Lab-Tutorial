---
title: 如何愉快的配置内网服务器代理上网
date: 2025-09-25
tags:
  - proxy
  - network
  - server
  - clash
description: 内网服务器连不上外网？用 http_proxy 配合代理软件让服务器通外网，含临时/永久配置和内网排除。
reviewed: 2026-09-07
scope: Linux/macOS 的 Bash/Zsh 与 HTTP 代理；curl 7.86.0+ 支持 CIDR 排除
---
## 前言

实验室的内网服务器通常不能直接访问外网——GitHub 拉不了代码、pip 装不了包、HuggingFace 下不了模型。但只要有一台能上外网的机器（比如你自己的笔记本）开了代理，就可以让服务器"借道"上网。

## 前提条件

- 你有一台能访问外网的电脑，提供 HTTP 或 mixed 代理监听端口（只有 SOCKS 端口不能直接套用本文的 `http://` 示例）
- 服务器能够访问这台电脑的局域网地址和代理端口，电脑在使用期间保持运行

<TutorialDiagram name="proxy-architecture" />

## 获取代理地址

先在代理客户端中确认 HTTP 或 mixed 监听端口。下文的 `7890` 只是示例，不同客户端、配置和安装版本可能不同；不要把 SOCKS 端口、控制 API 端口或 TUN 虚拟网卡当成 HTTP 代理。

然后获取你电脑在内网的 IP：

```bash
# macOS
ifconfig | grep "inet " | grep -v 127.0.0.1
# Linux
ip addr show | grep "inet " | grep -v 127.0.0.1
```

假设你的内网 IP 是 `192.168.1.100`，代理端口是 `7890`，那代理地址就是 `http://192.168.1.100:7890`。

> **允许局域网访问**：对于 Clash/Mihomo，需要开启 **Allow LAN**，并让代理端口绑定到电脑的局域网地址。**TUN Mode 不等于 Allow LAN**。同时在防火墙或 `lan-allowed-ips` 中限制可连接的服务器地址，避免把无认证代理开放给任意设备。[Mihomo 配置说明](https://wiki.metacubex.one/en/config/general/)

## 临时配置（立即生效）

直接在终端里设置环境变量：

```bash
export http_proxy=http://192.168.1.100:7890
export https_proxy=http://192.168.1.100:7890

# 验证是否生效
curl -I https://www.google.com
```

环境变量影响当前 shell 及其新启动、支持这些变量的程序，不会自动修改已运行的服务。`https_proxy` 的值仍用 `http://`，因为这里连接的是 HTTP 代理，由它为 HTTPS 建立 CONNECT 隧道。用 `curl -vI https://www.google.com` 可检查实际连接的代理地址。[curl 代理变量](https://everything.curl.dev/usingcurl/proxies/env.html)

## 永久配置

编辑 `~/.bashrc`（用 bash 的话）或 `~/.zshrc`：

```bash
vim ~/.bashrc
```

在文件末尾添加：

```bash
# Proxy configuration
export http_proxy=http://192.168.1.100:7890
export https_proxy=http://192.168.1.100:7890

# 内网地址不走代理（重要！不然内网访问会很慢）
export no_proxy=localhost,127.0.0.1,::1,.local
export NO_PROXY="$no_proxy"
```

`no_proxy` 填写目标主机名、域名后缀或实际 IP；将实验室的域名/IP 追加进去。curl 不使用 `*.local` 这样的 shell 通配模式；CIDR 网段排除需 **curl 7.86.0+**，例如 `10.0.0.0/8,172.16.0.0/12,192.168.0.0/16`。其他应用的匹配规则可能不同，逐项验证。

保存后加载对应文件；zsh 用户改用 `source ~/.zshrc`：

```bash
source ~/.bashrc
```

<TutorialDiagram name="proxy-config" />

## 常见问题排查

- **`curl` 报 `Connection refused`？** 检查代理软件的端口是否开放、防火墙是否拦截。
- **能 ping 通外网但 curl 不通？** ping 走 ICMP 协议不过代理，用 `curl -v` 看详细连接过程。
- **pip / git 还是连不上？** 确认程序从已设置变量的 shell 启动。Git 的 HTTP 代理只影响 HTTP(S) remote，不影响 `git@github.com:...` 这样的 SSH 地址；可用 `git remote -v` 检查。避免额外写入全局 `http.proxy`，否则关闭环境变量后 Git 仍可能走代理。[Git 代理配置](https://git-scm.com/docs/git-config#Documentation/git-config.txt-httpproxy)
- **内网服务变慢了？** 检查 `no_proxy` / `NO_PROXY` 是否包含访问时实际使用的主机名或 IP，并确认该应用支持所用的排除格式。

<TutorialDiagram name="proxy-troubleshoot" />

## 快速开关

不想一直走代理的话，可以写成 alias：

```bash
alias proxy-on='export http_proxy=http://192.168.1.100:7890 && export https_proxy=$http_proxy'
alias proxy-off='unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY'
```

加到对应 shell 配置文件并加载，需要时 `proxy-on`，不需要时 `proxy-off`。关闭只影响之后启动的程序，不会清除 Git 等应用另行保存的代理配置，也不会关闭系统 TUN。

<PostTags />
