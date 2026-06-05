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
---
## Preface

When debugging code on servers, many people still resort to the `print()` method — add a print, rerun, check output, add another print... repeat. It's inefficient, and you can't pause execution to inspect variable states.

With `debugpy` and your local VSCode / Cursor / Windsurf, you can set breakpoints on server-running code just like local debugging.

## How It Works

```
Local Editor (VSCode/Cursor/Windsurf)    ←→    debugpy (running on server)
     Awaits connection                              Listens on port 5678
     Sets breakpoints                               Pauses at breakpoints
     Inspects variables                             Sends variable state back
```

debugpy starts a debug server on the remote machine. Your local editor connects to it (typically through an SSH tunnel) for full remote debugging.

![Remote Debugging Architecture](/images/debugpy-architecture.svg)

## Step 1: Install debugpy on the Server

```bash
pip install debugpy
```

## Step 2: Configure SSH Tunnel (Optional but Recommended)

Add port forwarding to your **local** `~/.ssh/config`:

```
Host myserver
    HostName your-server-ip
    User your-username
    LocalForward 5678 localhost:5678
```

Now `localhost:5678` on your machine maps to port `5678` on the server.

If you don't set up an SSH tunnel, you can also connect directly using the server's IP:port.

## Step 3: Start the Debug Server

Wrap your Python command with `debugpy`:

```bash
python -m debugpy --listen 0.0.0.0:5678 --wait-for-client train.py
```

Options:
- `--listen 0.0.0.0:5678`: listen on port 5678 on all interfaces
- `--wait-for-client`: wait for the editor to connect before executing (useful for debugging from the very start)

To run without blocking, omit `--wait-for-client`:

```bash
python -m debugpy --listen 0.0.0.0:5678 train.py
```

## Step 4: Connect Your Local Editor

### VSCode

Add to `.vscode/launch.json`:

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

Cursor and Windsurf are built on VSCode, so the configuration is identical. Use the same `launch.json`, or select "Python: Remote Attach" from the Run and Debug panel.

![launch.json Key Configuration](/images/debugpy-vscode-config.svg)

## Step 5: Set Breakpoints & Debug

1. Click to the left of a line in your local code to set a red breakpoint
2. Press `F5` (or click the green play button) and select "Python: Remote Attach"
3. Code execution pauses automatically at your breakpoint
4. Now you can: inspect variable values, step over (F10), step into (F11), view the call stack

![Five Steps to Configure Remote Debugging](/images/debugpy-steps.svg)

## FAQ

- **Connection timeout?** Check if the server firewall allows port 5678, or verify your SSH tunnel configuration.
- **Breakpoints not hitting?** Make sure `pathMappings` `remoteRoot` matches the actual code path on the server.
- **Can I use this with Jupyter Notebooks?** Yes, but `%debug` or `ipdb` are better suited for notebook environments.
- **Multiple people debugging at once?** Assign different ports to each person — e.g., `5679`, `5680`.

<div class="post-tags-section">
  <span class="label">Tags:</span>
  <span class="tag-pill" v-for="tag in $frontmatter.tags" :key="tag">{{ tag }}</span>
</div>
