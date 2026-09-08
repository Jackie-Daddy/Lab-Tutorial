---
title: How to Happily Configure Proxy for Intranet Server Internet Access
date: 2025-09-25
tags:
  - proxy
  - network
  - server
  - clash
description: Can't access the internet from your intranet server? Use http_proxy with proxy software to get online, including temporary/permanent config and internal network bypass.
reviewed: 2026-09-07
scope: Bash/Zsh on Linux/macOS with an HTTP proxy; curl 7.86.0+ for CIDR exclusions
---
## Preface

Lab intranet servers often can't directly access the internet — can't pull from GitHub, can't pip install packages, can't download models from HuggingFace. But if you have a machine with internet access (like your laptop) running a proxy, the server can "piggyback" through it.

## Prerequisites

- A computer with internet access exposing an HTTP or mixed proxy port (a SOCKS-only port cannot use these `http://` examples)
- The server can reach that computer’s LAN address and proxy port, and the computer stays running

<TutorialDiagram name="proxy-architecture" />

## Getting the Proxy Address

Find the HTTP or mixed listening port in your proxy client. Port `7890` below is an example, not a universal default. A SOCKS port, control API port, or TUN interface is not an HTTP proxy endpoint.

Then get your computer's local network IP:

```bash
# macOS
ifconfig | grep "inet " | grep -v 127.0.0.1
# Linux
ip addr show | grep "inet " | grep -v 127.0.0.1
```

If your local IP is `192.168.1.100` and the proxy port is `7890`, then the proxy address is `http://192.168.1.100:7890`.

> **LAN access**: For Clash/Mihomo, enable **Allow LAN** and bind the proxy port to the computer’s LAN address. **TUN Mode is a separate feature.** Restrict connecting server addresses through your firewall or `lan-allowed-ips` so an unauthenticated proxy is not open to arbitrary devices. [Mihomo configuration](https://wiki.metacubex.one/en/config/general/)

## Temporary Configuration (Immediate)

Set environment variables in your terminal:

```bash
export http_proxy=http://192.168.1.100:7890
export https_proxy=http://192.168.1.100:7890

# Verify it works
curl -I https://www.google.com
```

Variables affect this shell and newly started programs that honor them; already running services do not inherit the change. The `https_proxy` URL remains `http://` because the HTTP proxy establishes a CONNECT tunnel for HTTPS. Inspect the proxy address actually used with `curl -vI https://www.google.com`. [curl proxy variables](https://everything.curl.dev/usingcurl/proxies/env.html)

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
export no_proxy=localhost,127.0.0.1,::1,.local
export NO_PROXY="$no_proxy"
```

Add your lab’s actual hostnames, domain suffixes, or IPs to `no_proxy`. curl does not use shell-style patterns such as `*.local`. CIDR exclusions require **curl 7.86.0+**, for example `10.0.0.0/8,172.16.0.0/12,192.168.0.0/16`. Matching rules differ across applications; verify each one.

Load the file for your shell; use `source ~/.zshrc` for zsh:

```bash
source ~/.bashrc
```

<TutorialDiagram name="proxy-config" />

## Troubleshooting

- **`curl` says `Connection refused`?** Check if the proxy port is open and the firewall isn't blocking it.
- **Ping works but curl doesn't?** Ping uses ICMP (doesn't go through proxy). Use `curl -v` to see the detailed connection process.
- **pip / git still cannot connect?** Start the program from the configured shell. Git’s HTTP proxy applies to HTTP(S) remotes, not SSH URLs such as `git@github.com:...`; inspect them with `git remote -v`. Avoid also setting a global `http.proxy`, which can keep Git proxied after the environment variables are unset. [Git proxy configuration](https://git-scm.com/docs/git-config#Documentation/git-config.txt-httpproxy)
- **Internal services are slow?** Check that `no_proxy` / `NO_PROXY` includes the hostname or IP actually used in the request, and that the application supports the exclusion format.

<TutorialDiagram name="proxy-troubleshoot" />

## Quick Toggle

If you don't want the proxy always on, create aliases:

```bash
alias proxy-on='export http_proxy=http://192.168.1.100:7890 && export https_proxy=$http_proxy'
alias proxy-off='unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY all_proxy ALL_PROXY'
```

Add and load them in the appropriate shell configuration. Use `proxy-on` when needed and `proxy-off` when not. Unsetting variables affects subsequently launched programs; it does not remove separate Git/application proxy settings or disable system TUN routing.

<PostTags />
