---
title: VSCode & Cursor & Windsurf 如何远程 debug 代码
title_en: How to Remote Debug Code with VSCode, Cursor & Windsurf
date: 2026-06-04
tags: [vscode, cursor, windsurf, debug, remote, python]
lang: zh
slug: remote-debug
description: 告别 print 调试。用 debugpy 在本地编辑器里给服务器上运行的代码打断点、单步、看变量。
---

## 前言

在服务器上调试代码，很多人还在用 `print()` 大法——加一行 print，重新跑一遍，看输出，再加一行 print……循环往复。效率低，而且无法在运行时停下来检查变量状态。

用 `debugpy` 配合本地的 VSCode / Cursor / Windsurf，可以在服务器上跑的代码里打断点，和本地调试一样方便。

## 工作原理

```
本地编辑器（VSCode/Cursor/Windsurf）    ←→    debugpy（运行在服务器上）
     等待连接                                         监听端口 5678
     设置断点                                         遇到断点暂停
     查看变量                                         回传变量状态
```

debugpy 在服务器上启动一个调试服务器，本地编辑器通过 SSH 隧道连接上去，实现远程调试。

## 第一步：服务器安装 debugpy

```bash
pip install debugpy
```

## 第二步：配置 SSH 隧道（可选但推荐）

在**本地**的 `~/.ssh/config` 中添加端口转发：

```
Host myserver
    HostName your-server-ip
    User your-username
    LocalForward 5678 localhost:5678
```

这样本地 `localhost:5678` 就映射到了服务器上的 `5678` 端口。

如果没有配 SSH 隧道，也可以用服务器的 IP:端口直连。

## 第三步：启动调试服务器

在服务器上运行代码时，用 `debugpy` 包裹：

```bash
python -m debugpy --listen 0.0.0.0:5678 --wait-for-client train.py
```

参数说明：
- `--listen 0.0.0.0:5678`：监听所有接口的 5678 端口
- `--wait-for-client`：等待编辑器连接后再开始执行（可选，方便从开头就断点）

如果想不阻塞直接跑，去掉 `--wait-for-client`：

```bash
python -m debugpy --listen 0.0.0.0:5678 train.py
```

## 第四步：本地编辑器连接

### VSCode

在 `.vscode/launch.json` 中添加配置：

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Remote Attach",
            "type": "debugpy",
            "request": "attach",
            "connect": {
                "host": "localhost",
                "port": 5678
            },
            "pathMappings": [
                {
                    "localRoot": "${workspaceFolder}",
                    "remoteRoot": "/path/to/your/code/on/server"
                }
            ]
        }
    ]
}
```

### Cursor / Windsurf

Cursor 和 Windsurf 基于 VSCode，配置方式完全一样。直接用上面的 `launch.json`，或者在 Run and Debug 面板中选择 "Python: Remote Attach"。

## 第五步：打断点 & 调试

1. 在本地代码文件的某一行左侧点击，打上红色断点
2. 按 `F5`（或点击绿色三角形），选择 "Python: Remote Attach"
3. 代码执行到断点处自动暂停
4. 现在你可以：查看变量值、单步执行（F10）、跳入函数（F11）、查看调用堆栈

## 常见问题

- **连接超时？** 检查服务器防火墙是否开放了 5678 端口，或检查 SSH 隧道是否配置正确。
- **断点不生效？** 确认 `pathMappings` 中的 `remoteRoot` 和服务器上代码的实际路径一致。
- **在 Jupyter Notebook 里能用吗？** 可以，`%debug` 或 `ipdb` 更适合 notebook 场景。
- **多人同时调试？** 给每个人分配不同的端口即可，比如 `5679`, `5680`。
