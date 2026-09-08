---
title: How to Remote Debug Code with VSCode, Cursor & Windsurf
date: 2025-09-30
tags:
  - vscode
  - cursor
  - windsurf
  - debug
  - remote
  - python
description: Stop debugging with print(). Use debugpy to set breakpoints, step through, and inspect variables on remotely running code — right from your local editor.
reviewed: 2026-09-07
scope: Linux server and OpenSSH; VS Code Python Debugger
---
## Preface

When debugging code on servers, many people still resort to the `print()` method — add a print, rerun, check output, add another print... repeat. It's inefficient, and you can't pause execution to inspect variable states.

With `debugpy` and your local VSCode / Cursor / Windsurf, you can set breakpoints on server-running code just like local debugging.

## How It Works

```
Local Editor (VSCode/Cursor/Windsurf)    ←→    debugpy (running on server)
     Initiates connection                              Listens on port 5678
     Sets breakpoints                               Pauses at breakpoints
     Inspects variables                             Sends variable state back
```

debugpy starts a debug server on the remote machine. Your local editor connects to it (typically through an SSH tunnel) for full remote debugging.

<TutorialDiagram name="debugpy-architecture" />

## Step 1: Install debugpy on the Server

Activate the virtual environment used for `train.py` so installation and launch use the same Python interpreter. This workflow uses a local editor window with a local checkout matching the code on the server.

```bash
python -m pip install debugpy
```

## Step 2: Establish an SSH Tunnel

Add port forwarding to your **local** `~/.ssh/config`:

```
Host myserver
    HostName your-server-ip
    User your-username
    LocalForward 127.0.0.1:5678 127.0.0.1:5678
    ExitOnForwardFailure yes
```

Replace the host address and username, then run this locally and keep the terminal connected:

```bash
ssh -N myserver
```

Saving the configuration does not start a tunnel. While SSH is connected, local `127.0.0.1:5678` forwards to `127.0.0.1:5678` on the server. Press `Ctrl+C` in this terminal when debugging is finished. [OpenSSH forwarding](https://man.openbsd.org/ssh_config#LocalForward)

## Step 3: Start the Debug Server

Wrap your Python command with `debugpy`:

```bash
python -m debugpy --listen 127.0.0.1:5678 --wait-for-client train.py
```

Options:
- `--listen 127.0.0.1:5678`: listen only on server loopback, reached through the SSH tunnel
- `--wait-for-client`: wait for the editor to connect before executing (useful for debugging from the very start)

To run without blocking, omit `--wait-for-client`:

```bash
python -m debugpy --listen 127.0.0.1:5678 train.py
```

## Step 4: Connect Your Local Editor

### VSCode

Install and enable the **Python Debugger** extension locally. Add this to `.vscode/launch.json`, replacing `remoteRoot` with the actual project path on the server:

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

First confirm your Cursor / Windsurf version supports an installed and enabled Python debugging extension, then use the same `debugpy` attach configuration. An unsupported `debugpy` type usually calls for checking the extension and where it runs; VSCode ancestry alone does not ensure extension compatibility. [VS Code debugging documentation](https://code.visualstudio.com/docs/python/debugging)

<TutorialDiagram name="debugpy-vscode-config" />

## Step 5: Set Breakpoints & Debug

1. Click to the left of a line in your local code to set a red breakpoint
2. Press `F5` (or click the green play button) and select "Python: Remote Attach"
3. Code execution pauses automatically at your breakpoint
4. Now you can: inspect variable values, step over (F10), step into (F11), view the call stack

<TutorialDiagram name="debugpy-steps" />

## FAQ

- **Connection timeout?** Check that `ssh -N myserver` is still connected, both ends use the intended ports, and debugpy is running. This setup requires no public port 5678. A debugger can execute code, so keep it bound to loopback and access it through SSH. [debugpy documentation](https://github.com/microsoft/debugpy/blob/main/README.md)
- **Breakpoints not hitting?** Make sure `pathMappings` `remoteRoot` matches the actual code path on the server.
- **Can I use this with Jupyter Notebooks?** This tutorial covers Python scripts. Notebook kernels and debugging extensions need their own setup; the `train.py` launch command does not apply directly.
- **Multiple people debugging at once?** Give each independent debugpy process an available server port and adjust the SSH forwarding and local `launch.json` port accordingly.

<PostTags />
