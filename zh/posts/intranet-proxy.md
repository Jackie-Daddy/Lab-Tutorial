---
title: 如何愉快的配置内网服务器代理上网
date: 2025-09-25
tags:
  - proxy
  - network
  - server
  - clash
description: 内网服务器连不上外网？用 http_proxy 配合代理软件让服务器通外网，含临时/永久配置和内网排除。
---
## 前言

实验室的内网服务器通常不能直接访问外网——GitHub 拉不了代码、pip 装不了包、HuggingFace 下不了模型。但只要有一台能上外网的机器（比如你自己的笔记本）开了代理，就可以让服务器"借道"上网。

## 前提条件

- 你有一台能访问外网的电脑，上面运行了代理软件（Clash、V2Ray、Shadowsocks 等）
- 服务器和这台电脑在同一个局域网内

<TutorialDiagram name="proxy-architecture" />

## 获取代理地址

首先确认代理软件的 HTTP 端口。以 Clash 为例，默认是 `7890`。在你自己的电脑上查看：

- **Clash**：默认 `http://127.0.0.1:7890`
- **V2Ray**：通常 `http://127.0.0.1:10809`

然后获取你电脑在内网的 IP：

```bash
# macOS
ifconfig | grep "inet " | grep -v 127.0.0.1
# Linux
ip addr show | grep "inet " | grep -v 127.0.0.1
```

假设你的内网 IP 是 `192.168.1.100`，代理端口是 `7890`，那代理地址就是 `http://192.168.1.100:7890`。

> **注意**：确保代理软件开启了"允许局域网连接"（Clash 中 TUN Mode 或 Allow LAN）。

## 临时配置（立即生效）

直接在终端里设置环境变量：

```bash
export http_proxy=http://192.168.1.100:7890
export https_proxy=http://192.168.1.100:7890

# 验证是否生效
curl -I https://www.google.com
```

这种方式只在当前终端会话中有效，关闭终端就失效。

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
export no_proxy=localhost,127.0.0.1,*.local,10.0.0.0/8,192.168.0.0/16
```

保存后让配置生效：

```bash
source ~/.bashrc
```

<TutorialDiagram name="proxy-config" />

## 常见问题排查

- **`curl` 报 `Connection refused`？** 检查代理软件的端口是否开放、防火墙是否拦截。
- **能 ping 通外网但 curl 不通？** ping 走 ICMP 协议不过代理，用 `curl -v` 看详细连接过程。
- **pip / git 还是连不上？** 确认 `http_proxy` / `https_proxy` 都设置了。git 也可单独配置：`git config --global http.proxy $http_proxy`。
- **内网服务变慢了？** 检查 `no_proxy` 是否正确设置了内网 IP 段。

<TutorialDiagram name="proxy-troubleshoot" />

## 快速开关

不想一直走代理的话，可以写成 alias：

```bash
alias proxy-on='export http_proxy=http://192.168.1.100:7890 && export https_proxy=$http_proxy'
alias proxy-off='unset http_proxy https_proxy'
```

加到 `~/.bashrc` 里，需要时 `proxy-on`，不需要时 `proxy-off`。

<div class="post-tags-section">
  <span class="label">标签:</span>
  <span class="tag-pill" v-for="tag in $frontmatter.tags" :key="tag">{{ tag }}</span>
</div>
