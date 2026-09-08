---
title: VSCode & Cursor & Windsurf 如何远程 debug 代码
date: 2025-09-30
tags:
  - vscode
  - cursor
  - windsurf
  - debug
  - remote
  - python
description: 告别 print 调试。用 debugpy 在本地编辑器里给服务器上运行的代码打断点、单步、看变量。
reviewed: 2026-09-07
scope: Linux 服务器与 OpenSSH；VS Code Python Debugger
---
## 前言

在服务器上调试代码，很多人还在用 `print()` 大法——加一行 print，重新跑一遍，看输出，再加一行 print……循环往复。效率低，而且无法在运行时停下来检查变量状态。

用 `debugpy` 配合本地的 VSCode / Cursor / Windsurf，可以在服务器上跑的代码里打断点，和本地调试一样方便。

## 工作原理

```
本地编辑器（VSCode/Cursor/Windsurf）    ←→    debugpy（运行在服务器上）
     发起连接                                         监听端口 5678
     设置断点                                         遇到断点暂停
     查看变量                                         回传变量状态
```

debugpy 在服务器上启动一个调试服务器，本地编辑器通过 SSH 隧道连接上去，实现远程调试。

<TutorialDiagram name="debugpy-architecture" />

## 第一步：服务器安装 debugpy

先激活运行 `train.py` 的虚拟环境，确保安装和启动使用同一个 Python 解释器。本文使用本地代码副本和本地编辑器窗口，服务器保存相同版本的代码。

```bash
python -m pip install debugpy
```

## 第二步：建立 SSH 隧道

在**本地**的 `~/.ssh/config` 中添加端口转发：

```
Host myserver
    HostName your-server-ip
    User your-username
    LocalForward 127.0.0.1:5678 127.0.0.1:5678
    ExitOnForwardFailure yes
```

将主机地址、用户名替换为实际值，然后在本地执行并保持此终端连接：

```bash
ssh -N myserver
```

写配置文件本身不会建立隧道。连接成功后，本地 `127.0.0.1:5678` 才转发到服务器的 `127.0.0.1:5678`；调试完成后可按 `Ctrl+C` 关闭此 SSH 连接。[OpenSSH 转发说明](https://man.openbsd.org/ssh_config#LocalForward)

## 第三步：启动调试服务器

在服务器上运行代码时，用 `debugpy` 包裹：

```bash
python -m debugpy --listen 127.0.0.1:5678 --wait-for-client train.py
```

参数说明：
- `--listen 127.0.0.1:5678`：仅监听服务器本机的 5678 端口，由 SSH 隧道访问
- `--wait-for-client`：等待编辑器连接后再开始执行（可选，方便从开头就断点）

如果想不阻塞直接跑，去掉 `--wait-for-client`：

```bash
python -m debugpy --listen 127.0.0.1:5678 train.py
```

## 第四步：本地编辑器连接

### VSCode

在本地编辑器安装并启用 **Python Debugger** 扩展。在 `.vscode/launch.json` 中添加配置，并把 `remoteRoot` 改为服务器上的实际项目路径：

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Remote Attach",
            "type": "debugpy",
            "request": "attach",
            "connect": {
                "host": "127.0.0.1",
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

在 Cursor / Windsurf 中先确认当前版本可以安装并启用兼容的 Python 调试扩展，再使用相同的 `debugpy` attach 配置。若提示不支持 `debugpy` 调试类型，先检查扩展及其运行位置；不能仅凭基于 VSCode 就假定扩展兼容。[VS Code 官方调试说明](https://code.visualstudio.com/docs/python/debugging)

<TutorialDiagram name="debugpy-vscode-config" />

## 第五步：打断点 & 调试

1. 在本地代码文件的某一行左侧点击，打上红色断点
2. 按 `F5`（或点击绿色三角形），选择 "Python: Remote Attach"
3. 代码执行到断点处自动暂停
4. 现在你可以：查看变量值、单步执行（F10）、跳入函数（F11）、查看调用堆栈

<TutorialDiagram name="debugpy-steps" />

## 常见问题

- **连接超时？** 检查 `ssh -N myserver` 是否仍在运行、两端端口是否一致，以及服务器的 debugpy 进程是否已启动。本方案不需要对外开放 5678；调试端口允许执行代码，应保持本机监听并通过 SSH 访问。[debugpy 说明](https://github.com/microsoft/debugpy/blob/main/README.md)
- **断点不生效？** 确认 `pathMappings` 中的 `remoteRoot` 和服务器上代码的实际路径一致。
- **在 Jupyter Notebook 里能用吗？** 本文针对 Python 脚本；Notebook 的内核和调试扩展配置需另行处理，不能直接套用这里的 `train.py` 启动命令。
- **多人同时调试？** 每个独立 debugpy 进程使用未占用的服务器端口，同时调整 SSH 转发和 `launch.json` 的本地端口。

<PostTags />
