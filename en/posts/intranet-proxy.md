---
title: How to Happily Configure Proxy for Intranet Server Internet Access
date: 2025-09-25
tags:
  - proxy
  - network
  - server
  - clash
description: Can't access the internet from your intranet server? Use http_proxy with proxy software to get online, including temporary/permanent config and internal network bypass.
---
## Preface

Lab intranet servers often can't directly access the internet — can't pull from GitHub, can't pip install packages, can't download models from HuggingFace. But if you have a machine with internet access (like your laptop) running a proxy, the server can "piggyback" through it.

## Prerequisites

- A computer with internet access running proxy software (Clash, V2Ray, Shadowsocks, etc.)
- The server is on the same local network as that computer

![](/images/proxy-architecture.svg)

## Getting the Proxy Address

First, confirm your proxy's HTTP port. For Clash, the default is `7890`. Check on your own machine:

- **Clash**: default `http://127.0.0.1:7890`
- **V2Ray**: typically `http://127.0.0.1:10809`

Then get your computer's local network IP:

```bash
# macOS
ifconfig | grep "inet " | grep -v 127.0.0.1
# Linux
ip addr show | grep "inet " | grep -v 127.0.0.1
```

If your local IP is `192.168.1.100` and the proxy port is `7890`, then the proxy address is `http://192.168.1.100:7890`.

> **Note**: Make sure your proxy software has "Allow LAN connections" enabled (in Clash: TUN Mode or Allow LAN).

## Temporary Configuration (Immediate)

Set environment variables in your terminal:

```bash
export http_proxy=http://192.168.1.100:7890
export https_proxy=http://192.168.1.100:7890

# Verify it works
curl -I https://www.google.com
```

This only affects the current terminal session — closing the terminal removes the configuration.

## Permanent Configuration

Edit `~/.bashrc` (if using bash) or `~/.zshrc`:

```bash
vim ~/.bashrc
```

Add at the end of the file:

```bash
# Proxy configuration
export http_proxy=http://192.168.1.100:7890
export https_proxy=http://192.168.1.100:7890

# Internal addresses bypass the proxy (important!)
export no_proxy=localhost,127.0.0.1,*.local,10.0.0.0/8,192.168.0.0/16
```

Apply the changes:

```bash
source ~/.bashrc
```

![](/images/proxy-config.svg)

## Troubleshooting

- **`curl` says `Connection refused`?** Check if the proxy port is open and the firewall isn't blocking it.
- **Ping works but curl doesn't?** Ping uses ICMP (doesn't go through proxy). Use `curl -v` to see the detailed connection process.
- **pip / git still can't connect?** Make sure both `http_proxy` and `https_proxy` are set. Git can also be configured separately: `git config --global http.proxy $http_proxy`.
- **Internal services are slow?** Check if `no_proxy` includes your internal IP ranges.

![](/images/proxy-troubleshoot.svg)

## Quick Toggle

If you don't want the proxy always on, create aliases:

```bash
alias proxy-on='export http_proxy=http://192.168.1.100:7890 && export https_proxy=$http_proxy'
alias proxy-off='unset http_proxy https_proxy'
```

Add them to `~/.bashrc`, then use `proxy-on` when needed and `proxy-off` when not.

<div class="post-tags-section">
  <span class="label">Tags:</span>
  <span class="tag-pill" v-for="tag in $frontmatter.tags" :key="tag">{{ tag }}</span>
</div>
